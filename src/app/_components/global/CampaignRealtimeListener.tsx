"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CampaignRealtimeListener({ campaignId }: { campaignId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!campaignId) return;

    const eventSource = new EventSource(`/api/realtime/campaign/${campaignId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "CAMPAIGN_UPDATE") {
          console.log("[Realtime] Received campaign update ping, refreshing page...");
          router.refresh();
        }
      } catch (err) {
        console.error("Failed to parse SSE message", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [campaignId, router]);

  return null;
}
