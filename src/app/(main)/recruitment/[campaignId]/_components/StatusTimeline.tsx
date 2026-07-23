import React from "react";
import StepCard from "./StepCard";
import cn from "@/lib/clsx";

interface ApplicantStepStatus {
  step_id: string;
  status: "PASSED" | "FAILED";
  submission_id?: string | null;
}

interface Step {
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
}

export type StepDisplayStatus =
  | "LOCKED"
  | "BEFORE_OPEN"
  | "ACTIVE"
  | "FORM_SUBMITTED"
  | "WAITING_ANNOUNCEMENT"
  | "PASSED"
  | "FAILED";

interface StatusTimelineProps {
  steps: Step[];
  applicantStepStatuses: ApplicantStepStatus[];
  applicantId?: string;
  userId?: string;
}

export default function StatusTimeline({
  steps,
  applicantStepStatuses,
  applicantId,
  userId,
}: StatusTimelineProps) {
  const computeStatus = (
    step: Step,
    index: number,
  ): StepDisplayStatus => {
    if (index > 0) {
      const prevStep = steps[index - 1];
      const prevStatus = applicantStepStatuses.find(
        (s) => s.step_id === prevStep.id,
      );
      if (!prevStatus || prevStatus.status !== "PASSED") {
        return "LOCKED";
      }
    }

    const statusRecord = applicantStepStatuses.find(
      (s) => s.step_id === step.id,
    );

    if (statusRecord) {
      if (statusRecord.status === "PASSED") return "PASSED";
      if (statusRecord.status === "FAILED") return "FAILED";
    }

    const now = Date.now();
    const openDate = new Date(step.open_date).getTime();
    const announcementDate = new Date(step.announcement_date).getTime();

    if (now < openDate) return "BEFORE_OPEN";

    if (step.type === "FORM" && statusRecord?.submission_id) {
      if (now < announcementDate) return "FORM_SUBMITTED";
    }

    if (step.type === "ANNOUNCEMENT" && !statusRecord) {
      if (now < announcementDate) return "WAITING_ANNOUNCEMENT";
    }

    return "ACTIVE";
  };

  const getStatusColor = (status: StepDisplayStatus) => {
    switch (status) {
      case "PASSED": return "bg-green-500";
      case "FAILED": return "bg-red-500";
      case "LOCKED":
      case "BEFORE_OPEN": return "bg-neutral-300";
      default: return "bg-yellow-500";
    }
  };

  const getLineColor = (status: StepDisplayStatus) => {
    switch (status) {
      case "PASSED": return "bg-green-300";
      case "FAILED": return "bg-red-300";
      default: return "bg-neutral-300";
    }
  };

  const renderIcon = (status: StepDisplayStatus) => {
    if (status === "PASSED") {
      return (
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (status === "FAILED") {
      return (
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    if (status === "LOCKED" || status === "BEFORE_OPEN") {
      return (
        <svg className="h-5 w-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
    return (
      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const status = computeStatus(step, index);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm",
                  getStatusColor(status),
                )}
              >
                {renderIcon(status)}
              </div>
              {!isLast && (
                <div className={cn("w-1 flex-1 min-h-[80px]", getLineColor(status))} />
              )}
            </div>

            <div className={cn("flex-1", !isLast && "pb-8")}>
              <StepCard
                step={step}
                stepNumber={index + 1}
                status={status}
                applicantId={applicantId}
                userId={userId}
                hasSubmission={
                  !!applicantStepStatuses.find((s) => s.step_id === step.id)
                    ?.submission_id
                }
                submissionId={
                  applicantStepStatuses.find((s) => s.step_id === step.id)
                    ?.submission_id
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
