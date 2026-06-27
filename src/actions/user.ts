"use server";

import { Roles } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  createUser,
  deleteUser,
  findUser,
  updateUser,
} from "@/utils/database/user.query";
import { encrypt } from "@/utils/encryption";

export const updateUserWithId = async (id: string | null, data: FormData) => {
  try {
    const session = await auth();
    const userRole = session?.user?.role;

    const email = data.get("email") as string;
    const name = data.get("name") as string;
    const role = data.get("role") as Roles;
    const password = data.get("password") as string;

    if (userRole !== "SuperAdmin") {
      if (role === "SuperAdmin") {
        return { error: true, message: "Unauthorized" };
      }
    }

    const findEmail = await findUser({ email });
    if (id && userRole !== "SuperAdmin") {
      const findById = await findUser({ id });

      if (findById?.role === "SuperAdmin") {
        return { error: true, message: "Cannot edit SuperAdmin" };
      }
    }

    if (id == null && !findEmail) {
      const create = await createUser({
        email,
        name,
        role,
        user_pic:
          "https://res.cloudinary.com/mokletorg/image/upload/v1710992405/user.svg",
        userAuth: {
          create: { password: password ? encrypt(password) : undefined },
        },
      });
      if (!create) throw new Error("Update failed");
    } else if (id || findEmail) {
      const update = await updateUser(id ? { id } : { email }, {
        email: email ?? undefined,
        name: name ?? undefined,
        role: role ?? undefined,
        userAuth: {
          update: { password: password ? encrypt(password) : undefined },
        },
      });
      if (!update) throw new Error("Update failed");
    }

    revalidatePath("/admin/users");
    revalidatePath("/", "layout");
    return { message: "Berhasil disimpan!", error: false };
  } catch (e) {
    console.error(e);
    const error = e as Error;
    return {
      message: error.message.includes("PRIMARY")
        ? "Email sudah ada!"
        : "Gagal mengubah user",
      error: true,
    };
  }
};

export const deleteUserById = async (id: string) => {
  try {
    const session = await auth();
    if (session?.user?.role != "SuperAdmin")
      return { error: true, message: "Only SuperAdmin!" };

    const del = await deleteUser(id);

    if (!del) throw new Error("Delete failed");

    revalidatePath("/admin/users");
    revalidatePath("/", "layout");
    return { message: "Berhasil dihapus!", error: false };
  } catch (e) {
    console.error(e);
    return {
      message: "Gagal menghapus user",
      error: true,
    };
  }
};
