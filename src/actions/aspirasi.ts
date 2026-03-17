"use server";

import { Organisasi_Type, Prisma, UnitSekolah } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  countAllAspirations,
  createAspiration,
  findAllAspirations,
} from "@/utils/database/aspiration.query";
import { auth } from "@/lib/auth";
import { ratelimit } from "@/lib/ratelimit";

export type aspirationType = "ORGANISASI" | "SEKOLAH" | "EVENT";

export async function submitAspiration(
  data: FormData,
  pesan_aspirasi: string,
  type: aspirationType,
  recipent: string,
) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  // Rate Limiting
  const { success } = await ratelimit.limit(`aspirasi_${session.user.id}`);
  if (!success) {
    return {
      success: false,
      message: "Terlalu banyak permintaan! Tunggu 1 menit sebelum mengirim aspirasi lagi.",
    };
  }

  const judul_aspirasi = (data.get("judulAspirasi") as string) || "";
  try {
    await createAspiration({
      judul_aspirasi,
      organisasi:
        type === "ORGANISASI"
          ? (recipent?.toUpperCase() as Organisasi_Type)
          : undefined,
      event: type === "EVENT" ? { connect: { id: recipent } } : undefined,
      unit_sekolah:
        type === "SEKOLAH"
          ? (recipent?.toUpperCase() as UnitSekolah)
          : undefined,
      pesan_aspirasi,
      user: {
        connect: {
          id: session.user.id,
        },
      },
    });

    revalidatePath("/admin/aspirasi");
    return {
      success: true,
      message: "Berhasil mengirimkan aspirasi!",
    };
  } catch (e) {
    return {
      success: false,
      message: "Gagal mengirimkan aspirasi!",
    };
  }
}

export const getAspirations = async ({
  take,
  skip,
  to,
  from,
  organisasi,
  unit,
  event,
}: {
  take?: number;
  skip?: number;
  to?: string;
  from?: string;
  organisasi?: string;
  unit?: string;
  event?: string;
}) => {
  try {
    let query: Prisma.AspirasiWhereInput | undefined;
    if (
      organisasi &&
      organisasi != "" &&
      to &&
      to != "" &&
      from &&
      from != ""
    ) {
      const organ = organisasi.toUpperCase() as Organisasi_Type;
      query = {
        organisasi: organ,
        created_at: { gte: new Date(from), lte: new Date(to + "T23:59:59Z") },
      };
    }
    if (unit && unit != "" && from && from != "" && to && to != "") {
      const unitQ = unit.toUpperCase() as UnitSekolah;
      query = {
        unit_sekolah: unitQ,
        created_at: { gte: new Date(from), lte: new Date(to + "T23:59:59Z") },
      };
    }

    if (event && event != "")
      query = {
        event: { id: event },
      };

    if (!query) return { count: 0, data: [] };

    const aspirations = await findAllAspirations(query, take, skip);
    const count = await countAllAspirations(query);

    return { data: aspirations, count };
  } catch (error: unknown) {
    console.log(error);
    throw new Error(`An error happened: ${error}`);
  }
};
