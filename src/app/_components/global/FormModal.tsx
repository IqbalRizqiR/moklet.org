"use client";

import React, { useEffect, useState } from "react";
import type { Submission_Field } from "@prisma/client";
import { findFormById } from "@/actions/formAspirasi";
import Form from "@/app/(form)/form/_components/Form";
import { FormWithFields } from "@/types/entityRelations";
import { H2 } from "@/app/_components/global/Text";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  userId: string;
  onSuccess: (submissionId: string) => void;
  answers?: Submission_Field[];
  submission_id?: string;
}

export function FormModal({ isOpen, onClose, formId, userId, onSuccess, answers, submission_id }: FormModalProps) {
  const [form, setForm] = useState<FormWithFields | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && formId) {
      setLoading(true);
      setError("");
      findFormById(formId, true)
        .then((f) => {
          if (!f) setError("Form tidak ditemukan atau sudah ditutup.");
          else setForm(f as unknown as FormWithFields);
        })
        .catch(() => setError("Gagal memuat formulir."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, formId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl"
        >
          &times;
        </button>
        
        <div className="mb-4">
          <H2>{form ? form.title : "Memuat Formulir..."}</H2>
          {form?.description && <p className="text-gray-600 mt-2">{form.description}</p>}
        </div>
        
        {loading && <p>Tunggu sebentar...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {form && !loading && !error && (
          <div className="border-t pt-4">
            <Form 
              form={form} 
              formId={formId} 
              answers={answers}
              submission_id={submission_id}
              onSuccess={(subId) => {
                onSuccess(subId);
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
