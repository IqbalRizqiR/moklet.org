"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canManageEvent, isOrgLeader } from "@/utils/permissions";
import { EventStatus } from "@prisma/client";

export async function createEventAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const eventName = formData.get("event_name")?.toString();
  const description = formData.get("description")?.toString();
  const organisasiId = formData.get("organisasi_id")?.toString() || null;
  const startDate = formData.get("start_date")?.toString();
  const endDate = formData.get("end_date")?.toString();

  if (!eventName) {
    return { error: true, message: "Event name is required" };
  }

  // If tied to an org, verify the creator is an org leader or admin
  if (organisasiId) {
    const isLeaderOfOrg = await isOrgLeader(session.user.id, organisasiId);
    if (!isLeaderOfOrg && session.user.role !== "Admin" && session.user.role !== "SuperAdmin") {
      return { error: true, message: "Hanya ketua organisasi atau admin yang bisa membuat event untuk organisasi ini." };
    }
  }

  try {
    const event = await prisma.event.create({
      data: {
        event_name: eventName,
        description: description || null,
        organisasi_id: organisasiId,
        user_id: session.user.id,
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
        status: EventStatus.DRAFT,
      },
    });

    revalidatePath("/admin/events");
    return { error: false, message: "Event berhasil dibuat!", data: event };
  } catch (err: any) {
    console.error("Create event error:", err);
    return { error: true, message: "Gagal membuat event." };
  }
}

export async function updateEventStatusAction(eventId: string, status: EventStatus) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  const hasAccess = await canManageEvent(session.user.id, eventId);
  if (!hasAccess) return { error: true, message: "Tidak punya akses mengedit event ini." };

  try {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status },
    });
    revalidatePath(`/admin/events/${eventId}`);
    return { error: false, message: "Status event diperbarui!", data: event };
  } catch (err) {
    return { error: true, message: "Gagal memperbarui status." };
  }
}

// Backward compatibility for Aspirasi
export async function upsertEvent(formData: FormData, userId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };
  const actualUserId = session.user.id;
  
  const eventName = formData.get("eventName")?.toString();
  const eventDate = formData.get("eventDate")?.toString();

  if (!eventName || !eventDate) {
    return { success: false, message: "Nama dan tanggal event wajib diisi" };
  }

  try {
    const event = await prisma.event.create({
      data: {
        event_name: eventName,
        date: new Date(eventDate),
        start_date: new Date(eventDate),
        user_id: actualUserId,
      }
    });
    revalidatePath("/admin/aspirasi");
    return { success: true, message: "Event berhasil ditambah", data: event };
  } catch (err) {
    return { success: false, message: "Gagal menambah event" };
  }
}
