"use server";

import { Organisasi_Type, Prisma, UnitSekolah } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  countAllAspirations,
  createAspiration,
  findAllAspirations,
  findAspirationsByUserId,
  updateAspiration as updateAspirationDb
} from "@/utils/database/aspiration.query";
import { auth } from "@/lib/auth";
import { ratelimit } from "@/lib/ratelimit";
import { dispatchNotification } from "@/lib/whatsapp";
import prisma from "@/lib/prisma";
import { uploadImageCloudinary } from "@/actions/fileUploader";

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
  const is_anonymous = data.get("isAnonymous") === "on";
  const imageFile = data.get("image") as File | null;

  try {
    let imageUrl: string | undefined;

    if (imageFile && imageFile.name !== "" && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const upload = await uploadImageCloudinary(buffer);
      if (upload.data?.url) {
        imageUrl = upload.data.url;
      }
    }

    const aspiration = await createAspiration({
      judul_aspirasi,
      is_anonymous,
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
      gambar_aspirasi: imageUrl,
      user: {
        connect: {
          id: session.user.id,
        },
      },
    });

    if (type === "ORGANISASI") {
      const orgType = recipent?.toUpperCase() as Organisasi_Type;
      const org = await prisma.organisasi.findFirst({
        where: {
          organisasi: orgType,
          period: { is_active: true }
        }
      });
      if (org) {
        const leaders = await prisma.user.findMany({
          where: {
            organisasi_id: org.id,
            org_role: { is_leader: true }
          },
          select: { id: true }
        });
        if (leaders.length > 0) {
          dispatchNotification({
            type: "new_aspiration_org",
            title: "Aspirasi Organisasi Baru",
            message: `Ada aspirasi baru berjudul "${judul_aspirasi}" untuk ${org.organisasi_name}.`,
            targetUrl: `/admin/aspirasi`,
            actorId: session.user.id,
            recipientIds: leaders.map((l: { id: string }) => l.id),
            organisasiId: org.id,
            imageUrl: imageUrl,
          });
        }
      }
    } else if (type === "EVENT") {
      const event = await prisma.event.findUnique({
        where: { id: recipent },
        include: { user: { include: { organisasi: true } } }
      });
      if (event) {
        // Collect recipients: event creator + org leaders (if event is linked to an org)
        const recipientIds = [event.user_id];
        let organisasiId: string | undefined;

        if (event.user.organisasi_id) {
          organisasiId = event.user.organisasi_id;
          const leaders = await prisma.user.findMany({
            where: {
              organisasi_id: organisasiId,
              org_role: { is_leader: true }
            },
            select: { id: true }
          });
          leaders.forEach((l: { id: string }) => {
            if (!recipientIds.includes(l.id)) recipientIds.push(l.id);
          });
        }

        dispatchNotification({
          type: "new_aspiration_event",
          title: "Aspirasi Event Baru",
          message: `Ada aspirasi baru berjudul "${judul_aspirasi}" untuk event ${event.event_name}.`,
          targetUrl: `/admin/aspirasi`,
          actorId: session.user.id,
          recipientIds,
          organisasiId: organisasiId,
          imageUrl: imageUrl,
        });
      }
    } else if (type === "SEKOLAH") {
      const unit = recipent?.toUpperCase() as UnitSekolah;
      const unitConfig = await prisma.schoolUnitConfig.findUnique({
        where: { unit }
      });

      const admins = await prisma.user.findMany({
        where: {
          role: { in: ["SuperAdmin", "Admin"] }
        },
        select: { id: true }
      });
      
      if (admins.length > 0) {
        dispatchNotification({
          type: "new_aspiration_sekolah",
          title: "Aspirasi Unit Sekolah Baru",
          message: `Ada aspirasi baru berjudul "${judul_aspirasi}" untuk unit ${recipent}.`,
          targetUrl: `/admin/aspirasi`,
          actorId: session.user.id,
          recipientIds: admins.map((a: { id: string }) => a.id),
          customPhone: unitConfig?.wa_notify_phone || undefined,
          imageUrl: imageUrl,
        });
      }
    }

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

export const getUserAspirations = async () => {
  const session = await auth();
  if (!session?.user) return { success: false, data: [] };

  try {
    const aspirations = await findAspirationsByUserId(session.user.id);
    return { success: true, data: aspirations };
  } catch (error) {
    console.error("[getUserAspirations] Error:", error);
    return { success: false, data: [] };
  }
};

export async function editAspiration(
  id: string,
  data: FormData,
  pesan_aspirasi: string,
) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  const judul_aspirasi = (data.get("judulAspirasi") as string) || "";
  const imageFile = data.get("image") as File | null;

  try {
    let imageUrl: string | undefined;

    // Only upload if a new file is provided
    if (imageFile && imageFile.name !== "" && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const upload = await uploadImageCloudinary(buffer);
      if (upload.data?.url) {
        imageUrl = upload.data.url;
      }
    }

    const updateData: any = {
      judul_aspirasi,
      pesan_aspirasi,
    };
    if (imageUrl) {
      updateData.gambar_aspirasi = imageUrl;
    }

    await updateAspirationDb(id, session.user.id, updateData);

    revalidatePath("/aspirasi/riwayat");
    revalidatePath("/admin/aspirasi");

    return {
      success: true,
      message: "Berhasil menyimpan perubahan aspirasi!",
    };
  } catch (e: any) {
    console.error("[editAspiration] Error:", e);
    return {
      success: false,
      message: e.message || "Gagal menyimpan perubahan aspirasi!",
    };
  }
}
