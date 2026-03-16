import prisma from "@/lib/prisma";
import { createNotification } from "@/utils/database/notification.query";

const FONNTE_API_URL = "https://api.fonnte.com/send";

/**
 * Send a WhatsApp message via Fonnte (free tier).
 * Requires FONNTE_API_KEY env variable.
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string,
): Promise<boolean> {
  const apiKey = process.env.FONNTE_API_KEY;
  if (!apiKey) {
    console.warn("[WhatsApp] FONNTE_API_KEY not set, skipping WA notification");
    return false;
  }

  try {
    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: phone,
        message,
        countryCode: "62", // Indonesia
      }),
    });

    const result = await response.json();
    if (!result.status) {
      console.error("[WhatsApp] Failed to send message:", result);
      return false;
    }

    return true;
  } catch (e) {
    console.error("[WhatsApp] Error sending message:", e);
    return false;
  }
}

/**
 * Dispatch a notification event:
 * 1. Creates in-app notification for recipients
 * 2. Sends WhatsApp message to the org's configured phone number
 *
 * This is fire-and-forget — errors are logged but not thrown.
 */
export async function dispatchNotification({
  type,
  title,
  message,
  targetUrl,
  actorId,
  recipientIds,
  organisasiId,
}: {
  type: string;
  title: string;
  message: string;
  targetUrl?: string;
  actorId: string;
  recipientIds: string[];
  organisasiId?: string;
}) {
  try {
    // 1. Create in-app notification
    await createNotification({
      type,
      title,
      message,
      targetUrl,
      actorId,
      recipientIds,
    });

    // 2. Send WhatsApp if org has a configured phone
    if (organisasiId) {
      const org = await prisma.organisasi.findUnique({
        where: { id: organisasiId },
      });

      if (org?.wa_notify_phone) {
        const waMessage = `📣 *${title}*\n\n${message}`;
        // Fire and forget — don't await
        sendWhatsAppMessage(org.wa_notify_phone, waMessage).catch((e) =>
          console.error("[WhatsApp] dispatch error:", e),
        );
      }
    }
  } catch (e) {
    console.error("[Notification] dispatch error:", e);
  }
}
