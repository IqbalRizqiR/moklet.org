"use client";

import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { findFormById } from "@/actions/formAspirasi";
import { submitForm } from "@/actions/formAspirasi";
import { Button } from "@/app/_components/global/Button";
import { H2 } from "@/app/_components/global/Text";
import {
  CheckboxField,
  RadioField,
  TextArea,
  TextField,
} from "@/app/_components/global/Input";
import FileField from "@/app/(form)/form/_components/FileField";
import { FormWithFields } from "@/types/entityRelations";
import { formToJSON } from "@/utils/atomics";
import { toast } from "sonner";

interface RegistrationWizardProps {
  formId: string;
  userId: string;
  campaignId: string;
  onSuccess: (submissionId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface FieldSection {
  id: string;
  name: string;
  fields: any[];
}

export default function RegistrationWizard({
  formId,
  userId,
  campaignId,
  onSuccess,
  onClose,
  isOpen,
}: RegistrationWizardProps) {
  const [form, setForm] = useState<FormWithFields | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<FieldSection[]>([]);
  const [allValues, setAllValues] = useState<Record<string, string | string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const saveCurrentPage = useCallback(() => {
    if (!formRef.current) return;
    const json = formToJSON(formRef.current) as unknown as Record<string, string | string[]>;
    setAllValues((prev) => ({ ...prev, ...json }));
  }, []);

  useEffect(() => {
    if (isOpen && formId) {
      setLoading(true);
      setError("");
      setCurrentPage(0);
      findFormById(formId, true)
        .then((f) => {
          if (!f) {
            setError("Form tidak ditemukan atau sudah ditutup.");
          } else {
            const formData = f as unknown as FormWithFields;
            setForm(formData);

            // Split fields into pages based on sections
            const formSections = (formData as any).sections || [];
            if (formSections.length > 0) {
              const sorted = [...formSections].sort(
                (a: any, b: any) => a.order - b.order
              );
              const sectionPages: FieldSection[] = sorted.map((s: any) => ({
                id: `section-${s.id}`,
                name: s.title || `Bagian ${s.order}`,
                fields: (formData.fields || []).filter(
                  (f: any) => f.section_id === s.id
                ),
              }));
              // Unassigned fields merge into the first section's page
              const unassigned = (formData.fields || []).filter(
                (f: any) => f.section_id === null
              );
              if (unassigned.length > 0) {
                if (sectionPages.length > 0) {
                  sectionPages[0] = {
                    ...sectionPages[0],
                    fields: [...unassigned, ...sectionPages[0].fields],
                  };
                } else {
                  sectionPages.push({
                    id: "unassigned",
                    name: "Formulir",
                    fields: unassigned,
                  });
                }
              }
              setPages(sectionPages);
            } else {
              setPages([
                {
                  id: "all",
                  name: "Formulir",
                  fields: formData.fields || [],
                },
              ]);
            }
          }
        })
        .catch(() => setError("Gagal memuat formulir."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, formId]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(0);
      setForm(null);
      setPages([]);
      setError("");
      setAllValues({});
    }
  }, [isOpen]);

  useEffect(() => {
    const formElement = document.querySelector("#wizardForm");
    const checkboxes = formElement?.querySelectorAll(
      "input[type=checkbox][data-required=true]"
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
  }, [currentPage, pages]);

  const handleNext = () => {
    const formElement = formRef.current;
    if (formElement && !formElement.checkValidity()) {
      formElement.reportValidity();
      return;
    }
    saveCurrentPage();
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    saveCurrentPage();
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formElement = formRef.current;
    if (formElement && !formElement.checkValidity()) {
      formElement.reportValidity();
      return;
    }
    saveCurrentPage();

    const toastId = toast.loading("Mengirim formulir...");
    setSubmitting(true);

    try {
      const arrayAnswers = Object.entries(allValues).flatMap(([key, value]) => {
        return Array.isArray(value)
          ? value.map((item) => ({ name: key, value: item }))
          : [{ name: key, value: value }];
      });

      const submission = await submitForm(formId, arrayAnswers);
      if (submission.success) {
        toast.success("Formulir berhasil dikirim!", { id: toastId });
        onSuccess(submission.submission_id!);
      } else {
        toast.error(submission.message, { id: toastId });
        setSubmitting(false);
      }
    } catch (err) {
      setSubmitting(false);
      toast.error((err as Error).message, { id: toastId });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        <div className="border-b p-6">
          <div className="mb-4 flex items-center justify-between">
            <H2>{form ? form.title : "Memuat Formulir..."}</H2>
            <button
              onClick={onClose}
              className="text-xl font-bold text-gray-500 hover:text-black"
            >
              &times;
            </button>
          </div>

          {form && pages.length > 1 && (
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-700">
                  Langkah {currentPage + 1} dari {pages.length}
                </span>
                <span className="text-neutral-500">
                  {pages[currentPage]?.name}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{
                    width: `${((currentPage + 1) / pages.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && <p className="text-neutral-600">Tunggu sebentar...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {form && !loading && !error && pages.length > 0 && (
            <form onSubmit={handleSubmit} ref={formRef} id="wizardForm">
              <div className="space-y-6">
                {pages[currentPage]?.fields.map((field: any) => (
                  <div key={field.id}>
                    {["email", "text", "password", "number"].includes(
                      field.type
                    ) && (
                      <TextField
                        type={field.type as string}
                        label={field.label}
                        name={field.id.toString()}
                        placeholder="Jawaban Anda"
                        className="w-full"
                        required={field.required}
                      />
                    )}
                    {field.type === "longtext" && (
                      <TextArea
                        label={field.label}
                        name={field.id.toString()}
                        placeholder="Jawaban Anda"
                        className="w-full"
                        required={field.required}
                      />
                    )}
                    {field.type === "radio" && (
                      <RadioField
                        label={field.label}
                        name={field.id.toString()}
                        options={field.options.map((item: any) => ({
                          id: item.field_id + "_" + item.id,
                          value: item.value,
                        }))}
                        className="w-full"
                        required={field.required}
                      />
                    )}
                    {field.type === "checkbox" && (
                      <CheckboxField
                        label={field.label}
                        name={field.id.toString()}
                        options={field.options.map((item: any) => ({
                          id: item.field_id + "_" + item.id,
                          value: item.value,
                        }))}
                        className="w-full"
                        required={field.required}
                      />
                    )}
                    {field.type === "file" && (
                      <FileField
                        label={field.label}
                        name={field.id.toString()}
                        className="w-full"
                        required={field.required}
                        acceptTypes={
                          (field as any).accept_types
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>

        <div className="border-t p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={handleBack}
              isDisabled={currentPage === 0 || submitting}
              type="button"
            >
              Kembali
            </Button>

            {currentPage < pages.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                isDisabled={submitting}
                type="button"
              >
                Selanjutnya
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  formRef.current?.dispatchEvent(
                    new Event("submit", { cancelable: true, bubbles: true })
                  );
                }}
                isDisabled={submitting}
                type="button"
              >
                Kirim
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
