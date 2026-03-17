"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RealtimeHandler() {
  const { data: session, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.id) return;

    console.log("[Realtime] Connecting to notifications stream...");
    const eventSource = new EventSource("/api/realtime/notifications");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[Realtime] Received event:", data);

        if (data.type === "PERMISSION_UPDATE") {
          toast.info("Akses Diperbarui", {
            description: "Izin Anda telah diperbarui oleh Admin. Segarkan halaman jika diperlukan.",
          });
          
          // Update the session to reflect new role/permissions in the token
          update().then(() => {
            // Force a router refresh to update server components on the page
            router.refresh();
          });
        }
      } catch (error) {
        console.error("[Realtime] Error parsing event data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[Realtime] EventSource error:", error);
      eventSource.close();
      
      // Attempt to reconnect after 10 seconds if it fails
      setTimeout(() => {
        // This will trigger a re-render/re-effect if user is still logged in
      }, 10000);
    };

    return () => {
      console.log("[Realtime] Closing notifications stream.");
      eventSource.close();
    };
  }, [session?.user?.id, update, router]);

  return null;
}
