"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { P } from "@/app/_components/global/Text";

interface FileFieldProps {
  label: string;
  name: string;
  required?: boolean;
  className?: string;
  value?: string;
  acceptTypes?: string | null;
}

export default function FileField({
  label,
  name,
  required,
  className,
  value,
  acceptTypes,
}: FileFieldProps) {
  const [url, setUrl] = useState(value || "");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const accept = acceptTypes || "image/*,application/pdf,.doc,.docx";
  const isImageUrl = /\.(png|jpe?g|webp|gif)$/i.test(url);

  const MAX_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE) return "File terlalu besar (maksimal 10MB)";
    if (!ALLOWED_TYPES.includes(file.type))
      return "Hanya file gambar, PDF, atau dokumen Word yang diizinkan";
    return null;
  };

  const handleFile = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Mengupload file...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || !json.data?.url) {
        throw new Error(json.message || "Gagal mengupload file");
      }

      setUrl(json.data.url);
      setFileName(json.data.name || file.name);
      toast.success("File berhasil diupload!", { id: toastId });
    } catch (e) {
      toast.error((e as Error).message, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={className}>
      <label className="block mb-2 font-medium text-neutral-900">
        {label}
        {required && <span className="text-primary-500 ml-1">*</span>}
      </label>

      {/* Hidden input carries the URL so formToJSON captures the value */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-3">
          {isImageUrl ? (
            <img src={url} alt="preview" className="h-16 w-16 rounded object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded bg-primary-50 text-primary-500">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline text-sm font-medium truncate block">
              {fileName || "Lihat file"}
            </a>
            <button
              type="button"
              onClick={() => { setUrl(""); setFileName(""); }}
              className="text-red-500 hover:text-red-700 text-xs mt-1"
            >
              Ganti file
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            dragOver ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400"
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={onInputChange}
            disabled={uploading}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div className="pointer-events-none">
            {uploading ? (
              <P className="text-sm text-gray-500">Mengupload...</P>
            ) : (
              <>
                <svg className="mx-auto mb-2 text-gray-400" width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V4m0 0L8 8m4-4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <P className="text-sm text-gray-500">Klik atau seret file ke sini</P>
                <P className="text-xs text-gray-400 mt-1">Gambar, PDF, atau Word (maks. 10MB)</P>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
