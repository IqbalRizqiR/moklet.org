import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// EVENT LEVEL QUERIES
export const findEventLevels = async (filter?: Prisma.Event_LevelWhereInput) => {
  return await prisma.event_Level.findMany({
    where: filter,
    orderBy: { order: "asc" },
    include: {
      roles: {
        include: {
          memberships: {
            include: { user: true },
          },
        },
      },
    },
  });
};

export const createEventLevel = async (data: Prisma.Event_LevelCreateInput) => {
  return await prisma.event_Level.create({ data });
};

export const updateEventLevel = async (
  where: Prisma.Event_LevelWhereUniqueInput,
  data: Prisma.Event_LevelUpdateInput,
) => {
  return await prisma.event_Level.update({ where, data });
};

export const deleteEventLevel = async (where: Prisma.Event_LevelWhereUniqueInput) => {
  return await prisma.event_Level.delete({ where });
};

// EVENT ROLE QUERIES
export const findEventRoles = async (filter?: Prisma.Event_Custom_RoleWhereInput) => {
  return await prisma.event_Custom_Role.findMany({
    where: filter,
    orderBy: { hierarchy_level: "asc" },
  });
};

export const createEventRole = async (data: Prisma.Event_Custom_RoleCreateInput) => {
  return await prisma.event_Custom_Role.create({ data });
};

export const updateEventRole = async (
  where: Prisma.Event_Custom_RoleWhereUniqueInput,
  data: Prisma.Event_Custom_RoleUpdateInput,
) => {
  return await prisma.event_Custom_Role.update({ where, data });
};

export const deleteEventRole = async (where: Prisma.Event_Custom_RoleWhereUniqueInput) => {
  return await prisma.event_Custom_Role.delete({ where });
};

// EVENT MEMBER QUERIES
export const addEventMember = async (data: Prisma.Event_MemberCreateInput) => {
  return await prisma.event_Member.create({ data });
};

export const removeEventMember = async (where: Prisma.Event_MemberWhereUniqueInput) => {
  return await prisma.event_Member.delete({ where });
};
