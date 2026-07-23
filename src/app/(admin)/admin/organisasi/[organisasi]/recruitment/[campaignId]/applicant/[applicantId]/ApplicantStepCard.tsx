"use client";

import { useState, useCallback } from "react";
import { passApplicantStep } from "@/actions/recruitment";

function SubmissionAnswers({
  submission,
}: {
  submission: {
    fields: Array<{
      value: string;
      field: { id: number; label: string; type: string };
    }>;
    form: {
      fields: Array<{
        id: number;
        label: string;
        type: string;
        options: Array<{ id: number; value: string }>;
      }>;
    };
  };
}) {
  const formFields = submission.form.fields;
  const answerMap = new Map(
    submission.fields.map((sf) => [sf.field.id, sf.value]),
  );

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Jawaban
      </p>
      {formFields.map((field) => {
        const answer = answerMap.get(field.id);
        const isImage =
          field.type === "file" &&
          typeof answer === "string" &&
          /\.(png|jpe?g|webp|gif)$/i.test(answer);

        return (
          <div key={field.id} className="text-sm">
            <span className="font-medium text-gray-700">{field.label}</span>
            <div className="mt-0.5 text-gray-900">
              {field.type === "file" && answer ? (
                <a
                  href={answer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline inline-flex items-center gap-1"
                >
                  {isImage ? (
                    <img
                      src={answer}
                      alt={field.label}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Lihat File
                    </>
                  )}
                </a>
              ) : field.type === "radio" || field.type === "checkbox" ? (
                <span className="text-gray-900">
                  {answer || <span className="text-gray-400">Tidak dijawab</span>}
                </span>
              ) : (
                <p className="whitespace-pre-wrap">
                  {answer || <span className="text-gray-400">Tidak dijawab</span>}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ApplicantStepCard({
  applicantId,
  step,
  statusText,
  submission,
}: {
  applicantId: string;
  step: { id: string; name: string; type: string; form_id?: string | null };
  statusText: string;
  submission: any;
}) {
  const [showAnswers, setShowAnswers] = useState(false);

  const handlePass = useCallback(async () => {
    await passApplicantStep(applicantId, step.id, "PASSED");
  }, [applicantId, step.id]);

  const handleFail = useCallback(async () => {
    await passApplicantStep(applicantId, step.id, "FAILED");
  }, [applicantId, step.id]);

  const handlePending = useCallback(async () => {
    await passApplicantStep(applicantId, step.id, "PENDING");
  }, [applicantId, step.id]);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="font-semibold mb-2">{step.name}</div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handlePass}
          disabled={statusText === "PASSED"}
          className={`px-3 py-1 rounded text-sm font-medium ${statusText === "PASSED" ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Lulus
        </button>
        <button
          onClick={handleFail}
          disabled={statusText === "FAILED"}
          className={`px-3 py-1 rounded text-sm font-medium ${statusText === "FAILED" ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Gagal
        </button>
        <button
          onClick={handlePending}
          disabled={statusText === "PENDING"}
          className={`px-3 py-1 rounded text-sm font-medium ${statusText === "PENDING" ? 'bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Pending
        </button>
        {step.type === "FORM" && submission && (
          <button
            type="button"
            onClick={() => setShowAnswers(!showAnswers)}
            className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            {showAnswers ? "Sembunyikan Jawaban" : "Lihat Jawaban"}
          </button>
        )}
      </div>
      {showAnswers && submission && <SubmissionAnswers submission={submission} />}
    </div>
  );
}
