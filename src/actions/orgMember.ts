"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canManageMembers } from "@/utils/permissions";
import { bulkGrantFromTemplate, grantPermission, revokePermission } from "@/utils/database/orgPermission.query";
import { dispatchNotification } from "@/lib/whatsapp";

// Register a new user and assign them to an organisation in one step
// Used when the member isn't yet in the system
export async function registerAndAssign(
  name: string,
  email: string,
  organisasiId: string,
  orgRoleId: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  if (!name.trim() || !email.trim()) {
    return { error: true, message: "Nama dan email wajib diisi" };
  }

  // Check if email is already registered
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: true, message: "Email sudah terdaftar. Gunakan fitur 'Tambah Anggota' untuk user yang sudah terdaftar." };
  }

  try {
    const role = await prisma.org_Custom_Role.findUnique({
      where: { id: orgRoleId },
      select: { name: true },
    });

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "Guest",
        user_pic: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=E04E4E&color=fff`,
        organisasi_id: organisasiId,
        org_role_id: orgRoleId,
      },
      include: {
        org_role: { include: { level: true } },
        permissions: { where: { organisasi_id: organisasiId } },
      },
    });

    // Notify org leaders
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
        type: "member_registered",
        title: "Anggota Baru Didaftarkan",
        message: `${name} telah didaftarkan sebagai ${role?.name ?? "anggota"} oleh ${session.user.name ?? "Admin"}.`,
        targetUrl: `/admin/organisasi`,
        actorId: session.user.id,
        recipientIds: leaders.map((l) => l.id),
        organisasiId,
      }).catch(() => {});
    }

    revalidatePath("/admin/organisasi");
    return {
      error: false,
      message: `Berhasil mendaftarkan ${name}`,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        user_pic: newUser.user_pic,
        org_role: newUser.org_role
          ? {
              id: newUser.org_role.id,
              name: newUser.org_role.name,
              is_leader: newUser.org_role.is_leader,
              hierarchy_level: newUser.org_role.hierarchy_level,
              level_id: newUser.org_role.level_id,
              level: newUser.org_role.level
                ? { id: newUser.org_role.level.id, name: newUser.org_role.level.name, order: newUser.org_role.level.order }
                : null,
            }
          : null,
        permissions: newUser.permissions.map((p) => ({ id: p.id, permission: p.permission })),
      },
    };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal mendaftarkan anggota" };
  }
}

// Assign a user to an organisation with a custom role
export async function assignToOrg(
  userId: string,
  organisasiId: string,
  orgRoleId: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        organisasi_id: organisasiId,
        org_role_id: orgRoleId,
      },
      include: {
        org_role: { include: { level: true } },
        permissions: { where: { organisasi_id: organisasiId } },
      },
    });

    const role = updatedUser.org_role;

    // Notify org leaders + the new member
    const leaders = await prisma.user.findMany({
      where: {
        organisasi_id: organisasiId,
        org_role: { is_leader: true },
        NOT: { id: session.user.id },
      },
      select: { id: true },
    });

    const recipientIds = [...new Set([
      ...leaders.map((l) => l.id),
      userId,
    ].filter((id) => id !== session.user.id))];

    if (recipientIds.length > 0) {
      dispatchNotification({
        type: "member_added",
        title: "Anggota Baru Ditambahkan",
        message: `${updatedUser.name} telah ditambahkan sebagai ${role?.name ?? "anggota"} oleh ${session.user.name ?? "Admin"}.`,
        targetUrl: `/admin/organisasi`,
        actorId: session.user.id,
        recipientIds,
        organisasiId,
      }).catch(() => {});
    }

    revalidatePath("/admin/organisasi");
    return {
      error: false,
      message: "Berhasil menambah anggota",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        user_pic: updatedUser.user_pic,
        org_role: updatedUser.org_role
          ? {
              id: updatedUser.org_role.id,
              name: updatedUser.org_role.name,
              is_leader: updatedUser.org_role.is_leader,
              hierarchy_level: updatedUser.org_role.hierarchy_level,
              level_id: updatedUser.org_role.level_id,
              level: updatedUser.org_role.level
                ? { id: updatedUser.org_role.level.id, name: updatedUser.org_role.level.name, order: updatedUser.org_role.level.order }
                : null,
            }
          : null,
        permissions: updatedUser.permissions.map((p) => ({ id: p.id, permission: p.permission })),
      },
    };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal menambah anggota" };
  }
}

// Remove a user from their organisation
export async function removeFromOrg(userId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser?.organisasi_id)
    return { error: true, message: "User tidak tergabung organisasi" };

  const organisasiId = targetUser.organisasi_id;
  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    // Remove org assignment and all permissions
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { organisasi_id: null, org_role_id: null },
      }),
      prisma.org_Permission.deleteMany({
        where: { user_id: userId, organisasi_id: organisasiId },
      }),
    ]);

    // Notify org leaders
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
        type: "member_removed",
        title: "Anggota Dihapus",
        message: `${targetUser.name} telah dihapus dari organisasi oleh ${session.user.name ?? "Admin"}.`,
        targetUrl: `/admin/organisasi`,
        actorId: session.user.id,
        recipientIds: leaders.map((l) => l.id),
        organisasiId,
      }).catch(() => {});
    }

    revalidatePath("/admin/organisasi");
    return { error: false, message: "Berhasil menghapus anggota" };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal menghapus anggota" };
  }
}

// Update a member's org role
export async function updateOrgRole(userId: string, orgRoleId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser?.organisasi_id)
    return { error: true, message: "User tidak tergabung organisasi" };

  const organisasiId = targetUser.organisasi_id;
  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    const [, role] = await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: { org_role_id: orgRoleId },
      }),
      prisma.org_Custom_Role.findUnique({
        where: { id: orgRoleId },
        select: { name: true },
      }),
    ]);

    // Notify the affected user + org leaders
    const leaders = await prisma.user.findMany({
      where: {
        organisasi_id: organisasiId,
        org_role: { is_leader: true },
        NOT: { id: session.user.id },
      },
      select: { id: true },
    });

    const recipientIds = [...new Set([
      ...leaders.map((l) => l.id),
      userId,
    ].filter((id) => id !== session.user.id))];

    if (recipientIds.length > 0) {
      dispatchNotification({
        type: "role_changed",
        title: "Role Anggota Diubah",
        message: `Role ${targetUser.name} diubah menjadi ${role?.name ?? "unknown"} oleh ${session.user.name ?? "Admin"}.`,
        targetUrl: `/admin/organisasi`,
        actorId: session.user.id,
        recipientIds,
        organisasiId,
      }).catch(() => {});
    }

    revalidatePath("/admin/organisasi");
    return { error: false, message: "Berhasil mengubah role" };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal mengubah role" };
  }
}

// Assign a permission template to a member
export async function assignTemplateAction(
  userId: string,
  organisasiId: string,
  templateId: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    await bulkGrantFromTemplate(userId, organisasiId, templateId, session.user.id);

    const updatedPerms = await prisma.org_Permission.findMany({
      where: { user_id: userId, organisasi_id: organisasiId },
      select: { id: true, permission: true },
    });

    revalidatePath("/admin/organisasi");
    return {
      error: false,
      message: "Berhasil memberikan permission",
      data: { permissions: updatedPerms },
    };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal memberikan permission" };
  }
}

// Grant a single permission
export async function grantPermissionAction(
  userId: string,
  organisasiId: string,
  permission: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    await grantPermission(userId, organisasiId, permission, session.user.id);
    revalidatePath("/admin/organisasi");
    return { error: false, message: "Permission diberikan" };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal memberikan permission" };
  }
}

// Revoke a single permission
export async function revokePermissionAction(
  userId: string,
  organisasiId: string,
  permission: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    await revokePermission(userId, organisasiId, permission);
    revalidatePath("/admin/organisasi");
    return { error: false, message: "Permission dicabut" };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal mencabut permission" };
  }
}
