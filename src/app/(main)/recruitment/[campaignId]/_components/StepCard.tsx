"use client";

import React from "react";
import CountdownTimer from "@/app/_components/global/CountdownTimer";
import StepFormSection from "./StepFormSection";
import cn from "@/lib/clsx";
import type { StepDisplayStatus } from "./StatusTimeline";

interface StepCardProps {
  step: {
    id: string;
    name: string;
    description?: string | null;
    type: "ANNOUNCEMENT" | "FORM";
    open_date: Date | string;
    announcement_date: Date | string;
    close_date?: Date | string | null;
    form_id?: string | null;
    pass_message?: string | null;
    pass_links?: Array<{ label: string; url: string }> | null;
    fail_message?: string | null;
    fail_links?: Array<{ label: string; url: string }> | null;
  };
  stepNumber: number;
  status: StepDisplayStatus;
  applicantId?: string;
  userId?: string;
  hasSubmission?: boolean;
  submissionId?: string | null;
}

function OutcomeLinks({ links }: { links: Array<{ label: string; url: string }> }) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-primary-300 bg-white px-4 py-2 text-sm text-primary-500 transition-all hover:border-primary-400 hover:bg-primary-50"
        >
          {link.label}
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ))}
    </div>
  );
}

export default function StepCard({
  step,
  stepNumber,
  status,
  applicantId,
  userId,
  hasSubmission,
  submissionId,
}: StepCardProps) {
  const openDate = new Date(step.open_date);
  const announcementDate = new Date(step.announcement_date);

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
            <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-400">{step.name}</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Selesaikan tahap sebelumnya terlebih dahulu
            </p>
          </div>
        </div>
      );
    }

    if (status === "BEFORE_OPEN") {
      return (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-neutral-500">{step.name}</h3>
          {step.description && (
            <p className="mb-3 text-sm text-neutral-400">{step.description}</p>
          )}
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-neutral-500">Tahapan dibuka dalam:</p>
            <CountdownTimer targetDate={openDate.toISOString()} />
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
          {step.pass_message && (
            <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-sm text-green-700">{step.pass_message}</p>
            </div>
          )}
          {step.pass_links && step.pass_links.length > 0 && (
            <OutcomeLinks links={step.pass_links} />
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
            <p className="mb-3 text-sm text-neutral-600">{step.description}</p>
          )}
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">
              {step.fail_message || "Mohon maaf, Anda belum lolos pada tahap ini. Tetap semangat!"}
            </p>
          </div>
          {step.fail_links && step.fail_links.length > 0 && (
            <OutcomeLinks links={step.fail_links} />
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
          {announcementDate.getTime() > Date.now() && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-neutral-700">Pengumuman dalam:</p>
              <CountdownTimer targetDate={announcementDate.toISOString()} />
            </div>
          )}
        </div>
      );
    }

    if (status === "ACTIVE" && step.type === "FORM") {
      return (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-black">{step.name}</h3>
          {step.description && (
            <p className="mb-4 text-sm text-neutral-600">{step.description}</p>
          )}
          {step.form_id && applicantId && userId && (
            <StepFormSection
              stepId={step.id}
              formId={step.form_id}
              applicantId={applicantId}
              userId={userId}
              hasSubmission={hasSubmission}
              submissionId={submissionId}
            />
          )}
        </div>
      );
    }

    if (status === "ACTIVE" && step.type === "ANNOUNCEMENT") {
      return (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-black">{step.name}</h3>
          {step.description && (
            <p className="mb-4 text-sm text-neutral-600">{step.description}</p>
          )}
          {announcementDate.getTime() > Date.now() && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-neutral-700">Pengumuman dalam:</p>
              <CountdownTimer targetDate={announcementDate.toISOString()} />
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-all",
        status === "LOCKED" || status === "BEFORE_OPEN"
          ? "border-neutral-200 bg-neutral-50"
          : status === "PASSED"
            ? "border-green-200 bg-green-50/50"
            : status === "FAILED"
              ? "border-red-200 bg-red-50/50"
              : "border-primary-200 bg-white shadow-sm",
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
            status === "LOCKED" || status === "BEFORE_OPEN"
              ? "bg-neutral-300 text-neutral-600"
              : status === "PASSED"
                ? "bg-green-500 text-white"
                : status === "FAILED"
                  ? "bg-red-500 text-white"
                  : "bg-primary-500 text-white",
          )}
        >
          {stepNumber}
        </span>
      </div>
      {renderContent()}
    </div>
  );
}
