"use client";

import React, { useState } from "react";
import { editStep, deleteStep, updateStepOutcome } from "@/actions/recruitment";
import { FaTrash } from "react-icons/fa";
import { toast } from "sonner";

interface LinkItem {
  label: string;
  url: string;
}

interface Props {
  stepId: string;
  name: string;
  order: number;
  type: "ANNOUNCEMENT" | "FORM";
  openDate: Date;
  announcementDate: Date;
  closeDate?: Date | null;
  formId?: string | null;
  description?: string | null;
  passMessage?: string | null;
  passLinks?: LinkItem[] | null;
  failMessage?: string | null;
  failLinks?: LinkItem[] | null;
  campaignOpenDate: string;
  campaignCloseDate: string;
}

function formatDateForInput(d?: Date | null) {
  if (!d) return "";
  const date = new Date(d);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function LinksEditor({
  title,
  links,
  setLinks,
}: {
  title: string;
  links: LinkItem[];
  setLinks: (links: LinkItem[]) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</label>
        <button
          type="button"
          onClick={() => setLinks([...links, { label: "", url: "" }])}
          className="text-xs text-primary-500 hover:underline"
        >
          + Tambah
        </button>
      </div>
      {links.map((link, i) => (
        <div key={i} className="flex gap-1 items-center">
          <input
            type="text"
            placeholder="Label"
            value={link.label}
            onChange={(e) => {
              const updated = [...links];
              updated[i] = { ...updated[i], label: e.target.value };
              setLinks(updated);
            }}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-black"
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
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-black"
          />
          <button
            type="button"
            onClick={() => setLinks(links.filter((_, j) => j !== i))}
            className="text-red-400 hover:text-red-600 p-1"
          >
            <FaTrash size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function EditStepItem({
  stepId,
  name,
  order,
  type,
  openDate,
  announcementDate,
  closeDate,
  formId,
  description,
  passMessage,
  passLinks,
  failMessage,
  failLinks,
  campaignOpenDate,
  campaignCloseDate,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description || "");
  const [editOpenDate, setEditOpenDate] = useState(() => formatDateForInput(openDate));
  const [editAnnouncementDate, setEditAnnouncementDate] = useState(() => formatDateForInput(announcementDate));
  const [editCloseDate, setEditCloseDate] = useState(() => formatDateForInput(closeDate));
  const [editPassMsg, setEditPassMsg] = useState(passMessage || "");
  const [editPassLinks, setEditPassLinks] = useState<LinkItem[]>(passLinks || []);
  const [editFailMsg, setEditFailMsg] = useState(failMessage || "");
  const [editFailLinks, setEditFailLinks] = useState<LinkItem[]>(failLinks || []);

  const handleSave = async () => {
    if (!editName.trim()) return;
    if (!editOpenDate || !editAnnouncementDate) {
      toast.error("Tanggal buka dan pengumuman wajib diisi.");
      return;
    }
    if (new Date(editOpenDate) < new Date(campaignOpenDate)) {
      toast.error("Tanggal buka tahapan tidak boleh sebelum tanggal buka campaign.");
      return;
    }
    if (new Date(editAnnouncementDate) > new Date(campaignCloseDate)) {
      toast.error("Tanggal pengumuman tidak boleh setelah tanggal tutup campaign.");
      return;
    }

    setLoading(true);
    try {
      await editStep(stepId, {
        name: editName,
        description: editDescription || null,
        open_date: editOpenDate,
        announcement_date: editAnnouncementDate,
        close_date: type === "FORM" ? editCloseDate : undefined,
      });
      await updateStepOutcome(stepId, {
        pass_message: editPassMsg || null,
        pass_links: editPassLinks.filter((l) => l.label && l.url).length > 0 ? editPassLinks.filter((l) => l.label && l.url) : null,
        fail_message: editFailMsg || null,
        fail_links: editFailLinks.filter((l) => l.label && l.url).length > 0 ? editFailLinks.filter((l) => l.label && l.url) : null,
      });
      toast.success("Perubahan berhasil disimpan.");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus tahapan "${name}"? Data status peserta di tahapan ini juga akan terhapus.`)) return;
    setLoading(true);
    try {
      await deleteStep(stepId);
      toast.success("Tahapan berhasil dihapus.");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus tahapan.");
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <li className="p-4 bg-gray-50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-primary-500 font-bold">{order}.</span>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm text-black flex-1"
              placeholder="Nama Tahapan"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm text-black resize-none"
              rows={2}
              placeholder="Deskripsi tahapan..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Buka</label>
              <input
                type="datetime-local"
                value={editOpenDate}
                onChange={(e) => setEditOpenDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm text-black"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Pengumuman</label>
              <input
                type="datetime-local"
                value={editAnnouncementDate}
                onChange={(e) => setEditAnnouncementDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm text-black"
              />
            </div>
          </div>

          {type === "FORM" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Batas Waktu Formulir</label>
              <input
                type="datetime-local"
                value={editCloseDate}
                onChange={(e) => setEditCloseDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm text-black"
              />
            </div>
          )}

          <div className="border-t pt-3">
            <h5 className="text-xs font-semibold text-gray-600 mb-2">Pesan Lulus</h5>
            <textarea
              value={editPassMsg}
              onChange={(e) => setEditPassMsg(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm text-black resize-none w-full"
              rows={2}
              placeholder="Selamat! Silakan bergabung ke grup berikut."
            />
            <div className="mt-2">
              <LinksEditor title="Tautan Lulus" links={editPassLinks} setLinks={setEditPassLinks} />
            </div>
          </div>

          <div className="border-t pt-3">
            <h5 className="text-xs font-semibold text-gray-600 mb-2">Pesan Tidak Lulus</h5>
            <textarea
              value={editFailMsg}
              onChange={(e) => setEditFailMsg(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm text-black resize-none w-full"
              rows={2}
              placeholder="Mohon maaf, Anda belum lolos pada tahap ini."
            />
            <div className="mt-2">
              <LinksEditor title="Tautan Tidak Lulus" links={editFailLinks} setLinks={setEditFailLinks} />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={loading} className="bg-primary-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-primary-600 disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
            <button onClick={() => { setIsEditing(false); setEditName(name); }} disabled={loading} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-300 disabled:opacity-50">
              Batal
            </button>
          </div>
        </div>
      </li>
    );
  }

  const formatDisplay = (d?: Date | null) => d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Belum diatur";

  return (
    <li className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors group">
      <div>
        <div className="font-bold text-gray-900">
          <span className="text-primary-500 mr-2">{order}.</span>
          {name}
          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${type === "FORM" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
            {type === "FORM" ? "Formulir" : "Pengumuman"}
          </span>
        </div>
        {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
          <div>Buka: {formatDisplay(openDate)} &bull; Pengumuman: {formatDisplay(announcementDate)}</div>
          {type === "FORM" && closeDate && <div>Batas Formulir: {formatDisplay(closeDate)}</div>}
        </div>
        {passMessage && <div className="text-xs text-green-600 mt-0.5">Lulus: {passMessage}</div>}
        {failMessage && <div className="text-xs text-red-500 mt-0.5">Tidak Lulus: {failMessage}</div>}
        {passLinks && passLinks.length > 0 && (
          <div className="flex gap-1 mt-1">
            {passLinks.map((link, i) => (
              <span key={i} className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">
                {link.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {type === "FORM" && formId && (
          <a
            href={`/admin/form/${formId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            Edit Form
          </a>
        )}
        <button onClick={() => setIsEditing(true)} className="text-primary-500 hover:text-primary-700 text-xs font-medium px-2 py-1 rounded hover:bg-primary-50 transition-colors">
          Edit
        </button>
        <button onClick={handleDelete} disabled={loading} className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50">
          <FaTrash size={12} />
        </button>
      </div>
    </li>
  );
}
