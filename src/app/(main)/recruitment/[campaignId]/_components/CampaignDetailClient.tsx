"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/global/Button";
import { registerApplicant } from "@/actions/recruitment";
import { toast } from "sonner";
import { useRouter } from "next-nprogress-bar";

interface CampaignDetailClientProps {
  campaignId: string;
  userId: string;
}

export default function CampaignDetailClient({
  campaignId,
  userId,
}: CampaignDetailClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    try {
      await registerApplicant(campaignId);
      toast.success("Pendaftaran berhasil!");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="primary" onClick={handleRegister} isDisabled={loading}>
      {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
    </Button>
  );
}
