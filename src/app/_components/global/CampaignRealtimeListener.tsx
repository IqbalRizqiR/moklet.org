"use client";

import { useEffect } from "react";
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
          router.refresh();
        }
      } catch {
        // ignore malformed SSE messages
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [campaignId, router]);

  return null;
}
