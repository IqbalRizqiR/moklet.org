import prisma from "@/lib/prisma";
import { checkPermission } from "@/utils/database/orgPermission.query";

// Check if a user is an org leader (has a custom role marked as leader)
export const isOrgLeader = async (
  userId: string,
  organisasiId: string,
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { org_role: true },
  });

  if (!user || user.organisasi_id !== organisasiId) return false;
  return user.org_role?.is_leader ?? false;
};

// Check if user can edit org info
export const canEditOrgInfo = async (
  userId: string,
  organisasiId: string,
): Promise<boolean> => {
  // SuperAdmin/Admin can always edit
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  if (user.role === "SuperAdmin" || user.role === "Admin") return true;

  // Check if user is leader of this org
  if (await isOrgLeader(userId, organisasiId)) return true;

  // Check explicit permission
  return await checkPermission(userId, organisasiId, "edit_org_info");
};

// Check if user can edit structure
export const canEditStructure = async (
  userId: string,
  organisasiId: string,
): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
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
  const user = await prisma.user.findUnique({ where: { id: userId } });
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
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  if (user.role === "SuperAdmin" || user.role === "Admin") return true;
  if (await isOrgLeader(userId, organisasiId)) return true;
  return await checkPermission(userId, organisasiId, "manage_members");
};

// Re-export constants for backward compatibility
export { AVAILABLE_PERMISSIONS, type PermissionKey } from "@/utils/permissions.constants";
