"use client";

import type { Submission_Field } from "@prisma/client";
import { useRouter } from "next-nprogress-bar";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { submitForm } from "@/actions/formAspirasi";
import { Button } from "@/app/_components/global/Button";
import {
  CheckboxField,
  RadioField,
  TextArea,
  TextField,
} from "@/app/_components/global/Input";
import FileField from "./FileField";
import { FormWithFields } from "@/types/entityRelations";
import { formToJSON } from "@/utils/atomics";

interface FormProps {
  form: FormWithFields;
  formId: string;
  answers?: Submission_Field[];
  submission_id?: string;
  onSuccess?: (submission_id: string) => void;
}

function renderField(
  field: FormWithFields["fields"][number],
  answers?: Submission_Field[],
) {
  const value = answers?.find((item) => item.field_id == field.id)?.value;

  if (["email", "text", "password", "number"].includes(field.type)) {
    return (
      <TextField
        key={field.id}
        type={field.type}
        label={field.label}
        name={field.id.toString()}
        placeholder="Jawaban Anda"
        className="mb-6 w-full"
        required={field.required}
        value={value}
      />
    );
  }
  if (field.type === "longtext") {
    return (
      <TextArea
        key={field.id}
        label={field.label}
        name={field.id.toString()}
        placeholder="Jawaban Anda"
        className="mb-6 w-full"
        required={field.required}
        value={value}
      />
    );
  }
  if (field.type === "radio") {
    return (
      <RadioField
        key={field.id}
        label={field.label}
        name={field.id.toString()}
        options={field.options.map((item) => ({
          id: item.field_id + "_" + item.id,
          value: item.value,
        }))}
        className="mb-6 w-full"
        required={field.required}
        value={value}
      />
    );
  }
  if (field.type === "checkbox") {
    return (
      <CheckboxField
        key={field.id}
        label={field.label}
        name={field.id.toString()}
        options={field.options.map((item) => ({
          id: item.field_id + "_" + item.id,
          value: item.value,
        }))}
        className="mb-6 w-full"
        required={field.required}
        value={value}
      />
    );
  }
  if (field.type === "file") {
    return (
      <FileField
        key={field.id}
        label={field.label}
        name={field.id.toString()}
        className="mb-6 w-full"
        required={field.required}
        acceptTypes={(field as unknown as { accept_types?: string | null }).accept_types}
        value={value}
      />
    );
  }
  return null;
}

export default function Form({
  form,
  formId,
  answers,
  submission_id,
  onSuccess,
}: FormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const formEl = document.querySelector("#formApp");
    const checkboxes = formEl?.querySelectorAll(
      "input[type=checkbox][data-required=true]",
    );
    const checkboxLength = checkboxes?.length ?? 0;
    const firstCheckbox = checkboxLength > 0 ? checkboxes?.[0] : null;

    function init() {
      if (firstCheckbox) {
        for (let i = 0; i < checkboxLength; i++) {
          checkboxes?.[i].addEventListener("change", checkValidity);
        }
        checkValidity();
      }
    }

    function isChecked() {
      for (let i = 0; i < checkboxLength; i++) {
        if ((checkboxes?.[i] as HTMLInputElement).checked) return true;
      }
      return false;
    }

    function checkValidity() {
      const errorMessage = !isChecked()
        ? "At least one checkbox must be selected."
        : "";
      (firstCheckbox as HTMLInputElement).setCustomValidity(errorMessage);
    }

    init();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Loading...");
    try {
      const jsonForm = formToJSON(e.target as HTMLFormElement);
      const arrayAnswers = Object.entries(jsonForm).flatMap(([key, value]) => {
        return typeof value == "object"
          ? value.map((item) => ({ name: key, value: item }))
          : [{ name: key, value: value }];
      });

      const submission = await submitForm(formId, arrayAnswers, submission_id);
      if (submission.success) {
        toast.success("Jawaban terkirim!", { id: toastId });
        if (onSuccess) {
          onSuccess(submission.submission_id!);
        } else {
          router.push(`/form/${formId}/alreadysubmit`);
        }
      } else {
        toast.error(submission.message, { id: toastId });
      }
    } catch (e) {
      toast.error((e as Error).message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  const sections = form.sections?.length ? form.sections : null;
  const hasSections = sections && sections.length > 0;
  const uncategorized = form.fields?.filter((f) => !f.section_id) || [];

  return (
    <form className="block mx-auto p-6" onSubmit={handleSubmit} id="formApp">
      {hasSections
        ? sections.map((section) => {
            const sectionFields = form.fields?.filter(
              (f) => f.section_id === section.id,
            );
            if (!sectionFields?.length) return null;
            return (
              <div key={section.id} className="mb-10">
                <h3 className="mb-4 text-xl font-bold text-black">
                  {section.title || `Bagian ${section.order}`}
                </h3>
                {sectionFields.map((field) => renderField(field, answers))}
              </div>
            );
          })
        : null}
      {uncategorized.map((field) => renderField(field, answers))}
      <div className="flex justify-between">
        <Button variant="primary" type="submit" isDisabled={loading}>
          Kirim
        </Button>
        <button
          type="reset"
          className="cursor-pointer text-neutral-500 hover:text-primary-500 transition-all"
        >
          Hapus jawaban
        </button>
      </div>
    </form>
  );
}
