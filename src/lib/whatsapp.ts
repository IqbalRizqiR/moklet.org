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
  url?: string,
): Promise<boolean> {
  const apiKey = process.env.FONNTE_API_KEY;
  if (!apiKey) {
    console.warn("[WhatsApp] FONNTE_API_KEY not set, skipping WA notification");
    return false;
  }

  try {
    const payload: any = {
      target: phone,
      message,
      countryCode: "62", // Indonesia
    };

    // Fonnte uses the 'file' parameter for media attachments (like images or documents)
    if (url) {
      payload.file = url;
    }

    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
  imageUrl,
  customPhone,
}: {
  type: string;
  title: string;
  message: string;
  targetUrl?: string;
  actorId: string;
  recipientIds: string[];
  organisasiId?: string;
  imageUrl?: string;
  customPhone?: string;
}) {
  try {
    await createNotification({
      type,
      title,
      message,
      targetUrl,
      actorId,
      recipientIds,
    });

    let waMessage = `📣 *${title}*\n\n${message}`;

    if (imageUrl) {
      console.log(imageUrl)
      waMessage += `\n\n📌 *Terdapat lampiran gambar:*\n${imageUrl}`;
    }

    // Priority 1: Custom phone number provided (e.g. for unit school config)
    if (customPhone) {
      sendWhatsAppMessage(customPhone, waMessage).catch((e) =>
        console.error("[WhatsApp] dispatch error (custom):", e),
      );
    } 
    // Priority 2: Organization configured phone number
    else if (organisasiId) {
      const org = await prisma.organisasi.findUnique({
        where: { id: organisasiId },
      });

      if (org?.wa_notify_phone) {
        sendWhatsAppMessage(org.wa_notify_phone, waMessage).catch((e) =>
          console.error("[WhatsApp] dispatch error (org):", e),
        );
      }
    }
  } catch (e) {
    console.error("[Notification] dispatch error:", e);
  }
}
