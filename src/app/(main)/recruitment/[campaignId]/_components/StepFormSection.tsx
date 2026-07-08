"use client";

import React, { useState } from "react";
import { FormModal } from "@/app/_components/global/FormModal";
import { submitStepForm } from "@/actions/recruitment";
import { toast } from "sonner";

interface Props {
  stepId: string;
  formId: string;
  applicantId: string;
  userId: string;
}

export default function StepFormSection({ stepId, formId, applicantId, userId }: Props) {
  const [open, setOpen] = useState(false);

  const handleSuccess = async (submissionId: string) => {
    try {
      await submitStepForm(applicantId, stepId, submissionId);
      toast.success("Formulir tahap berhasil dikirim!");
      setOpen(false);
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium text-sm transition-colors"
      >
        Isi Formulir Tahap Ini
      </button>
      <FormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        formId={formId}
        userId={userId}
        onSuccess={handleSuccess}
      />
    </>
  );
}
