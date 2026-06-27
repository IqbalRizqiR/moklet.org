import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

export const findAllUsers = async (filter?: Prisma.UserWhereInput) => {
  return await prisma.user.findMany({
    where: filter,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      user_pic: true,
      userAuth: { select: { last_login: true } },
      memberships: {
        include: {
          role: { include: { level: true } },
          organisasi: true
        }
      }
    },
  });
};

export const findUser = async (filter: Prisma.UserWhereInput) => {
  return await prisma.user.findFirst({
    where: filter,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      user_pic: true,
      userAuth: { select: { last_login: true } },
      memberships: {
        include: {
          role: { include: { level: true } },
          organisasi: true
        }
      }
    },
  });
};

export const findUserAuth = async (email: string) => {
  return await prisma.user_Auth.findUnique({ where: { userEmail: email } });
};

export const createUser = async (data: Prisma.UserUncheckedCreateInput) => {
  return await prisma.user.create({ data });
};

export const updateUser = async (
  where: Prisma.UserWhereUniqueInput,
  update: Prisma.UserUncheckedUpdateInput,
) => {
  return await prisma.user.update({ where, data: update });
};

export const updateUserAuth = async (
  where: Prisma.User_AuthWhereUniqueInput,
  update: Prisma.User_AuthUncheckedUpdateInput,
) => {
  return await prisma.user_Auth.update({ where, data: update });
};

export const deleteUser = async (user_id: string) => {
  return await prisma.user.delete({ where: { id: user_id } });
};
