"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canManageEvent } from "@/utils/permissions";

export async function createEventLevelAction(
  eventId: string,
  name: string,
  order: number = 0
) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageEvent(session.user.id, eventId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  try {
    const level = await prisma.event_Level.create({
      data: {
        event_id: eventId,
        name,
        order,
      },
    });

    revalidatePath(`/admin/events/${eventId}/committee`);
    return { error: false, message: "Level berhasil dibuat", data: level };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: true, message: "Level dengan nama tersebut sudah ada" };
    }
    return { error: true, message: "Gagal membuat level" };
  }
}

export async function createEventRoleAction(
  eventId: string,
  name: string,
  isLeader: boolean = false,
  hierarchyLevel: number = 5,
  levelId?: string | null,
  permissions: {
    can_edit_rundown?: boolean;
    can_manage_task?: boolean;
    can_manage_budget?: boolean;
    can_post_news?: boolean;
  } = {}
) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageEvent(session.user.id, eventId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  if (isLeader) {
    const existingLeader = await prisma.event_Custom_Role.findFirst({
      where: { event_id: eventId, is_leader: true },
    });
    if (existingLeader) {
      return { error: true, message: `Sudah ada role leader: "${existingLeader.name}". Hanya boleh 1 leader per event.` };
    }
  }

  try {
    const role = await prisma.event_Custom_Role.create({
      data: {
        name,
        event_id: eventId,
        is_leader: isLeader,
        hierarchy_level: Math.max(0, Math.min(9, hierarchyLevel)),
        level_id: levelId || null,
        ...permissions,
      },
    });

    revalidatePath(`/admin/events/${eventId}/committee`);
    return { error: false, message: "Role berhasil dibuat", data: role };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: true, message: "Role dengan nama tersebut sudah ada" };
    }
    return { error: true, message: "Gagal membuat role" };
  }
}

export async function updateEventRoleAction(
  roleId: string,
  eventId: string,
  name: string,
  isLeader: boolean = false,
  hierarchyLevel: number = 5,
  levelId?: string | null,
  permissions: {
    can_edit_rundown?: boolean;
    can_manage_task?: boolean;
    can_manage_budget?: boolean;
    can_post_news?: boolean;
  } = {}
) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageEvent(session.user.id, eventId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses" };

  if (isLeader) {
    const existingLeader = await prisma.event_Custom_Role.findFirst({
      where: { event_id: eventId, is_leader: true, id: { not: roleId } },
    });
    if (existingLeader) {
      return { error: true, message: `Sudah ada role leader: "${existingLeader.name}". Hanya boleh 1 leader per event.` };
    }
  }

  try {
    const role = await prisma.event_Custom_Role.update({
      where: { id: roleId },
      data: {
        name,
        is_leader: isLeader,
        hierarchy_level: Math.max(0, Math.min(9, hierarchyLevel)),
        level_id: levelId || null,
        ...permissions,
      },
    });

    revalidatePath(`/admin/events/${eventId}/committee`);
    return { error: false, message: "Role berhasil diupdate", data: role };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: true, message: "Role dengan nama tersebut sudah ada" };
    }
    return { error: true, message: "Gagal update role" };
  }
}

export async function deleteEventLevelAction(levelId: string, eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  if (!(await canManageEvent(session.user.id, eventId))) {
    return { error: true, message: "Tidak punya akses" };
  }

  try {
    await prisma.event_Level.delete({ where: { id: levelId } });
    revalidatePath(`/admin/events/${eventId}/committee`);
    return { error: false, message: "Level berhasil dihapus" };
  } catch (err) {
    return { error: true, message: "Gagal menghapus level" };
  }
}

export async function deleteEventRoleAction(roleId: string, eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  if (!(await canManageEvent(session.user.id, eventId))) {
    return { error: true, message: "Tidak punya akses" };
  }

  try {
    await prisma.event_Custom_Role.delete({ where: { id: roleId } });
    revalidatePath(`/admin/events/${eventId}/committee`);
    return { error: false, message: "Role berhasil dihapus" };
  } catch (err) {
    return { error: true, message: "Gagal menghapus role" };
  }
}

export async function assignEventMemberAction(eventId: string, userId: string, roleId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  if (!(await canManageEvent(session.user.id, eventId))) {
    return { error: true, message: "Tidak punya akses" };
  }

  try {
    const membership = await prisma.event_Member.upsert({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: eventId,
        },
      },
      update: { role_id: roleId },
      create: {
        user_id: userId,
        event_id: eventId,
        role_id: roleId,
      },
    });

    revalidatePath(`/admin/events/${eventId}/committee`);
    return { error: false, message: "Member berhasil di-assign", data: membership };
  } catch (err) {
    return { error: true, message: "Gagal assign member" };
  }
}
