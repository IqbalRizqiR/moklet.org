"use client";

import { useState, useRef } from "react";
import { editAspiration } from "@/actions/aspirasi";
import { TextField } from "@/app/_components/global/Input";
import SubmitButton from "@/app/_components/global/SubmitButton";
import Editor from "@/app/(admin)/admin/components/LazyEditor";
import { toast } from "sonner";
import { FiEdit2, FiX } from "react-icons/fi";

export default function EditAspirationModal({ aspiration }: { aspiration: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<string>(aspiration.pesan_aspirasi);
  const ref = useRef<HTMLFormElement>(null);

  async function submitForm(data: FormData) {
    const toastId = toast.loading("Menyimpan Perubahan...");
    const result = await editAspiration(aspiration.id, data, content);

    if (!result.success) {
      toast.error(result.message, { id: toastId });
      return;
    }
    
    toast.success(result.message, { id: toastId });
    setIsOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-500 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
      >
        <FiEdit2 className="w-4 h-4" />
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white z-10 p-6 flex items-center justify-between border-b border-neutral-100">
              <div>
                <h2 className="text-2xl font-black text-neutral-800">Edit Aspirasi</h2>
                <p className="text-sm text-neutral-500 font-medium">Buat perubahan pada aspirasi Anda.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form action={submitForm} ref={ref} className="space-y-6">
                <TextField
                  type="text"
                  name="judulAspirasi"
                  value={aspiration.judul_aspirasi}
                  required
                  label="Judul Aspirasi"
                  placeholder="Judul Aspirasi Anda"
                />

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-600 block">Isi Aspirasi</label>
                  <div className="min-h-[200px] rounded-xl overflow-hidden border border-neutral-100">
                    <Editor
                      onChange={(value) => setContent(value ?? "")}
                      value={content}
                      hostType="IMGBB"
                    />
                  </div>
                </div>

                <div className="space-y-2 bg-primary-50/50 p-4 rounded-2xl border border-primary-100/50">
                  <label className="text-sm font-bold text-primary-600 block">Perbarui Lampiran (Opsional)</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="block w-full text-xs text-neutral-500
                      file:mr-4 file:py-2.5 file:px-5
                      file:rounded-xl file:border-0
                      file:text-xs file:font-semibold
                      file:bg-primary-100 file:text-primary-600
                      hover:file:bg-primary-200
                      border border-white bg-white/50 rounded-xl
                      transition-all"
                  />
                  {aspiration.gambar_aspirasi && (
                    <p className="text-[10px] text-primary-500/70 mt-2 italic font-medium">
                      Memilih file baru akan menimpa gambar sebelumnya. Biarkan kosong jika tidak ingin mengubah.
                    </p>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3 rounded-2xl font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                  >
                    Batal
                  </button>
                  <SubmitButton label="Simpan Perubahan" />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
