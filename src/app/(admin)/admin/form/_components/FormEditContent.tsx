"use client";

import { useRouter } from "next-nprogress-bar";
import { useEffect, useLayoutEffect, useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { toast } from "sonner";

import { deleteSubmission, saveForm } from "@/actions/formAdmin";
import { Button } from "@/app/_components/global/Button";
import { TextField } from "@/app/_components/global/Input";
import { FormWithFields } from "@/types/entityRelations";
import { convertToDateTimeLocalString } from "@/utils/atomics";

import QuestionEdit from "./QuestionEdit";

export default function FormEditContent({
  form,
  isNewForm,
}: {
  form: FormWithFields;
  isNewForm: boolean;
}) {
  const [formData, setFormData] = useState(form);
  const [questions, setQuestions] = useState(form.fields);
  const [sections, setSections] = useState(
    form.sections.map((s) => ({ id: s.id, title: s.title || "", order: s.order })),
  );
  const [saved, setSaved] = useState(true);
  const router = useRouter();

  useEffect(() => {
    function unloadPage() {
      if (!saved) {
        return "You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page?";
      }
    }

    window.onbeforeunload = unloadPage;
    return () => {
      window.onbeforeunload = null;
    };
  });

  useLayoutEffect(() => {
    setSaved(false);
  }, [formData, questions, sections]);

  async function save() {
    const toastId = toast.loading("Loading...");
    const action = await saveForm(
      {
        ...formData,
        fields: questions,
        sections: sections.map((s) => ({ ...s, form_id: form.id })),
      },
      isNewForm,
      JSON.stringify(questions) != JSON.stringify(form.fields),
    );
    if (action?.error) return toast.error(action.message, { id: toastId });
    toast.success(action?.message, { id: toastId });
    setSaved(true);
    router.push(`/admin/form/${action.data?.id}`);
  }

  async function clearResponse() {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus semua jawaban?\n*Jawaban tidak dapat dikembalikan",
      )
    )
      return;
    const toastId = toast.loading("Loading...");
    const id = form.id;
    const action = await deleteSubmission(id);
    if (action?.error) return toast.error(action.message, { id: toastId });
    toast.success(action?.message, { id: toastId });
  }

  return (
    <>
      <TextField
        name="title"
        label="title"
        type="text"
        value={formData.title}
        required
        handleChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
      />
      <TextField
        name="description"
        label="description"
        type="text"
        value={formData.description || ""}
        handleChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />
      <div className="flex flex-col gap-2">
        <p className="text-black">Pengaturan</p>
        <div className="flex gap-x-2 cursor-pointer items-center">
          <input
            type="checkbox"
            name="is_open"
            value="true"
            defaultChecked={formData.is_open}
            className="w-5 h-5 cursor-pointer bg-white text-primary-500 accent-primary-500 shrink-0 mt-0.5 border-gray-200 rounded focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none transition-all"
            id="is_open"
            onChange={(e) =>
              setFormData({
                ...formData,
                is_open: e.target.checked,
              })
            }
          />
          <label htmlFor="is_open" className="cursor-pointer ms-2">
            Formulir sedang menerima jawaban
          </label>
        </div>
        <div className="flex gap-x-2 cursor-pointer items-center">
          <input
            type="checkbox"
            name="allow_edit"
            value="true"
            disabled={!formData.submit_once}
            defaultChecked={formData.allow_edit}
            className="w-5 h-5 cursor-pointer bg-white text-primary-500 accent-primary-500 shrink-0 mt-0.5 border-gray-200 rounded focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none transition-all"
            id="allow_edit"
            onChange={(e) =>
              setFormData({
                ...formData,
                allow_edit: e.target.checked,
              })
            }
          />
          <label htmlFor="allow_edit" className="cursor-pointer ms-2">
            Jawaban dapat dirubah
          </label>
        </div>
        <div className="flex gap-x-2 cursor-pointer items-center">
          <input
            type="checkbox"
            name="submit_once"
            value="true"
            disabled={formData.allow_edit}
            defaultChecked={formData.allow_edit || formData.submit_once}
            className="w-5 h-5 cursor-pointer bg-white text-primary-500 accent-primary-500 shrink-0 mt-0.5 border-gray-200 rounded focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none transition-all"
            id="submit_once"
            onChange={(e) =>
              setFormData({
                ...formData,
                submit_once: e.target.checked,
              })
            }
          />
          <label htmlFor="submit_once" className="cursor-pointer ms-2">
            Hanya dapat mengisi sekali
          </label>
        </div>
        <TextField
          name="open_at"
          label="Dibuka pada"
          type="datetime-local"
          value={
            (formData.open_at &&
              convertToDateTimeLocalString(formData.open_at)) ||
            ""
          }
          handleChange={(e) =>
            setFormData({
              ...formData,
              open_at: new Date(e.target.value),
            })
          }
        />
        <TextField
          name="close_at"
          label="Ditutup pada"
          type="datetime-local"
          value={
            (formData.close_at &&
              convertToDateTimeLocalString(formData.close_at)) ||
            ""
          }
          handleChange={(e) =>
            setFormData({
              ...formData,
              close_at: new Date(e.target.value),
            })
          }
        />
      </div>
      <Button variant={"primary"} className="w-full" onClick={save}>
        Simpan
      </Button>
      <p className="text-black">
        Total jawaban: <b>{formData._count.submissions}</b>
      </p>
      <div>
        <button
          className="p-2 rounded-md hover:text-red-500 transition-all gap-2 flex items-center bg-slate-300"
          onClick={clearResponse}
        >
          Hapus semua jawaban
          <MdDeleteOutline />
        </button>
      </div>
      <QuestionEdit
        fields={questions}
        setFields={setQuestions}
        formId={form.id}
        sections={sections}
        setSections={setSections}
      />
    </>
  );
}
