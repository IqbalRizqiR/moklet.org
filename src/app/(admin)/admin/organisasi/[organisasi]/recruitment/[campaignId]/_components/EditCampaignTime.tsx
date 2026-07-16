"use client";

import React, { useState } from "react";
import { updateCampaign } from "@/actions/recruitment";

interface Props {
  campaignId: string;
  currentOpenDate?: Date | null;
  currentCloseDate?: Date | null;
}

export default function EditCampaignTime({ campaignId, currentOpenDate, currentCloseDate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const formatDateForInput = (d?: Date | null) => {
    if (!d) return "";
    const date = new Date(d);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - tzOffset)).toISOString().slice(0,16);
  };

  const [openDate, setOpenDate] = useState(() => formatDateForInput(currentOpenDate));
  const [closeDate, setCloseDate] = useState(() => formatDateForInput(currentCloseDate));

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateCampaign(campaignId, { open_date: openDate || undefined, close_date: closeDate || undefined });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan waktu.");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 mt-2 bg-gray-50 p-4 rounded-lg border">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu Buka</label>
          <input 
            type="datetime-local" 
            value={openDate} 
            onChange={(e) => setOpenDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm text-black"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu Tutup</label>
          <input 
            type="datetime-local" 
            value={closeDate} 
            onChange={(e) => setCloseDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm text-black"
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={handleSave} disabled={loading} className="bg-primary-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-primary-600 disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan Waktu"}
          </button>
          <button onClick={() => setIsEditing(false)} disabled={loading} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-300 disabled:opacity-50">
            Batal
          </button>
        </div>
      </div>
    );
  }

  const formatDisplay = (d?: Date | null) => d ? new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : "Tidak diatur";

  return (
    <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded border">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 block uppercase">Dibuka</span>
          <span className="font-medium">{formatDisplay(currentOpenDate)}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 block uppercase">Ditutup</span>
          <span className="font-medium">{formatDisplay(currentCloseDate)}</span>
        </div>
      </div>
      <button onClick={() => setIsEditing(true)} className="text-primary-500 hover:underline text-xs mt-2 block w-full text-left">
        Edit Waktu Pelaksanaan
      </button>
    </div>
  );
}
