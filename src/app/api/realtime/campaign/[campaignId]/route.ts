import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import redisClient from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      sendEvent({ type: "CONNECTED", campaignId });

      let lastPing = await redisClient.get<string>(
        `campaign_ping:${campaignId}`,
      );

      const interval = setInterval(async () => {
        try {
          const currentPing = await redisClient.get<string>(
            `campaign_ping:${campaignId}`,
          );

          if (currentPing && currentPing !== lastPing) {
            lastPing = currentPing;
            sendEvent({
              type: "CAMPAIGN_UPDATE",
              campaignId,
              timestamp: currentPing,
            });
          }
        } catch (error) {
          console.error("[SSE] Campaign poll error:", error);
        }
      }, 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });

      setTimeout(() => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      }, 5 * 60 * 1000);
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
