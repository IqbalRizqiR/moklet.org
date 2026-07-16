"use client";

import React, { useState } from "react";
import { editStep, deleteStep, updateStepConfig } from "@/actions/recruitment";
import { FaTrash } from "react-icons/fa";

interface Props {
  stepId: string;
  name: string;
  order: number;
  announcementDate?: Date | null;
  type?: "ANNOUNCEMENT" | "FORM";
  description?: string | null;
  successMessage?: string | null;
  successLinks?: Array<{ label: string; url: string }> | null;
}

export default function EditStepItem({ stepId, name, order, announcementDate, type = "ANNOUNCEMENT", description, successMessage, successLinks }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDate, setEditDate] = useState(() => {
    if (!announcementDate) return "";
    const d = new Date(announcementDate);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
  });
  const [editSuccessMsg, setEditSuccessMsg] = useState(successMessage || "");
  const [editSuccessLinks, setEditSuccessLinks] = useState<{ label: string; url: string }[]>(successLinks || []);

  const handleSave = async () => {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      await editStep(stepId, editName, editDate || undefined);
      await updateStepConfig(stepId, {
        success_message: editSuccessMsg || null,
        success_links: editSuccessLinks.length > 0 ? editSuccessLinks : null,
        description: description || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus tahapan "${name}"? Data status peserta di tahapan ini juga akan terhapus.`)) return;
    setLoading(true);
    try {
      await deleteStep(stepId);
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus tahapan.");
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
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu Pengumuman</label>
            <input
              type="datetime-local"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm text-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pesan Sukses (setelah lulus)</label>
            <textarea
              value={editSuccessMsg}
              onChange={(e) => setEditSuccessMsg(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm text-black resize-none"
              rows={2}
              placeholder="Selamat! Silakan bergabung ke grup berikut."
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tautan</label>
              <button
                type="button"
                onClick={() => setEditSuccessLinks([...editSuccessLinks, { label: "", url: "" }])}
                className="text-xs text-primary-500 hover:underline"
              >
                + Tambah
              </button>
            </div>
            {editSuccessLinks.map((link, i) => (
              <div key={i} className="flex gap-1 items-center">
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => {
                    const updated = [...editSuccessLinks];
                    updated[i] = { ...updated[i], label: e.target.value };
                    setEditSuccessLinks(updated);
                  }}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-black"
                />
                <input
                  type="url"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => {
                    const updated = [...editSuccessLinks];
                    updated[i] = { ...updated[i], url: e.target.value };
                    setEditSuccessLinks(updated);
                  }}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-black"
                />
                <button
                  type="button"
                  onClick={() => setEditSuccessLinks(editSuccessLinks.filter((_, j) => j !== i))}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            ))}
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
        <div className="text-sm text-gray-500 mt-1">
          Pengumuman: {announcementDate ? new Date(announcementDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : "Belum diatur"}
        </div>
        {successMessage && (
          <div className="text-xs text-gray-400 mt-0.5">Pesan: {successMessage}</div>
        )}
        {successLinks && successLinks.length > 0 && (
          <div className="flex gap-1 mt-1">
            {successLinks.map((link, i) => (
              <span key={i} className="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-full">
                {link.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
