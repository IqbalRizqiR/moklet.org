"use client";

import { useRouter } from "next-nprogress-bar";
import { toast } from "sonner";
import { createEventAction } from "@/actions/event";
import { SelectField, TextArea, TextField } from "@/app/_components/global/Input";

export default function EventForm({
  organizations,
  isAdmin,
}: {
  organizations: any[];
  isAdmin: boolean;
}) {
  const router = useRouter();

  const orgOptions = organizations.map((org) => ({
    label: org.organisasi.organisasi_name,
    value: org.organisasi_id,
  }));

  return (
    <form
      action={async (formData) => {
        const toastId = toast.loading("Membuat Event...");
        const res = await createEventAction(formData);

        if (res?.error) {
          toast.error(res.message, { id: toastId });
          return;
        }

        toast.success(res?.message, { id: toastId });
        router.push("/admin/events");
      }}
      className="flex flex-col gap-6 bg-white p-6 rounded-2xl shadow-sm border"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          type="text"
          label="Nama Event"
          name="event_name"
          placeholder="Moklet Youth Festival 2026"
          required
        />
        
        {/* Only Admin/SuperAdmin can manually select. Otherwise, if user leads an org, auto-assign it via hidden input. */}
        {isAdmin ? (
          <SelectField
            label="Organisasi Penyelenggara (Opsional)"
            name="organisasi_id"
            options={orgOptions}
          />
        ) : organizations.length > 0 ? (
          <input type="hidden" name="organisasi_id" value={organizations[0].organisasi_id} />
        ) : null}
      </div>

      <TextArea
        label="Deskripsi Event"
        name="description"
        placeholder="Penjelasan singkat mengenai acara ini"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Tanggal Mulai"
          name="start_date"
          type="date"
          required
        />
        <TextField
          label="Tanggal Selesai"
          name="end_date"
          type="date"
          required
        />
      </div>

      <div className="my-4">
        <button
          type="submit"
          className="w-full bg-primary-600 text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition"
        >
          Submit Event Baru
        </button>
      </div>
    </form>
  );
}
