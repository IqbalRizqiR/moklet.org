"use client";

import React, { useState } from "react";
import { editCampaignDetails } from "@/actions/recruitment";

interface Props {
  campaignId: string;
  currentTitle: string;
  currentDescription?: string | null;
}

export default function EditCampaignDetails({ campaignId, currentTitle, currentDescription }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription || "");

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await editCampaignDetails(campaignId, title, description || undefined);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-lg font-bold text-black"
          placeholder="Judul Campaign"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm text-black resize-none"
          placeholder="Deskripsi (opsional)"
          rows={3}
        />
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={loading} className="bg-primary-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-primary-600 disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button onClick={() => { setIsEditing(false); setTitle(currentTitle); setDescription(currentDescription || ""); }} disabled={loading} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-300 disabled:opacity-50">
            Batal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-black">{currentTitle}</h2>
        <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary-500 transition-all text-xs">
          ✎ Edit
        </button>
      </div>
      {currentDescription && <p className="text-gray-500 text-sm mt-1">{currentDescription}</p>}
    </div>
  );
}
