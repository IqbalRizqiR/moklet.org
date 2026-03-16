"use server";

import { auth } from "@/lib/auth";
import { markAsRead, markAllAsRead } from "@/utils/database/notification.query";

export async function markNotificationRead(recipientId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  try {
    await markAsRead(recipientId);
    return { error: false };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal menandai notifikasi" };
  }
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return { error: true, message: "Unauthorized" };

  try {
    await markAllAsRead(session.user.id);
    return { error: false };
  } catch (e) {
    console.error(e);
    return { error: true, message: "Gagal menandai semua notifikasi" };
  }
}
