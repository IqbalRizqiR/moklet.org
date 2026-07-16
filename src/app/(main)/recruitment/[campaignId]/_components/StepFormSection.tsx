"use client";

import React, { useState, useEffect } from "react";
import type { Submission_Field } from "@prisma/client";
import { FormModal } from "@/app/_components/global/FormModal";
import { submitStepForm } from "@/actions/recruitment";
import { getSubmissionFields } from "@/actions/formAspirasi";
import { toast } from "sonner";

interface Props {
  stepId: string;
  formId: string;
  applicantId: string;
  userId: string;
  hasSubmission?: boolean;
  submissionId?: string | null;
}

export default function StepFormSection({ stepId, formId, applicantId, userId, hasSubmission, submissionId }: Props) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Submission_Field[] | undefined>(undefined);

  useEffect(() => {
    if (open && hasSubmission && submissionId) {
      getSubmissionFields(submissionId).then((fields) => setAnswers(fields || []));
    } else if (open) {
      setAnswers(undefined);
    }
  }, [open, hasSubmission, submissionId]);

  const handleSuccess = async (newSubmissionId: string) => {
    try {
      await submitStepForm(applicantId, stepId, newSubmissionId);
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
        {hasSubmission ? "Edit Formulir Tahap Ini" : "Isi Formulir Tahap Ini"}
      </button>
      <FormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        formId={formId}
        userId={userId}
        onSuccess={handleSuccess}
        answers={answers}
        submission_id={submissionId || undefined}
      />
    </>
  );
}
