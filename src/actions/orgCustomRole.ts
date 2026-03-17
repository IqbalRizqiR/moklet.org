"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canManageMembers } from "@/utils/permissions";
import { dispatchNotification } from "@/lib/whatsapp";

export async function createRoleAction(
  organisasiId: string,
  name: string,
  isLeader: boolean = false,
  hierarchyLevel: number = 5,
  levelId?: string | null,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  if (isLeader) {
    const existingLeader = await prisma.org_Custom_Role.findFirst({
      where: { organisasi_id: organisasiId, is_leader: true },
    });
    if (existingLeader) {
      return { error: true, message: `Sudah ada role leader: "${existingLeader.name}". Hanya boleh 1 leader per organisasi.` };
    }
  }

  try {
    const role = await prisma.org_Custom_Role.create({
      data: {
        name,
        organisasi_id: organisasiId,
        is_leader: isLeader,
        hierarchy_level: Math.max(0, Math.min(9, hierarchyLevel)),
        level_id: levelId || null,
      },
      include: { level: true },
    });

    const leaders = await prisma.user.findMany({
      where: {
        organisasi_id: organisasiId,
        org_role: { is_leader: true },
        NOT: { id: session.user.id },
      },
      select: { id: true },
    });

    if (leaders.length > 0) {
      dispatchNotification({
        type: "role_created",
        title: "Role Baru Dibuat",
        message: `Role "${name}" telah dibuat oleh ${session.user.name ?? "Admin"}.`,
        targetUrl: `/admin/organisasi`,
        actorId: session.user.id,
        recipientIds: leaders.map((l) => l.id),
        organisasiId,
      }).catch(() => {});
    }

    revalidatePath("/admin/organisasi");
    return { error: false, message: "Role berhasil dibuat", data: role };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal membuat role. Nama mungkin sudah digunakan." };
  }
}

export async function updateRoleAction(
  roleId: string,
  name: string,
  isLeader: boolean,
  hierarchyLevel: number = 5,
  levelId?: string | null,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const role = await prisma.org_Custom_Role.findUnique({
    where: { id: roleId },
  });
  if (!role) return { error: true, message: "Role tidak ditemukan" };

  const hasAccess = await canManageMembers(session.user.id, role.organisasi_id);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  if (isLeader && !role.is_leader) {
    const existingLeader = await prisma.org_Custom_Role.findFirst({
      where: { organisasi_id: role.organisasi_id, is_leader: true, NOT: { id: roleId } },
    });
    if (existingLeader) {
      return { error: true, message: `Sudah ada role leader: "${existingLeader.name}". Hanya boleh 1 leader per organisasi.` };
    }
  }

  try {
    await prisma.org_Custom_Role.update({
      where: { id: roleId },
      data: {
        name,
        is_leader: isLeader,
        hierarchy_level: Math.max(0, Math.min(9, hierarchyLevel)),
        level_id: levelId !== undefined ? (levelId || null) : undefined,
      },
    });

    revalidatePath("/admin/organisasi");
    return { error: false, message: "Role berhasil diupdate" };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal mengupdate role" };
  }
}

export async function deleteRoleAction(roleId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const role = await prisma.org_Custom_Role.findUnique({
    where: { id: roleId },
    include: { users: true },
  });
  if (!role) return { error: true, message: "Role tidak ditemukan" };

  const hasAccess = await canManageMembers(session.user.id, role.organisasi_id);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  if (role.users.length > 0) {
    return { error: true, message: "Tidak bisa menghapus role yang masih digunakan" };
  }

  try {
    await prisma.org_Custom_Role.delete({ where: { id: roleId } });
    revalidatePath("/admin/organisasi");
    return { error: false, message: "Role berhasil dihapus" };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal menghapus role" };
  }
}
