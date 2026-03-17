import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import redisClient from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Initial connection ping
      sendEvent({ type: "CONNECTED", message: "Listening for updates..." });

      let lastPing = await redisClient.get<string>(`permission_ping:${userId}`);

      const interval = setInterval(async () => {
        try {
          const currentPing = await redisClient.get<string>(`permission_ping:${userId}`);
          
          if (currentPing && currentPing !== lastPing) {
            lastPing = currentPing;
            sendEvent({ 
              type: "PERMISSION_UPDATE", 
              message: "Your permissions have been updated.",
              timestamp: currentPing 
            });
          }
        } catch (error) {
          console.error("SSE Redis Poll Error:", error);
        }
      }, 5000); // Check every 5 seconds

      // Handle connection close
      req.signal.onabort = () => {
        clearInterval(interval);
        controller.close();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
