"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next-nprogress-bar";
import { addStep } from "@/actions/recruitment";
import { H3 } from "@/app/_components/global/Text";
import { Button } from "@/app/_components/global/Button";
import { TextField, TextArea } from "@/app/_components/global/Input";
import QuestionEdit from "@/app/(admin)/admin/form/_components/QuestionEdit";
import { FieldsWithOptions } from "@/types/entityRelations";

export default function AddStepForm({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"ANNOUNCEMENT" | "FORM">("ANNOUNCEMENT");
  const [questions, setQuestions] = useState<FieldsWithOptions[]>([]);
  const [successLinks, setSuccessLinks] = useState<{ label: string; url: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    if (!name) return;

    if (type === "FORM" && questions.length === 0) {
      toast.error("Tahap formulir harus memiliki minimal 1 pertanyaan.");
      return;
    }

    setLoading(true);
    try {
      await addStep(
        campaignId,
        name,
        formData.get("announcementDate") as string,
        {
          type,
          description: formData.get("description") as string,
          closeDate: formData.get("closeDate") as string,
          questions: type === "FORM" ? questions : undefined,
          success_message: formData.get("success_message") as string,
          success_links: successLinks,
        },
      );
      toast.success("Tahapan berhasil ditambahkan!");
      setQuestions([]);
      setSuccessLinks([]);
      setType("ANNOUNCEMENT");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan tahapan.");
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => setSuccessLinks([...successLinks, { label: "", url: "" }]);
  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const updated = [...successLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSuccessLinks(updated);
  };
  const removeLink = (index: number) => setSuccessLinks(successLinks.filter((_, i) => i !== index));

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
      <H3 className="mb-4">Tambah Tahapan Baru</H3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-2 font-medium text-neutral-900">Tipe Tahapan</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("ANNOUNCEMENT")}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${type === "ANNOUNCEMENT" ? "border-primary-500 bg-primary-50 text-primary-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              Pengumuman
            </button>
            <button
              type="button"
              onClick={() => setType("FORM")}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${type === "FORM" ? "border-primary-500 bg-primary-50 text-primary-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              Formulir
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {type === "ANNOUNCEMENT"
              ? "Peserta hanya menunggu pengumuman lulus/tidak pada tahap ini."
              : "Peserta harus mengisi formulir tambahan pada tahap ini."}
          </p>
        </div>

        <TextField
          type="text"
          label="Nama Tahapan"
          name="name"
          placeholder="Contoh: Wawancara Tahap 1"
          required
        />

        <TextArea
          label="Deskripsi / Instruksi (Opsional)"
          name="description"
          placeholder="Penjelasan singkat untuk peserta..."
        />

        <TextField
          label="Waktu Pengumuman (Opsional)"
          name="announcementDate"
          type="datetime-local"
        />

        <div className="border-t pt-4 mt-2">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">Setelah Peserta Lulus Tahap Ini</h4>
          <TextArea
            label="Pesan Sukses (Opsional)"
            name="success_message"
            placeholder="Selamat! Silakan bergabung ke grup berikut."
          />
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-neutral-600">Tautan (WhatsApp Group, dll.)</span>
              <button type="button" onClick={addLink} className="text-xs text-primary-500 hover:underline">+ Tambah Tautan</button>
            </div>
            {successLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input type="text" placeholder="Label" value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs mb-1" />
                  <input type="url" placeholder="URL" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                </div>
                <button type="button" onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600 p-1 mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {type === "FORM" && (
          <>
            <TextField
              label="Batas Waktu Pengisian Formulir (Opsional)"
              name="closeDate"
              type="datetime-local"
            />
            <div className="border-t pt-4">
              <QuestionEdit fields={questions} setFields={setQuestions} formId="new-step" />
            </div>
          </>
        )}

        <Button type="submit" variant="primary" isDisabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Tahapan"}
        </Button>
      </form>
    </div>
  );
}
