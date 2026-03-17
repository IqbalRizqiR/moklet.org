import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// Find all custom roles for an organisation
export const findRolesByOrg = async (organisasiId: string) => {
  return await prisma.org_Custom_Role.findMany({
    where: { organisasi_id: organisasiId },
    include: {
      users: { select: { id: true, name: true, email: true, user_pic: true } },
      level: true,
    },
    orderBy: { hierarchy_level: "asc" },
  });
};

// Find a single custom role
export const findCustomRole = async (
  filter: Prisma.Org_Custom_RoleWhereUniqueInput,
) => {
  return await prisma.org_Custom_Role.findUnique({
    where: filter,
    include: { users: { select: { id: true, name: true, email: true, user_pic: true } } },
  });
};

// Create a custom role
export const createCustomRole = async (
  data: Prisma.Org_Custom_RoleCreateInput,
) => {
  return await prisma.org_Custom_Role.create({ data });
};

// Update a custom role
export const updateCustomRole = async (
  where: Prisma.Org_Custom_RoleWhereUniqueInput,
  data: Prisma.Org_Custom_RoleUpdateInput,
) => {
  return await prisma.org_Custom_Role.update({ where, data });
};

// Delete a custom role
export const deleteCustomRole = async (id: string) => {
  return await prisma.org_Custom_Role.delete({ where: { id } });
};
