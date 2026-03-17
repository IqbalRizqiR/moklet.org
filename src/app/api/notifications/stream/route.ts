import { auth } from "@/lib/auth";
import { getNewNotifications } from "@/utils/database/notification.query";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastCheck = new Date();

      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Initial heartbeat
      send(JSON.stringify({ type: "connected" }));

      const interval = setInterval(async () => {
        try {
          const newNotifications = await getNewNotifications(userId, lastCheck);
          lastCheck = new Date();

          if (newNotifications.length > 0) {
            for (const notif of newNotifications) {
              send(
                JSON.stringify({
                  type: "notification",
                  id: notif.id,
                  notificationId: notif.notification_id,
                  title: notif.notification.title,
                  message: notif.notification.message,
                  targetUrl: notif.notification.target_url,
                  notificationType: notif.notification.type,
                  actor: notif.notification.actor,
                  createdAt: notif.notification.created_at,
                }),
              );
            }
          }
        } catch (e) {
          console.error("[SSE] Error polling notifications:", e);
        }
      }, 5000); // Poll every 5 seconds

      // Clean up on close
      const cleanup = () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      };

      // Auto-close after 5 minutes (client will reconnect)
      setTimeout(cleanup, 5 * 60 * 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
