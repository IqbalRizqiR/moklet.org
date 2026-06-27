import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import redisClient from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id: campaignId } = await params;

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Note: We don't strictly verify if they are an org leader here because this endpoint 
  // only emits an empty ping timestamp, which poses no security risk. 
  // The actual secure data is fetched securely via router.refresh().

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Initial connection ping
      sendEvent({ type: "CONNECTED", message: "Listening for campaign updates..." });

      let lastPing = await redisClient.get<string>(`campaign_ping:${campaignId}`);

      const interval = setInterval(async () => {
        try {
          const currentPing = await redisClient.get<string>(`campaign_ping:${campaignId}`);
          
          if (currentPing && currentPing !== lastPing) {
            lastPing = currentPing;
            sendEvent({ 
              type: "CAMPAIGN_UPDATE", 
              message: "New applicant registered.",
              timestamp: currentPing 
            });
          }
        } catch (error) {
          console.error("SSE Redis Poll Error for Campaign:", error);
        }
      }, 3000); // Check every 3 seconds

      // Handle connection close
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
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
