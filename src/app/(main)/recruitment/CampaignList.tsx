"use client";

import React, { useState } from "react";
import { FormModal } from "@/app/_components/global/FormModal";
import { registerApplicant } from "@/actions/recruitment";
import { toast } from "sonner";
import { useRouter } from "next-nprogress-bar";

export default function CampaignList({ campaigns, userId }: { campaigns: any[], userId?: string }) {
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const router = useRouter();

  const handleApply = (campaign: any) => {
    if (!userId) {
      toast.error("Silakan login terlebih dahulu.");
      router.push("/api/auth/signin?callbackUrl=/recruitment");
      return;
    }
    
    // Check if user already applied
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

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => {
           const hasApplied = c.applicants?.some((a: any) => a.user_id === userId);
           
           return (
             <div key={c.id} className="border p-6 rounded-xl shadow-sm bg-white">
               <h2 className="text-xl font-bold">{c.title}</h2>
               <p className="text-gray-600 mb-4">{c.organisasi.organisasi_name}</p>
               {c.description && <p className="text-sm text-gray-500 mb-6">{c.description}</p>}
               
               <button 
                 onClick={() => handleApply(c)}
                 className={`px-4 py-2 rounded text-white ${hasApplied ? 'bg-secondary-500' : 'bg-primary-500'}`}
               >
                 {hasApplied ? "Lihat Pengumuman" : "Daftar Organ/SubOrgan"}
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
