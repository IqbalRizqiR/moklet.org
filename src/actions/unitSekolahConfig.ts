"use server";

import prisma from "@/lib/prisma";
import { UnitSekolah } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getUnitSekolahConfigs() {
  return await prisma.schoolUnitConfig.findMany();
}

export async function updateUnitSekolahConfig(unit: UnitSekolah, phone: string) {
  const session = await auth();
  if (session?.user?.role !== "SuperAdmin") {
    return { error: true, message: "Hanya SuperAdmin yang dapat mengubah pengaturan ini." };
  }

  try {
    await prisma.schoolUnitConfig.upsert({
      where: { unit },
      update: { wa_notify_phone: phone },
      create: { unit, wa_notify_phone: phone },
    });

    revalidatePath("/admin/settings/aspirasi");
    return { error: false, message: `Berhasil update notifikasi untuk unit ${unit}.` };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal update pengaturan unit sekolah." };
  }
}
