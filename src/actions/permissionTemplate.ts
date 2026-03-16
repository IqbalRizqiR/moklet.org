"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/utils/database/permissionTemplate.query";

// Create a permission template (SuperAdmin only)
export async function createTemplateAction(
  name: string,
  description: string | null,
  permissions: string[],
) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "SuperAdmin")
    return { error: true, message: "Hanya SuperAdmin yang bisa membuat template" };

  try {
    const template = await createTemplate(name, description, permissions);
    revalidatePath("/admin/permissions");
    return { error: false, message: "Template berhasil dibuat", data: template };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal membuat template. Nama mungkin sudah digunakan." };
  }
}

// Update a permission template (SuperAdmin only)
export async function updateTemplateAction(
  id: string,
  name: string,
  description: string | null,
  permissions: string[],
) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "SuperAdmin")
    return { error: true, message: "Hanya SuperAdmin yang bisa mengubah template" };

  try {
    const template = await updateTemplate(id, name, description, permissions);
    revalidatePath("/admin/permissions");
    return { error: false, message: "Template berhasil diupdate", data: template };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal mengupdate template" };
  }
}

// Delete a permission template (SuperAdmin only)
export async function deleteTemplateAction(id: string) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "SuperAdmin")
    return { error: true, message: "Hanya SuperAdmin yang bisa menghapus template" };

  try {
    await deleteTemplate(id);
    revalidatePath("/admin/permissions");
    return { error: false, message: "Template berhasil dihapus" };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal menghapus template" };
  }
}
