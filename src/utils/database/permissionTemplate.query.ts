import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export const findAllTemplates = async () => {
  return await prisma.permission_Template.findMany({
    include: { items: true },
    orderBy: { created_at: "desc" },
  });
};

export const findTemplate = async (id: string) => {
  return await prisma.permission_Template.findUnique({
    where: { id },
    include: { items: true },
  });
};

export const createTemplate = async (
  name: string,
  description: string | null,
  permissions: string[],
) => {
  return await prisma.permission_Template.create({
    data: {
      name,
      description,
      items: {
        create: permissions.map((p) => ({ permission: p })),
      },
    },
    include: { items: true },
  });
};

export const updateTemplate = async (
  id: string,
  name: string,
  description: string | null,
  permissions: string[],
) => {
  // Delete all existing items and recreate
  await prisma.permission_Template_Item.deleteMany({
    where: { template_id: id },
  });

  return await prisma.permission_Template.update({
    where: { id },
    data: {
      name,
      description,
      items: {
        create: permissions.map((p) => ({ permission: p })),
      },
    },
    include: { items: true },
  });
};

export const deleteTemplate = async (id: string) => {
  return await prisma.permission_Template.delete({ where: { id } });
};
