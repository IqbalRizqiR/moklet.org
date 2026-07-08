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

export default function Form({
  form,
  formId,
  answers,
  submission_id,
  onSuccess,
}: FormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const form = document.querySelector("#formApp");
    const checkboxes = form?.querySelectorAll(
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((checkboxes?.[i] as any).checked) return true;
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
    const toastId = toast.loading("Loading...");
    setLoading(true);
    try {
      const jsonForm = formToJSON(e.target as HTMLFormElement);
      const arrayAnswers = Object.entries(jsonForm).flatMap(([key, value]) => {
        return typeof value == "object"
          ? value.map((item) => ({ name: key, value: item }))
          : [{ name: key, value: value }];
      });

      const submission = await submitForm(formId, arrayAnswers, submission_id);
      if (submission.success) {
        toast.success("Jawaban terkirim!", {
          id: toastId,
        });
        if (onSuccess) {
          onSuccess(submission.submission_id!);
        } else {
          router.push(`/form/${formId}/alreadysubmit`);
        }
      } else {
        toast.error(submission.message, {
          id: toastId,
        });
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      toast.error((e as Error).message, {
        id: toastId,
      });
    }
  }

  return (
    <form className="block mx-auto p-6" onSubmit={handleSubmit} id="formApp">
      {form.fields?.map((field) => (
        <div key={field.id}>
          {["email", "text", "password", "number"].includes(field.type) && (
            <TextField
              type={field.type as string}
              label={field.label}
              name={field.id.toString()}
              placeholder={"Jawaban Anda"}
              className="mb-6 w-full"
              required={field.required}
              value={answers?.find((item) => item.field_id == field.id)?.value}
            />
          )}
          {field.type === "longtext" && (
            <TextArea
              label={field.label}
              name={field.id.toString()}
              placeholder={"Jawaban Anda"}
              className="mb-6 w-full"
              required={field.required}
              value={answers?.find((item) => item.field_id == field.id)?.value}
            />
          )}
          {field.type === "radio" && (
            <RadioField
              label={field.label}
              name={field.id.toString()}
              options={field.options.map((item) => ({
                id: item.field_id + "_" + item.id,
                value: item.value,
              }))}
              className="mb-6 w-full"
              required={field.required}
              value={answers?.find((item) => item.field_id === field.id)?.value}
            />
          )}
          {field.type === "checkbox" && (
            <CheckboxField
              label={field.label}
              name={field.id.toString()}
              options={field.options.map((item) => ({
                id: item.field_id + "_" + item.id,
                value: item.value,
              }))}
              className="mb-6 w-full"
              required={field.required}
              value={answers?.find((item) => item.field_id == field.id)?.value}
            />
          )}
          {field.type === "file" && (
            <FileField
              label={field.label}
              name={field.id.toString()}
              className="mb-6 w-full"
              required={field.required}
              acceptTypes={(field as unknown as { accept_types?: string | null }).accept_types}
              value={answers?.find((item) => item.field_id == field.id)?.value}
            />
          )}
        </div>
      ))}
      <div className="flex justify-between">
        <Button variant={"primary"} type="submit" isDisabled={loading}>
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
