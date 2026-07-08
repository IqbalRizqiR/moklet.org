import prisma from "@/lib/prisma";
import { checkPermission } from "@/utils/database/orgPermission.query";
import { Organisasi_Type } from "@prisma/client";
import { findLatestPeriod } from "@/utils/database/periodYear.query";
import { findOrganisasi } from "@/utils/database/organisasi.query";

// Check if a user is an org leader (has a custom role marked as leader)
export const isOrgLeader = async (
  userId: string,
  organisasiId: string,
): Promise<boolean> => {
  const membership = await prisma.org_Member.findUnique({
    where: {
      user_id_organisasi_id: {
        user_id: userId,
        organisasi_id: organisasiId
      }
    },
    include: { role: true },
  });

  return membership?.role?.is_leader ?? false;
};

// Check if user can edit org info
export const canEditOrgInfo = async (
  userId: string,
  organisasiId: string,
): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return false;
  if (user.role === "SuperAdmin" || user.role === "Admin") return true;

  if (await isOrgLeader(userId, organisasiId)) return true;

  return await checkPermission(userId, organisasiId, "edit_org_info");
};

// Check if user can edit structure
export const canEditStructure = async (
  userId: string,
  organisasiId: string,
): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return false;
  if (user.role === "SuperAdmin" || user.role === "Admin") return true;
  if (await isOrgLeader(userId, organisasiId)) return true;
  return await checkPermission(userId, organisasiId, "edit_structure");
};

// Check if user can publish posts for an org
export const canPublishPost = async (
  userId: string,
  organisasiId: string,
): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return false;
  if (user.role === "SuperAdmin" || user.role === "Admin") return true;
  if (await isOrgLeader(userId, organisasiId)) return true;
  return await checkPermission(userId, organisasiId, "publish_post");
};

// Check if user can manage members (add/remove/change roles)
export const canManageMembers = async (
  userId: string,
  organisasiId: string,
): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return false;
  if (user.role === "SuperAdmin" || user.role === "Admin") return true;
  if (await isOrgLeader(userId, organisasiId)) return true;
  return await checkPermission(userId, organisasiId, "manage_members");
};

// --- RECRUITMENT PERMISSIONS ---

export const canManageRecruitment = async (
  userId: string,
  orgTypeString: string,
): Promise<{ hasAccess: boolean; currentOrgId?: string }> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return { hasAccess: false };
  if (user.role === "SuperAdmin" || user.role === "Admin") return { hasAccess: true };

  const currentPeriod = await findLatestPeriod(true);
  if (!currentPeriod) return { hasAccess: false };

  const currentOrg = await findOrganisasi({
    organisasi_period_id: {
      period_id: currentPeriod.id,
      organisasi: orgTypeString.toUpperCase() as Organisasi_Type,
    },
  });

  if (!currentOrg) return { hasAccess: false };

  if (await isOrgLeader(userId, currentOrg.id)) {
    return { hasAccess: true, currentOrgId: currentOrg.id };
  }

  if (await checkPermission(userId, currentOrg.id, "manage_recruitment")) {
    return { hasAccess: true, currentOrgId: currentOrg.id };
  }

  return { hasAccess: false };
};

// --- EVENT PERMISSIONS ---

// Check if a user is an event leader (has a custom role marked as leader)
export const isEventLeader = async (
  userId: string,
  eventId: string,
): Promise<boolean> => {
  const membership = await prisma.event_Member.findUnique({
    where: {
      user_id_event_id: {
        user_id: userId,
        event_id: eventId
      }
    },
    include: { role: true },
  });

  return membership?.role?.is_leader ?? false;
};

// Check if a user can widely manage an event (add levels, edit roles)
export const canManageEvent = async (
  userId: string,
  eventId: string,
): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return false;
  if (user.role === "SuperAdmin" || user.role === "Admin") return true;

  // The event leader can do anything
  if (await isEventLeader(userId, eventId)) return true;

  // Or if the user is the leader of the organization that owns this event
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (event?.organisasi_id && await isOrgLeader(userId, event.organisasi_id)) return true;

  return false;
};

// Re-export constants for backward compatibility
export { AVAILABLE_PERMISSIONS, type PermissionKey } from "@/utils/permissions.constants";
