import prisma from "@/lib/prisma";

// Grant a permission to a user for a specific org
export const grantPermission = async (
  userId: string,
  organisasiId: string,
  permission: string,
  grantedBy: string,
) => {
  return await prisma.org_Permission.upsert({
    where: {
      user_id_organisasi_id_permission: {
        user_id: userId,
        organisasi_id: organisasiId,
        permission,
      },
    },
    update: { granted_by: grantedBy, granted_at: new Date() },
    create: {
      user_id: userId,
      organisasi_id: organisasiId,
      permission,
      granted_by: grantedBy,
    },
  });
};

// Revoke a permission
export const revokePermission = async (
  userId: string,
  organisasiId: string,
  permission: string,
) => {
  return await prisma.org_Permission.delete({
    where: {
      user_id_organisasi_id_permission: {
        user_id: userId,
        organisasi_id: organisasiId,
        permission,
      },
    },
  });
};

// Check if user has a specific permission in an org
export const checkPermission = async (
  userId: string,
  organisasiId: string,
  permission: string,
): Promise<boolean> => {
  const perm = await prisma.org_Permission.findUnique({
    where: {
      user_id_organisasi_id_permission: {
        user_id: userId,
        organisasi_id: organisasiId,
        permission,
      },
    },
  });
  return !!perm;
};

// Get all permissions for a user in an org
export const getUserPermissions = async (
  userId: string,
  organisasiId: string,
) => {
  return await prisma.org_Permission.findMany({
    where: { user_id: userId, organisasi_id: organisasiId },
  });
};

// Bulk grant permissions from a template
export const bulkGrantFromTemplate = async (
  userId: string,
  organisasiId: string,
  templateId: string,
  grantedBy: string,
) => {
  const template = await prisma.permission_Template.findUnique({
    where: { id: templateId },
    include: { items: true },
  });

  if (!template) throw new Error("Template not found");

  const operations = template.items.map((item: any) =>
    prisma.org_Permission.upsert({
      where: {
        user_id_organisasi_id_permission: {
          user_id: userId,
          organisasi_id: organisasiId,
          permission: item.permission,
        },
      },
      update: { granted_by: grantedBy, granted_at: new Date() },
      create: {
        user_id: userId,
        organisasi_id: organisasiId,
        permission: item.permission,
        granted_by: grantedBy,
      },
    }),
  );

  return await prisma.$transaction(operations);
};
