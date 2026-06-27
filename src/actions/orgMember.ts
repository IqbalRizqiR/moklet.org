"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canManageMembers } from "@/utils/permissions";
import { bulkGrantFromTemplate, grantPermission, revokePermission } from "@/utils/database/orgPermission.query";
import { dispatchNotification } from "@/lib/whatsapp";
import { pingPermissionUpdate } from "@/utils/realtime";

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
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true }
  });
  if (existing) {
    return { error: true, message: "Email sudah terdaftar. Gunakan fitur 'Tambah Anggota' untuk user yang sudah terdaftar." };
  }

  try {
    const [role, org] = await Promise.all([
      prisma.org_Custom_Role.findUnique({
        where: { id: orgRoleId },
        select: { name: true },
      }),
      prisma.organisasi.findUnique({
        where: { id: organisasiId },
        select: { organisasi: true },
      })
    ]);

    // Map organization to system Role enum if it exists, otherwise keep as Guest
    const systemRole = org?.organisasi ? (org.organisasi as any) : "Guest";

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: systemRole,
        user_pic: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=E04E4E&color=fff`,
        memberships: {
          create: {
            organisasi_id: organisasiId,
            role_id: orgRoleId,
            is_main: true
          }
        },
        userAuth: {
          create: {} // Prisma automatically links userEmail
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        user_pic: true,
        memberships: {
          where: { organisasi_id: organisasiId },
          include: { role: { include: { level: true } } }
        },
        permissions: { where: { organisasi_id: organisasiId } },
      },
    });


    // Notify org leaders
    const leaders = await prisma.user.findMany({
      where: {
        memberships: {
          some: {
            organisasi_id: organisasiId,
            role: { is_leader: true }
          }
        },
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
        recipientIds: leaders.map((l: any) => l.id),
        organisasiId,
      }).catch(() => {});
    }

    // Ping user for real-time permission update
    await pingPermissionUpdate(newUser.id);

    revalidatePath("/admin/organisasi");
    revalidatePath("/");
    return {
      error: false,
      message: `Berhasil mendaftarkan ${name}`,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        user_pic: newUser.user_pic,
        org_role: newUser.memberships[0]?.role
          ? {
              id: newUser.memberships[0].role.id,
              name: newUser.memberships[0].role.name,
              is_leader: newUser.memberships[0].role.is_leader,
              hierarchy_level: newUser.memberships[0].role.hierarchy_level,
              level_id: newUser.memberships[0].role.level_id,
              level: newUser.memberships[0].role.level
                ? { id: newUser.memberships[0].role.level.id, name: newUser.memberships[0].role.level.name, order: newUser.memberships[0].role.level.order }
                : null,
            }
          : null,
        permissions: newUser.permissions.map((p: any) => ({ id: p.id, permission: p.permission })),
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
    const [roleToAssign, targetOrg, userMemberships] = await Promise.all([
      prisma.org_Custom_Role.findUnique({
        where: { id: orgRoleId },
        select: { name: true, is_leader: true },
      }),
      prisma.organisasi.findUnique({
        where: { id: organisasiId },
        select: { organisasi: true }
      }),
      prisma.org_Member.findMany({
        where: { user_id: userId },
        include: { organisasi: { select: { organisasi: true } } }
      })
    ]);

    if (!roleToAssign || !targetOrg) {
      return { error: true, message: "Role atau organisasi tidak ditemukan" };
    }

    // OSIS/MPK Exclusivity check
    const isTargetOsisMpk = targetOrg.organisasi === "OSIS" || targetOrg.organisasi === "MPK";
    const existingOsisMpk = userMemberships.find((m: any) => m.organisasi.organisasi === "OSIS" || m.organisasi.organisasi === "MPK");
    
    if (isTargetOsisMpk && existingOsisMpk && existingOsisMpk.organisasi_id !== organisasiId) {
      return { error: true, message: `User sudah memiliki role di ${existingOsisMpk.organisasi.organisasi}. Tidak bisa menjadi OSIS dan MPK sekaligus.` };
    }

    if (roleToAssign.is_leader) {
      const existingLeaderCount = await prisma.org_Member.count({
        where: {
          organisasi_id: organisasiId,
          role: { is_leader: true },
          NOT: { user_id: userId }
        }
      });
      if (existingLeaderCount > 0) {
        return { error: true, message: `Sudah ada anggota dengan role Leader. Hanya boleh 1 leader per organisasi.` };
      }
    }

    // Determine if this should be the main membership
    let shouldBeMain = userMemberships.length === 0 || isTargetOsisMpk;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (shouldBeMain) {
        // Unset previous mains
        await tx.org_Member.updateMany({
          where: { user_id: userId, is_main: true },
          data: { is_main: false }
        });
      }

      await tx.org_Member.upsert({
        where: {
          user_id_organisasi_id: {
            user_id: userId,
            organisasi_id: organisasiId
          }
        },
        create: {
          user_id: userId,
          organisasi_id: organisasiId,
          role_id: orgRoleId,
          is_main: shouldBeMain
        },
        update: {
          role_id: orgRoleId,
          is_main: shouldBeMain
        }
      });

      if (shouldBeMain) {
        await tx.user.update({
          where: { id: userId },
          data: { role: targetOrg.organisasi as any }
        });
      }
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        user_pic: true,
        memberships: {
          where: { organisasi_id: organisasiId },
          include: { role: { include: { level: true } } }
        },
        permissions: { where: { organisasi_id: organisasiId } },
      },
    });

    if (!updatedUser) throw new Error("User not found after update");

    const role = updatedUser.memberships[0]?.role;

    // Notify org leaders + the new member
    const leaders = await prisma.user.findMany({
      where: {
        memberships: {
          some: {
            organisasi_id: organisasiId,
            role: { is_leader: true }
          }
        },
        NOT: { id: session.user.id },
      },
      select: { id: true },
    });

    const recipientIds = [...new Set([
      ...leaders.map((l: any) => l.id),
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

    // Ping user for real-time permission update
    await pingPermissionUpdate(userId);

    revalidatePath("/admin/organisasi");
    revalidatePath("/");
    return {
      error: false,
      message: "Berhasil menambah anggota",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        user_pic: updatedUser.user_pic,
        org_role: updatedUser.memberships[0]?.role
          ? {
              id: updatedUser.memberships[0].role.id,
              name: updatedUser.memberships[0].role.name,
              is_leader: updatedUser.memberships[0].role.is_leader,
              hierarchy_level: updatedUser.memberships[0].role.hierarchy_level,
              level_id: updatedUser.memberships[0].role.level_id,
              level: updatedUser.memberships[0].role.level
                ? { id: updatedUser.memberships[0].role.level.id, name: updatedUser.memberships[0].role.level.name, order: updatedUser.memberships[0].role.level.order }
                : null,
            }
          : null,
        permissions: updatedUser.permissions.map((p: any) => ({ id: p.id, permission: p.permission })),
      },
    };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal menambah anggota" };
  }
}

// Remove a user from their organisation
export async function removeFromOrg(userId: string, organisasiId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      memberships: {
        select: {
          organisasi_id: true,
          is_main: true
        }
      }
    }
  });
  
  if (!targetUser) return { error: true, message: "User tidak ditemukan" };
  
  const membershipToRemove = targetUser.memberships.find((m: any) => m.organisasi_id === organisasiId);
  if (!membershipToRemove)
    return { error: true, message: "User tidak tergabung organisasi ini" };

  try {
    // Remove org assignment and all permissions
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.org_Member.delete({
        where: {
          user_id_organisasi_id: {
            user_id: userId,
            organisasi_id: organisasiId
          }
        }
      });
      
      await tx.org_Permission.deleteMany({
        where: { user_id: userId, organisasi_id: organisasiId },
      });

      // If we removed the main membership, reassign main to another one if available
      if (membershipToRemove.is_main) {
        const remainingMembership = await tx.org_Member.findFirst({
          where: { user_id: userId },
          include: { organisasi: true }
        });

        if (remainingMembership) {
          await tx.org_Member.update({
            where: { id: remainingMembership.id },
            data: { is_main: true }
          });
          
          if (targetUser.role !== "SuperAdmin" && targetUser.role !== "Admin") {
            await tx.user.update({
              where: { id: userId },
              data: { role: remainingMembership.organisasi.organisasi as any }
            });
          }
        } else {
          // No memberships left
          if (targetUser.role !== "SuperAdmin" && targetUser.role !== "Admin") {
            await tx.user.update({
              where: { id: userId },
              data: { role: "Guest" }
            });
          }
        }
      }
    });

    // Notify org leaders
    const leaders = await prisma.user.findMany({
      where: {
        memberships: {
          some: {
            organisasi_id: organisasiId,
            role: { is_leader: true }
          }
        },
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
        recipientIds: leaders.map((l: any) => l.id),
        organisasiId,
      }).catch(() => {});
    }

    // Ping user for real-time permission update
    await pingPermissionUpdate(userId);

    revalidatePath("/admin/organisasi");
    revalidatePath("/");
    return { error: false, message: "Berhasil menghapus anggota" };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal menghapus anggota" };
  }
}

// Update a member's org role
export async function updateOrgRole(userId: string, organisasiId: string, orgRoleId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageMembers(session.user.id, organisasiId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    const roleToAssign = await prisma.org_Custom_Role.findUnique({
      where: { id: orgRoleId },
      select: { name: true, is_leader: true },
    });

    if (!roleToAssign) {
      return { error: true, message: "Role tidak ditemukan" };
    }

    if (roleToAssign.is_leader) {
      const existingLeaderCount = await prisma.org_Member.count({
        where: {
          organisasi_id: organisasiId,
          role: { is_leader: true },
          NOT: { user_id: userId } 
        }
      });
      if (existingLeaderCount > 0) {
        return { error: true, message: `Sudah ada anggota dengan role Leader. Hanya boleh 1 leader per organisasi.` };
      }
    }

    await prisma.org_Member.update({
      where: {
        user_id_organisasi_id: {
          user_id: userId,
          organisasi_id: organisasiId
        }
      },
      data: { role_id: orgRoleId },
    });

    // Notify the affected user + org leaders
    const leaders = await prisma.user.findMany({
      where: {
        memberships: {
          some: {
            organisasi_id: organisasiId,
            role: { is_leader: true }
          }
        },
        NOT: { id: session.user.id },
      },
      select: { id: true },
    });

    const recipientIds = [...new Set([
      ...leaders.map((l: any) => l.id),
      userId,
    ].filter((id) => id !== session.user.id))];

    if (recipientIds.length > 0) {
      const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      dispatchNotification({
        type: "role_changed",
        title: "Role Anggota Diubah",
        message: `Role ${targetUser?.name ?? "Anggota"} diubah menjadi ${roleToAssign.name} oleh ${session.user.name ?? "Admin"}.`,
        targetUrl: `/admin/organisasi`,
        actorId: session.user.id,
        recipientIds,
        organisasiId,
      }).catch(() => {});
    }

    // Ping user for real-time permission update
    await pingPermissionUpdate(userId);

    revalidatePath("/admin/organisasi");
    revalidatePath("/");
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
    await pingPermissionUpdate(userId);

    const updatedPerms = await prisma.org_Permission.findMany({
      where: { user_id: userId, organisasi_id: organisasiId },
      select: { id: true, permission: true },
    });

    revalidatePath("/admin/organisasi");
    revalidatePath("/");
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
    await pingPermissionUpdate(userId);
    revalidatePath("/admin/organisasi");
    revalidatePath("/");
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
    await pingPermissionUpdate(userId);
    revalidatePath("/admin/organisasi");
    revalidatePath("/");
    return { error: false, message: "Permission dicabut" };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal mencabut permission" };
  }
}
