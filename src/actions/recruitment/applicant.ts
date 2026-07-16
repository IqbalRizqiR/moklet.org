"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ApplicantStatus, StepStatus, Prisma } from "@prisma/client";
import { requireRecruitmentAccess } from "./shared";

export async function registerApplicant(campaignId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      is_active: true,
      open_date: true,
      close_date: true,
    },
  });
  if (!campaign) throw new Error("Campaign tidak ditemukan.");
  if (!campaign.is_active) throw new Error("Campaign tidak aktif.");
  const now = new Date();
  if (campaign.open_date && campaign.open_date > now)
    throw new Error("Campaign belum dibuka.");
  if (campaign.close_date && campaign.close_date < now)
    throw new Error("Pendaftaran sudah ditutup.");

  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!userExists) throw new Error("Akun Anda tidak ditemukan.");

  try {
    const applicant = await prisma.recruitment_Applicant.create({
      data: {
        campaign_id: campaignId,
        user_id: session.user.id,
      },
    });
    return { applicant };
  } catch (err: unknown) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new Error("Anda sudah mendaftar pada campaign ini.");
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      throw new Error("Terjadi kesalahan referensi data. Silakan coba lagi.");
    }
    throw err;
  }
}

export async function submitStepForm(
  applicantId: string,
  stepId: string,
  submissionId: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const applicant = await prisma.recruitment_Applicant.findUnique({
    where: { id: applicantId },
    include: {
      campaign: {
        include: {
          steps: { orderBy: { order: "asc" } },
        },
      },
    },
  });
  if (!applicant) throw new Error("Pendaftar tidak ditemukan.");
  if (applicant.user_id !== session.user.id)
    throw new Error("Tidak punya akses.");

  const step = applicant.campaign.steps.find(
    (s: { id: string }) => s.id === stepId,
  );
  if (!step) throw new Error("Tahapan tidak ditemukan di campaign ini.");

  if (step.type !== "FORM")
    throw new Error("Tahapan ini tidak menerima formulir.");

  if (!step.form_id)
    throw new Error("Tahapan formulir belum memiliki form.");
  const now = new Date();
  if (step.close_date && step.close_date < now)
    throw new Error("Batas waktu pengisian formulir sudah lewat.");

  const stepIndex = applicant.campaign.steps.findIndex(
    (s: { id: string }) => s.id === step.id,
  );
  if (stepIndex > 0) {
    const prevStepId = applicant.campaign.steps[stepIndex - 1].id;
    const prevStatus = await prisma.applicant_Step_Status.findUnique({
      where: {
        applicant_id_step_id: {
          applicant_id: applicantId,
          step_id: prevStepId,
        },
      },
      select: { status: true },
    });
    if (!prevStatus || prevStatus.status !== "PASSED")
      throw new Error("Anda belum lulus tahapan sebelumnya.");
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, user_id: true, form_id: true },
  });
  if (!submission) throw new Error("Submission tidak ditemukan.");
  if (submission.user_id !== session.user.id)
    throw new Error("Submission bukan milik Anda.");
  if (submission.form_id !== step.form_id)
    throw new Error("Submission tidak sesuai dengan formulir tahapan ini.");

  await prisma.applicant_Step_Status.upsert({
    where: {
      applicant_id_step_id: {
        applicant_id: applicantId,
        step_id: stepId,
      },
    },
    create: {
      applicant_id: applicantId,
      step_id: stepId,
      status: "PENDING",
      submission_id: submissionId,
    },
    update: {
      submission_id: submissionId,
    },
  });

  revalidatePath(`/recruitment/${applicant.campaign_id}`);
}

export async function passApplicantStep(
  applicantId: string,
  stepId: string,
  status: StepStatus,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const applicant = await prisma.recruitment_Applicant.findUnique({
    where: { id: applicantId },
    include: { campaign: { include: { organisasi: true } } },
  });
  if (!applicant) throw new Error("Applicant tidak ditemukan.");

  await requireRecruitmentAccess(
    session.user.id,
    applicant.campaign.organisasi.organisasi,
  );

  await prisma.applicant_Step_Status.upsert({
    where: {
      applicant_id_step_id: {
        applicant_id: applicantId,
        step_id: stepId,
      },
    },
    create: {
      applicant_id: applicantId,
      step_id: stepId,
      status,
    },
    update: {
      status,
    },
  });

  revalidatePath(
    `/admin/organisasi/${applicant.campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
}

export async function finalizeApplicant(
  applicantId: string,
  status: ApplicantStatus,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const applicant = await prisma.recruitment_Applicant.findUnique({
    where: { id: applicantId },
    include: {
      campaign: {
        include: {
          organisasi: true,
          steps: { orderBy: { order: "asc" } },
        },
      },
      user: {
        include: { memberships: true },
      },
      step_statuses: true,
    },
  });

  if (!applicant) throw new Error("Applicant tidak ditemukan.");

  await requireRecruitmentAccess(
    session.user.id,
    applicant.campaign.organisasi.organisasi,
  );

  if (status === "ACCEPTED" && applicant.campaign.steps.length > 0) {
    const allStepsPassed = applicant.campaign.steps.every(
      (step: { id: string }) => {
        const stepStatus = applicant.step_statuses.find(
          (ss: { step_id: string }) => ss.step_id === step.id,
        );
        return stepStatus?.status === "PASSED";
      },
    );
    if (!allStepsPassed) {
      throw new Error(
        "Tidak bisa menerima pendaftar yang belum lulus semua tahapan.",
      );
    }
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.recruitment_Applicant.update({
      where: { id: applicantId },
      data: { status },
    });

    if (status === "ACCEPTED" && applicant.campaign.default_role_id) {
      const isOsisOrMpk =
        applicant.campaign.organisasi.organisasi === "OSIS" ||
        applicant.campaign.organisasi.organisasi === "MPK";
      const existingCount = await tx.org_Member.count({
        where: { user_id: applicant.user_id },
      });

      let isMain = false;
      if (isOsisOrMpk || existingCount === 0) {
        isMain = true;
        if (existingCount > 0) {
          await tx.org_Member.updateMany({
            where: { user_id: applicant.user_id },
            data: { is_main: false },
          });
        }
      }

      await tx.org_Member.upsert({
        where: {
          user_id_organisasi_id: {
            user_id: applicant.user_id,
            organisasi_id: applicant.campaign.organisasi_id,
          },
        },
        create: {
          user_id: applicant.user_id,
          organisasi_id: applicant.campaign.organisasi_id,
          role_id: applicant.campaign.default_role_id,
          is_main: isMain,
          recruitment_campaign_id: applicant.campaign_id,
        },
        update: {
          role_id: applicant.campaign.default_role_id,
          is_main: isMain,
          recruitment_campaign_id: applicant.campaign_id,
        },
      });
    } else if (status === "REJECTED" || status === "PENDING") {
      await tx.org_Member.deleteMany({
        where: {
          user_id: applicant.user_id,
          organisasi_id: applicant.campaign.organisasi_id,
          recruitment_campaign_id: applicant.campaign_id,
        },
      });
    }
  });

  revalidatePath(
    `/admin/organisasi/${applicant.campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
}
