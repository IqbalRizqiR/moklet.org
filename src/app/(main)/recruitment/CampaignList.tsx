"use client";

import React, { useState } from "react";
import { FormModal } from "@/app/_components/global/FormModal";
import { registerApplicant } from "@/actions/recruitment";
import { toast } from "sonner";
import { useRouter } from "next-nprogress-bar";
import CountdownTimer from "@/app/_components/global/CountdownTimer";

export default function CampaignList({ campaigns, userId }: { campaigns: any[], userId?: string }) {
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const router = useRouter();

  const handleApply = (campaign: any) => {
    if (!userId) {
      toast.error("Silakan login terlebih dahulu.");
      router.push("/api/auth/signin?callbackUrl=/recruitment");
      return;
    }

    const hasApplied = campaign.applicants?.some((a: any) => a.user_id === userId);
    if (hasApplied) {
      router.push(`/recruitment/${campaign.id}`);
      return;
    }

    setSelectedCampaign(campaign);
  };

  const handleSuccess = async (submissionId: string) => {
    try {
      if (!selectedCampaign || !userId) return;
      await registerApplicant(selectedCampaign.id, submissionId);
      toast.success("Pendaftaran berhasil!");
      setSelectedCampaign(null);
      router.push(`/recruitment/${selectedCampaign.id}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const now = new Date();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => {
          const hasApplied = c.applicants?.some((a: any) => a.user_id === userId);
          const openDate = c.open_date ? new Date(c.open_date) : null;
          const closeDate = c.close_date ? new Date(c.close_date) : null;

          const notYetOpen = openDate && openDate > now;
          const isClosed = closeDate && closeDate < now;

          return (
            <div key={c.id} className="border p-6 rounded-xl shadow-sm bg-white flex flex-col">
              <h2 className="text-xl font-bold">{c.title}</h2>
              <p className="text-gray-600 mb-3">{c.organisasi.organisasi_name}</p>
              {c.description && <p className="text-sm text-gray-500 mb-4 flex-1">{c.description}</p>}

              {/* Registration status / countdown */}
              {!hasApplied && notYetOpen && (
                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 p-3">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Dibuka dalam</p>
                  <div className="text-blue-800 text-sm">
                    <CountdownTimer targetDate={openDate!.toISOString()} compact onExpire="reload" />
                  </div>
                </div>
              )}
              {!hasApplied && !notYetOpen && !isClosed && closeDate && (
                <div className="mb-4 rounded-lg bg-amber-50 border border-amber-100 p-3">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Pendaftaran ditutup dalam</p>
                  <div className="text-amber-800 text-sm">
                    <CountdownTimer targetDate={closeDate.toISOString()} compact onExpire="reload" />
                  </div>
                </div>
              )}
              {!hasApplied && isClosed && (
                <div className="mb-4 rounded-lg bg-gray-100 border border-gray-200 p-3 text-center">
                  <p className="text-sm font-semibold text-gray-500">Pendaftaran Ditutup</p>
                </div>
              )}

              <button
                onClick={() => handleApply(c)}
                disabled={!hasApplied && (!!isClosed || !!notYetOpen)}
                className={`px-4 py-2 rounded text-white font-medium transition-colors ${
                  hasApplied
                    ? "bg-secondary-500 hover:bg-secondary-600"
                    : isClosed || notYetOpen
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-primary-500 hover:bg-primary-600"
                }`}
              >
                {hasApplied
                  ? "Lihat Pengumuman"
                  : notYetOpen
                    ? "Belum Dibuka"
                    : isClosed
                      ? "Ditutup"
                      : "Daftar Organ/SubOrgan"}
              </button>
            </div>
          );
        })}
      </div>

      <FormModal
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        formId={selectedCampaign?.form_id}
        userId={userId || ""}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
