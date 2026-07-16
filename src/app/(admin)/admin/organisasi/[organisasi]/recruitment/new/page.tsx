"use client";

import React, { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { toast } from "sonner";
import { createCampaignWithForm } from "@/actions/recruitment";
import { H2 } from "@/app/_components/global/Text";
import { Button } from "@/app/_components/global/Button";
import { TextField, TextArea } from "@/app/_components/global/Input";
import { use } from "react";
import QuestionEdit from "@/app/(admin)/admin/form/_components/QuestionEdit";
import { FieldsWithOptions } from "@/types/entityRelations";

export default function NewCampaignPage({ params }: { params: Promise<{ organisasi: string }> }) {
  const { organisasi: id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<FieldsWithOptions[]>([]);
  const [successLinks, setSuccessLinks] = useState<{ label: string; url: string }[]>([]);
  const [sections, setSections] = useState<{ id: number; title: string; order: number }[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    
    try {
      await createCampaignWithForm({
        organisasi_string: id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        open_date: formData.get("open_date") as string,
        close_date: formData.get("close_date") as string,
        questions: questions,
        registration_success_message: formData.get("registration_success_message") as string,
        registration_success_links: successLinks,
      });
      toast.success("Campaign berhasil dibuat!");
      router.push(`/admin/organisasi/${id}/recruitment`);
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat campaign.");
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    setSuccessLinks([...successLinks, { label: "", url: "" }]);
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const updated = [...successLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSuccessLinks(updated);
  };

  const removeLink = (index: number) => {
    setSuccessLinks(successLinks.filter((_, i) => i !== index));
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

        <div className="border-t pt-6 mt-6">
          <h3 className="font-semibold text-neutral-800 mb-4">Pesan & Tautan Setelah Pendaftaran</h3>
          <TextArea
            label="Pesan Sukses (Opsional)"
            name="registration_success_message"
            placeholder="Selamat! Anda telah terdaftar. Silakan bergabung ke grup WhatsApp di bawah."
          />
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-700">Tautan (WhatsApp Group, dll.)</span>
              <button type="button" onClick={addLink} className="text-xs text-primary-500 hover:underline">+ Tambah Tautan</button>
            </div>
            {successLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Label (contoh: Grup WA Angkatan)"
                    value={link.label}
                    onChange={(e) => updateLink(i, "label", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-1"
                  />
                  <input
                    type="url"
                    placeholder="URL (contoh: https://chat.whatsapp.com/...)"
                    value={link.url}
                    onChange={(e) => updateLink(i, "url", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <button type="button" onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600 p-2 mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <H2 className="mb-4 text-xl">Pertanyaan Formulir</H2>
          <QuestionEdit 
            fields={questions} 
            setFields={setQuestions} 
            formId="new"
            sections={sections}
            setSections={setSections}
          />
        </div>

        <div className="pt-8 flex gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" variant="primary" isDisabled={loading}>Simpan Campaign</Button>
        </div>
      </form>
    </div>
  );
}
