import { Metadata } from "next";
import Link from "next/link";
import { redirect, RedirectType, notFound } from "next/navigation";

import { H2, P } from "@/app/_components/global/Text";
import { auth } from "@/lib/auth";
import {
  stringifyCompleteDate,
  transformToArrayCheckbox,
} from "@/utils/atomics";
import { findForm } from "@/utils/database/form.query";
import { findSubmissionWithForm } from "@/utils/database/submission.query";
import prisma from "@/lib/prisma";
import ApplicantProgressBanner from "./_components/ApplicantProgressBanner";

import ForbiddenForm from "../../_components/ForbiddenForm";
import Form from "../../_components/Form";

type Props = {
  params: Promise<{ id: string; id_submission: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const form = await findForm({ id });

  return {
    title: form?.title ?? "Not Found",
    description: form?.description,
  };
}

const page = async ({ params }: Props) => {
  const { id, id_submission } = await params;
  const session = await auth();
  if (!session)
    return redirect(
      `/api/auth/signin?callbackUrl=/form/${id}/${id_submission}`,
      RedirectType.replace,
    );

  const submission = await findSubmissionWithForm({
    user_id: session.user?.id,
    form_id: id,
    id: id_submission,
  });

  if (!submission) return notFound();

  const form = submission?.form;

  if (!form.is_open) return <ForbiddenForm />;
  if (
    (form.open_at && new Date(form.open_at).getTime() > new Date().getTime()) ||
    (form.close_at && new Date(form.close_at).getTime() < new Date().getTime())
  )
    return <ForbiddenForm />;

  if (!form.allow_edit)
    return <ForbiddenForm message="Anda sudah menjawab formulir ini." />;

  // Fetch applicant status if this is a recruitment form
  const applicant = await prisma.recruitment_Applicant.findFirst({
    where: { submission_id: id_submission },
    include: {
      campaign: {
        include: { steps: { orderBy: { order: 'asc' } } }
      },
      step_statuses: true
    }
  });

  let bannerStatus: "WAITING_ANNOUNCEMENT" | "REJECTED_STEP" | "REJECTED_FINAL" | "ACCEPTED_FINAL" | "PENDING_FINAL" | undefined;
  let bannerStepName: string | undefined;
  let bannerDate: Date | undefined;
  let bannerPassedStepName: string | undefined;

  if (applicant) {
    const now = new Date();
    // 1. Check past announced steps for rejections
    const pastSteps = applicant.campaign.steps.filter((s: any) => s.announcement_date && new Date(s.announcement_date) <= now);
    let rejectedInPastStep = false;

    for (const step of pastSteps) {
      const status = applicant.step_statuses.find((s: any) => s.step_id === step.id)?.status || "PENDING";
      if (status === "FAILED") {
        bannerStatus = "REJECTED_STEP";
        bannerStepName = step.name;
        rejectedInPastStep = true;
        break;
      }
    }

    if (!rejectedInPastStep) {
      // Find if they passed any previous steps to congratulate them
      const lastPassedStep = [...pastSteps].reverse().find(step => {
        const status = applicant.step_statuses.find((s: any) => s.step_id === step.id)?.status || "PENDING";
        return status === "PASSED";
      });
      if (lastPassedStep) bannerPassedStepName = lastPassedStep.name;

      // 2. Look for the next unannounced step
      const futureStep = applicant.campaign.steps.find((s: any) => s.announcement_date && new Date(s.announcement_date) > now);
      
      if (futureStep) {
        bannerStatus = "WAITING_ANNOUNCEMENT";
        bannerStepName = futureStep.name;
        bannerDate = futureStep.announcement_date as Date;
      } else {
        // 3. No future steps, and they passed all past steps (or there are no steps).
        // Let's check their global final status
        if (applicant.status === "ACCEPTED") bannerStatus = "ACCEPTED_FINAL";
        else if (applicant.status === "REJECTED") bannerStatus = "REJECTED_FINAL";
        else bannerStatus = "PENDING_FINAL";
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      {bannerStatus && (
        <ApplicantProgressBanner 
          status={bannerStatus} 
          stepName={bannerStepName} 
          announcementDate={bannerDate} 
          passedStepName={bannerPassedStepName}
        />
      )}
      <div className="items-start justify-between mx-auto max-w-[90vw] w-[640px] bg-white rounded-md">
      <div className="w-full p-6 border-b border-black box-border">
        <H2>{form.title}</H2>
        <P>{form.description}</P>
        <P className="mt-4 font-medium">{session.user?.name}</P>{" "}
        <Link
          className="hover:cursor-pointer text-info-500 hover:text-info-700 transition-all"
          href={"/api/auth/signout?callbackUrl=/form/" + id}
        >
          Ganti akun
        </Link>
        <P className="text-red-500 text-sm mt-4">
          * Menunjukkan pertanyaan yang wajib diisi
        </P>
        <P className="text-sm mt-2">
          Saat ini Anda sedang mengedit jawaban yang sudah dikirim pada{" "}
          <strong>
            {stringifyCompleteDate(submission.updated_at).replace(
              /at/,
              "pukul",
            )}
          </strong>
          .
        </P>
      </div>
      <Form
        form={form}
        formId={id}
        answers={transformToArrayCheckbox(submission.fields)}
        submission_id={id_submission}
      />
      </div>
    </div>
  );
};

export default page;
