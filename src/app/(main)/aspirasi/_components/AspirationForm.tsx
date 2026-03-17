"use client";

import { aspirationType, submitAspiration } from "@/actions/aspirasi";
import Editor from "@/app/(admin)/admin/components/LazyEditor";
import { TextField } from "@/app/_components/global/Input";
import SubmitButton from "@/app/_components/global/SubmitButton";
import { H3 } from "@/app/_components/global/Text";
import { Session } from "next-auth";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function AspirationForm({
  recipient,
  type,
  eventName,
}: {
  recipient: string;
  type: aspirationType;
  eventName: string;
}) {
  const [aspiration, setAspiration] = useState<string>("");
  const ref = useRef<HTMLFormElement>(null);
  async function submitForm(data: FormData) {
    const toastId = toast.loading("Mengirim Aspirasi...");
    const result = await submitAspiration(data, aspiration, type, recipient);

    if (!result.success) {
      toast.error(result.message, { id: toastId });
      return;
    }
    ref.current?.reset();
    setAspiration("");
    toast.success(result.message, { id: toastId });
  }

  return (
    <div id="form" className="mt-2">
      {recipient && type && (
        <>
          <H3>
            Tuliskan aspirasi anda untuk{" "}
            {type !== "EVENT" ? recipient : eventName}
          </H3>
          <form action={submitForm} ref={ref} className="mt-4">
            <div className="flex flex-col gap-5 mb-5">
                <TextField
                  type="text"
                  name="judulAspirasi"
                  required
                label="Judul Aspirasi"
                placeholder="Judul Aspirasi Anda"
                />
                    <Editor
                      onChange={(value) => {
                        setAspiration(value ?? "");
                      }}
                      value={aspiration}
                label="Isi Aspirasi"
                      hostType="IMGBB"
                    />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Lampiran Gambar (Opsional)</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-xl file:border-0
                    file:text-sm file:font-semibold
                    file:bg-red-50 file:text-red-700
                    hover:file:bg-red-100
                    border border-gray-100 rounded-xl bg-white/50
                    transition-all"
                />
                <p className="text-[10px] text-gray-400">Pilih gambar jika ingin melampirkan bukti atau visualisasi aspirasi.</p>
              </div>
                  </div>
            <div className="w-full flex justify-end">
              <SubmitButton />
              </div>
            </form>
          </>
      )}
    </div>
  );
}
