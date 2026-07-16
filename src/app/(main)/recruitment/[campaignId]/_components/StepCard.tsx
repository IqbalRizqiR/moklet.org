"use client";

import React, { useState } from "react";
import CountdownTimer from "@/app/_components/global/CountdownTimer";
import StepFormSection from "./StepFormSection";
import SuccessModal from "./SuccessModal";
import cn from "@/lib/clsx";

interface StepCardProps {
  step: {
    id: string;
    name: string;
    description?: string | null;
    type: "ANNOUNCEMENT" | "FORM";
    announcement_date?: Date | string | null;
    close_date?: Date | string | null;
    form_id?: string | null;
    success_message?: string | null;
    success_links?: Array<{ label: string; url: string }> | null;
  };
  stepNumber: number;
  status:
    | "LOCKED"
    | "ACTIVE"
    | "FORM_SUBMITTED"
    | "WAITING_ANNOUNCEMENT"
    | "PASSED"
    | "FAILED";
  applicantId?: string;
  userId?: string;
  hasSubmission?: boolean;
}

export default function StepCard({
  step,
  stepNumber,
  status,
  applicantId,
  userId,
  hasSubmission,
}: StepCardProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const announcementDate = step.announcement_date
    ? new Date(step.announcement_date)
    : null;
  const announcementPassed =
    announcementDate && announcementDate.getTime() <= Date.now();

  const renderStatusBadge = () => {
    if (status === "PASSED") {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
          LULUS
        </span>
      );
    }
    if (status === "FAILED") {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
          TIDAK LULUS
        </span>
      );
    }
    if (status === "FORM_SUBMITTED") {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
          Formulir Terkirim
        </span>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (status === "LOCKED") {
      return (
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
            <svg
              className="h-5 w-5 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-400">
              {step.name}
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              Selesaikan tahap sebelumnya terlebih dahulu
            </p>
          </div>
        </div>
      );
    }

    if (status === "PASSED") {
      return (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">{step.name}</h3>
            {renderStatusBadge()}
          </div>
          {step.description && (
            <p className="mb-3 text-sm text-neutral-600">{step.description}</p>
          )}
          {announcementPassed && step.success_links && step.success_links.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {step.success_links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-primary-300 bg-white px-4 py-2 text-sm text-primary-500 transition-all hover:border-primary-400 hover:bg-primary-50"
                >
                  {link.label}
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (status === "FAILED") {
      return (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">{step.name}</h3>
            {renderStatusBadge()}
          </div>
          {step.description && (
            <p className="text-sm text-neutral-600">{step.description}</p>
          )}
        </div>
      );
    }

    if (status === "FORM_SUBMITTED" || status === "WAITING_ANNOUNCEMENT") {
      return (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">{step.name}</h3>
            {renderStatusBadge()}
          </div>
          {step.description && (
            <p className="mb-3 text-sm text-neutral-600">{step.description}</p>
          )}
          {announcementDate && !announcementPassed && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-neutral-700">
                Pengumuman dalam:
              </p>
              <CountdownTimer targetDate={announcementDate.toISOString()} />
            </div>
          )}
        </div>
      );
    }

    if (status === "ACTIVE" && step.type === "FORM") {
      return (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-black">
            {step.name}
          </h3>
          {step.description && (
            <p className="mb-4 text-sm text-neutral-600">{step.description}</p>
          )}
          {step.form_id && applicantId && userId && (
            <StepFormSection
              stepId={step.id}
              formId={step.form_id}
              applicantId={applicantId}
              userId={userId}
            />
          )}
        </div>
      );
    }

    if (status === "ACTIVE" && step.type === "ANNOUNCEMENT") {
      return (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-black">
            {step.name}
          </h3>
          {step.description && (
            <p className="mb-4 text-sm text-neutral-600">{step.description}</p>
          )}
          {announcementDate && !announcementPassed && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-neutral-700">
                Pengumuman dalam:
              </p>
              <CountdownTimer targetDate={announcementDate.toISOString()} />
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div
        className={cn(
          "rounded-xl border p-6 transition-all",
          status === "LOCKED"
            ? "border-neutral-200 bg-neutral-50"
            : status === "PASSED"
              ? "border-green-200 bg-green-50/50"
              : status === "FAILED"
                ? "border-red-200 bg-red-50/50"
                : "border-primary-200 bg-white shadow-sm"
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
              status === "LOCKED"
                ? "bg-neutral-300 text-neutral-600"
                : status === "PASSED"
                  ? "bg-green-500 text-white"
                  : status === "FAILED"
                    ? "bg-red-500 text-white"
                    : "bg-primary-500 text-white"
            )}
          >
            {stepNumber}
          </span>
        </div>
        {renderContent()}
      </div>
      {step.success_message && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={step.success_message}
          links={step.success_links}
        />
      )}
    </>
  );
}
