"use client";

import React, { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { toast } from "sonner";
import { createCampaign } from "@/actions/recruitment";
import { H2 } from "@/app/_components/global/Text";
import { Button } from "@/app/_components/global/Button";
import { TextField, TextArea } from "@/app/_components/global/Input";
import { use } from "react";

export default function NewCampaignPage({ params }: { params: Promise<{ organisasi: string }> }) {
  const { organisasi: id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    
    try {
      const campaign = await createCampaign({
        organisasi_string: id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        open_date: formData.get("open_date") as string,
        close_date: formData.get("close_date") as string,
      });
      toast.success("Campaign berhasil dibuat! Silakan atur tahapan.");
      router.push(`/admin/organisasi/${id}/recruitment/${campaign.id}/steps`);
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl bg-white m-6 rounded-xl border shadow-sm">
      <H2 className="mb-6">Buat Campaign Baru</H2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField 
          label="Judul Campaign" 
          name="title" 
          type="text"
          placeholder="Contoh: Oprec Pengurus OSIS 2026/2027" 
          required 
        />
        
        <TextArea 
          label="Deskripsi" 
          name="description" 
          placeholder="Penjelasan singkat mengenai rekrutmen ini..." 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <TextField 
            label="Tanggal Buka" 
            name="open_date" 
            type="datetime-local" 
          />
          <TextField 
            label="Tanggal Tutup" 
            name="close_date" 
            type="datetime-local" 
          />
        </div>

        <div className="pt-8 flex gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" variant="primary" isDisabled={loading}>
            {loading ? "Menyimpan..." : "Buat Campaign"}
          </Button>
        </div>
      </form>
    </div>
  );
}
