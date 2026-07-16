"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateCampaign } from "@/actions/recruitment";

interface Props {
  campaignId: string;
  currentMessage?: string | null;
  currentLinks?: Array<{ label: string; url: string }> | null;
}

export default function EditCampaignSuccessConfig({
  campaignId,
  currentMessage,
  currentLinks,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(currentMessage || "");
  const [links, setLinks] = useState<{ label: string; url: string }[]>(
    currentLinks || [],
  );

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateCampaign(campaignId, {
        registration_success_message: message || null,
        registration_success_links: links.length > 0 ? links : null,
      });
      toast.success("Konfigurasi berhasil disimpan!");
      setIsEditing(false);
    } catch {
      toast.error("Gagal menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-neutral-800">Pesan & Tautan Setelah Pendaftaran</h3>
            {currentMessage && (
              <p className="text-sm text-gray-600 mt-2">{currentMessage}</p>
            )}
            {currentLinks && currentLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentLinks.map((link, i) => (
                  <span key={i} className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full">
                    {link.label}
                  </span>
                ))}
              </div>
            )}
            {!currentMessage && (!currentLinks || currentLinks.length === 0) && (
              <p className="text-sm text-gray-400 mt-2">Belum diatur</p>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-primary-500 hover:underline"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
      <h3 className="font-semibold text-neutral-800 mb-4">Pesan & Tautan Setelah Pendaftaran</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Pesan Sukses (Opsional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            rows={2}
            placeholder="Selamat! Anda telah terdaftar. Silakan bergabung ke grup WhatsApp di bawah."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-700">Tautan</span>
            <button
              type="button"
              onClick={() => setLinks([...links, { label: "", url: "" }])}
              className="text-xs text-primary-500 hover:underline"
            >
              + Tambah Tautan
            </button>
          </div>
          {links.length === 0 && (
            <p className="text-xs text-gray-400">Belum ada tautan.</p>
          )}
          {links.map((link, i) => (
            <div key={i} className="flex gap-2 items-start mb-2">
              <input
                type="text"
                placeholder="Label (contoh: Grup WA Angkatan)"
                value={link.label}
                onChange={(e) => {
                  const updated = [...links];
                  updated[i] = { ...updated[i], label: e.target.value };
                  setLinks(updated);
                }}
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
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
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => setLinks(links.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setMessage(currentMessage || "");
              setLinks(currentLinks || []);
            }}
            disabled={loading}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
