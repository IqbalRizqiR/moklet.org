"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canManageMembers } from "@/utils/permissions";

export async function createLevel(organisasiId: string, name: string, order: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    const level = await prisma.org_Level.create({
      data: { name, order, organisasi_id: organisasiId },
    });
    revalidatePath("/admin/organisasi");
    return { error: false, message: "Level berhasil dibuat", data: level };
  } catch {
    return { error: true, message: "Gagal membuat level. Nama mungkin sudah digunakan." };
  }
}

export async function updateLevel(levelId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const level = await prisma.org_Level.findUnique({ where: { id: levelId } });
  if (!level) return { error: true, message: "Level tidak ditemukan" };

  const hasAccess = await canManageMembers(session.user.id, level.organisasi_id);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    await prisma.org_Level.update({ where: { id: levelId }, data: { name } });
    revalidatePath("/admin/organisasi");
    return { error: false, message: "Level berhasil diupdate" };
  } catch {
    return { error: true, message: "Gagal mengupdate level" };
  }
}

export async function deleteLevel(levelId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const level = await prisma.org_Level.findUnique({
    where: { id: levelId },
    include: { roles: { include: { users: true } } },
  });
  if (!level) return { error: true, message: "Level tidak ditemukan" };

  const hasAccess = await canManageMembers(session.user.id, level.organisasi_id);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  const usedRoles = level.roles.filter((r) => r.users.length > 0);
  if (usedRoles.length > 0) {
    return { error: true, message: "Hapus dulu role yang masih digunakan di level ini" };
  }

  try {
    await prisma.org_Level.delete({ where: { id: levelId } });
    revalidatePath("/admin/organisasi");
    return { error: false, message: "Level berhasil dihapus" };
  } catch {
    return { error: true, message: "Gagal menghapus level" };
  }
}

export async function reorderLevels(organisasiId: string, items: { id: string; order: number }[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.org_Level.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );
    revalidatePath("/admin/organisasi");
    return { error: false, message: "Urutan level berhasil disimpan" };
  } catch {
    return { error: true, message: "Gagal menyimpan urutan" };
  }
}
