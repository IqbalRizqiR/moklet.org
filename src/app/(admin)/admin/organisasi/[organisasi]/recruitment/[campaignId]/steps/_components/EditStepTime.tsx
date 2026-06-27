"use client";

import React, { useState } from "react";
import { editStepTime } from "@/actions/recruitment";

interface Props {
  stepId: string;
  currentDate?: Date | null;
}

export default function EditStepTime({ stepId, currentDate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(() => {
    if (!currentDate) return "";
    // format for datetime-local: YYYY-MM-DDTHH:mm
    const d = new Date(currentDate);
    const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0,16);
    return localISOTime;
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await editStepTime(stepId, date || undefined);
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
      <div className="flex flex-col gap-2 mt-2">
        <input 
          type="datetime-local" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm text-black"
        />
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={loading} className="bg-primary-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-primary-600 disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button onClick={() => setIsEditing(false)} disabled={loading} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-300 disabled:opacity-50">
            Batal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
      Pengumuman: {currentDate ? new Date(currentDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : "Belum diatur"}
      <button onClick={() => setIsEditing(true)} className="text-primary-500 hover:underline text-xs ml-2">
        Edit Waktu
      </button>
    </div>
  );
}
