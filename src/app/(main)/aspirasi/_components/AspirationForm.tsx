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
              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  name="isAnonymous"
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700">
                  Ajukan secara anonim (Sembunyikan nama & identitas saya)
                </label>
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
