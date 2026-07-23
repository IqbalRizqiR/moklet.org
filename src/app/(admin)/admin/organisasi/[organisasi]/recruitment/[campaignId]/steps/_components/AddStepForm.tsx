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

interface LinkItem {
  label: string;
  url: string;
}

function LinksEditor({
  title,
  links,
  setLinks,
}: {
  title: string;
  links: LinkItem[];
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-neutral-600">{title}</span>
        <button
          type="button"
          onClick={() => setLinks([...links, { label: "", url: "" }])}
          className="text-xs text-primary-500 hover:underline"
        >
          + Tambah Tautan
        </button>
      </div>
      {links.map((link, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Label"
              value={link.label}
              onChange={(e) => {
                const updated = [...links];
                updated[i] = { ...updated[i], label: e.target.value };
                setLinks(updated);
              }}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs mb-1"
            />
            <input
              type="url"
              placeholder="URL"
              value={link.url}
              onChange={(e) => {
                const updated = [...links];
                updated[i] = { ...updated[i], url: e.target.value };
                setLinks(updated);
              }}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => setLinks(links.filter((_, j) => j !== i))}
            className="text-red-400 hover:text-red-600 p-1 mt-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AddStepForm({
  campaignId,
  campaignOpenDate,
  campaignCloseDate,
}: {
  campaignId: string;
  campaignOpenDate: string;
  campaignCloseDate: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"ANNOUNCEMENT" | "FORM">("ANNOUNCEMENT");
  const [questions, setQuestions] = useState<FieldsWithOptions[]>([]);
  const [passLinks, setPassLinks] = useState<LinkItem[]>([]);
  const [failLinks, setFailLinks] = useState<LinkItem[]>([]);
  const [sections, setSections] = useState<{ id: number; title: string; order: number }[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    if (!name) return;

    const openDate = formData.get("open_date") as string;
    const announcementDate = formData.get("announcement_date") as string;
    const closeDate = formData.get("close_date") as string;

    if (!openDate || !announcementDate) {
      toast.error("Tanggal buka dan tanggal pengumuman wajib diisi.");
      return;
    }

    if (new Date(openDate) < new Date(campaignOpenDate)) {
      toast.error("Tanggal buka tahapan tidak boleh sebelum tanggal buka campaign.");
      return;
    }
    if (new Date(announcementDate) > new Date(campaignCloseDate)) {
      toast.error("Tanggal pengumuman tidak boleh setelah tanggal tutup campaign.");
      return;
    }
    if (new Date(openDate) > new Date(announcementDate)) {
      toast.error("Tanggal buka harus sebelum tanggal pengumuman.");
      return;
    }
    if (type === "FORM" && closeDate && new Date(closeDate) > new Date(announcementDate)) {
      toast.error("Batas waktu formulir harus sebelum tanggal pengumuman.");
      return;
    }

    if (type === "FORM" && questions.length === 0) {
      toast.error("Tahap formulir harus memiliki minimal 1 pertanyaan.");
      return;
    }

    setLoading(true);
    try {
      await addStep(campaignId, {
        name,
        type,
        description: formData.get("description") as string,
        open_date: openDate,
        announcement_date: announcementDate,
        close_date: type === "FORM" ? closeDate : undefined,
        questions: type === "FORM" ? questions : undefined,
        pass_message: formData.get("pass_message") as string,
        pass_links: passLinks.filter((l) => l.label && l.url),
        fail_message: formData.get("fail_message") as string,
        fail_links: failLinks.filter((l) => l.label && l.url),
        sections: sections.length > 0 ? sections.map((s) => ({ tempId: s.id, title: s.title, order: s.order })) : undefined,
      });
      toast.success("Tahapan berhasil ditambahkan!");
      setQuestions([]);
      setPassLinks([]);
      setFailLinks([]);
      setSections([]);
      setType("ANNOUNCEMENT");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan tahapan.");
    } finally {
      setLoading(false);
    }
  };

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

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Tanggal Buka Tahapan"
            name="open_date"
            type="datetime-local"
            required
          />
          <TextField
            label="Tanggal Pengumuman"
            name="announcement_date"
            type="datetime-local"
            required
          />
        </div>

        <p className="text-[10px] text-gray-400 -mt-2">
          Rentang campaign: {new Date(campaignOpenDate).toLocaleDateString("id-ID", { dateStyle: "medium" })} &ndash; {new Date(campaignCloseDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
        </p>

        {type === "FORM" && (
          <TextField
            label="Batas Waktu Pengisian Formulir (Opsional)"
            name="close_date"
            type="datetime-local"
          />
        )}

        <div className="border-t pt-4 mt-2">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">Setelah Peserta Lulus Tahap Ini</h4>
          <TextArea
            label="Pesan Lulus (Opsional)"
            name="pass_message"
            placeholder="Selamat! Silakan bergabung ke grup berikut."
          />
          <div className="mt-3">
            <LinksEditor title="Tautan Lulus" links={passLinks} setLinks={setPassLinks} />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">Setelah Peserta Tidak Lulus</h4>
          <TextArea
            label="Pesan Tidak Lulus (Opsional)"
            name="fail_message"
            placeholder="Mohon maaf, Anda belum lolos pada tahap ini."
          />
          <div className="mt-3">
            <LinksEditor title="Tautan Tidak Lulus" links={failLinks} setLinks={setFailLinks} />
          </div>
        </div>

        {type === "FORM" && (
          <div className="border-t pt-4">
            <QuestionEdit
              fields={questions}
              setFields={setQuestions}
              formId="new-step"
              sections={sections}
              setSections={setSections}
            />
          </div>
        )}

        <Button type="submit" variant="primary" isDisabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Tahapan"}
        </Button>
      </form>
    </div>
  );
}
