"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { canManageRecruitment } from "@/utils/permissions";
import { ApplicantStatus, StepStatus, Organisasi_Type, Prisma } from "@prisma/client";
import generateRandomSlug from "@/utils/randomSlug";
import { FieldsWithOptions } from "@/types/entityRelations";
import { findLatestPeriod, findPeriod, createPeriod } from "@/utils/database/periodYear.query";
import { findOrganisasi, createOrganisasi } from "@/utils/database/organisasi.query";

function parseDateWIB(d?: string): Date | null {
  if (!d) return null;
  // If the string already carries a timezone (Z or ±HH:MM after T), trust it.
  if (d.includes("Z") || /[+-]\d{2}:\d{2}$/.test(d)) {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  // Naive datetime-local value (no TZ). Appending ":00+07:00" works for both
  // "YYYY-MM-DDTHH:mm" (16 chars) and "YYYY-MM-DDTHH:mm:ss" (19 chars).
  const normalized = d.length === 16 ? `${d}:00+07:00` : `${d}+07:00`;
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? null : parsed;
}

async function requireRecruitmentAccess(userId: string, orgTypeString: string) {
  const { hasAccess } = await canManageRecruitment(userId, orgTypeString);
  if (!hasAccess) throw new Error("Tidak punya akses.");
}

async function requireRecruitmentAccessByOrgId(userId: string, organisasiId: string) {
  const orgData = await prisma.organisasi.findUnique({ where: { id: organisasiId } });
  if (!orgData) throw new Error("Organisasi tidak ditemukan.");
  await requireRecruitmentAccess(userId, orgData.organisasi);
}

export async function getOrCreateNextPeriodOrganisasi(organisasiStr: string) {
  const organisasiType = organisasiStr.toUpperCase() as Organisasi_Type;

  const latestActivePeriod = await findLatestPeriod(true);
  if (!latestActivePeriod) throw new Error("Tidak ada periode aktif saat ini.");

  const [startYear, endYear] = latestActivePeriod.period.split("-").map(Number);
  const nextPeriodString = `${startYear + 1}-${endYear + 1}`;

  let nextPeriod = await findPeriod({ period: nextPeriodString });
  if (!nextPeriod) {
    nextPeriod = await createPeriod({
      period: nextPeriodString,
      is_active: false,
    });
  }

  let nextOrganisasi = await findOrganisasi({
    organisasi_period_id: {
      period_id: nextPeriod.id,
      organisasi: organisasiType,
    }
  });

  if (!nextOrganisasi) {
    nextOrganisasi = await createOrganisasi({
      organisasi: organisasiType,
      period: { connect: { id: nextPeriod.id } },
      organisasi_name: "",
      description: "",
      vision: "",
      mission: "",
      companion: "",
      structure: "",
      contact: "",
      image_description: "",
      is_suborgan: false,
      logo: "https://res.cloudinary.com/mokletorg/image/upload/v1720188074/assets/image_placeholder.png",
      image: "https://res.cloudinary.com/mokletorg/image/upload/v1720188074/assets/image_placeholder.png",
    });
  }

  return { organisasi: nextOrganisasi, period: nextPeriod };
}

export async function createCampaign(data: {
  organisasi_id: string;
  form_id: string;
  title: string;
  description?: string;
  open_date?: string;
  close_date?: string;
  default_role_id?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requireRecruitmentAccessByOrgId(session.user.id, data.organisasi_id);

  const campaign = await prisma.recruitment_Campaign.create({
    data: {
      ...data,
      open_date: parseDateWIB(data.open_date),
      close_date: parseDateWIB(data.close_date),
      is_active: false,
    }
  });

  revalidatePath(`/admin/organisasi/${data.organisasi_id}/recruitment`);
  return campaign;
}

export async function createCampaignWithForm(data: {
  organisasi_string: string;
  title: string;
  description?: string;
  open_date?: string;
  close_date?: string;
  default_role_id?: string;
  questions: FieldsWithOptions[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requireRecruitmentAccess(session.user.id, data.organisasi_string);

  const { organisasi } = await getOrCreateNextPeriodOrganisasi(data.organisasi_string);
  const organisasi_id = organisasi.id;

  const formId = generateRandomSlug();
  const createdForm = await prisma.form.create({
    data: {
      id: formId,
      user_id: session.user.id,
      title: `Form: ${data.title}`,
      description: data.description || "",
      is_open: true,
      allow_edit: false,
      submit_once: true,
      open_at: parseDateWIB(data.open_date),
      close_at: parseDateWIB(data.close_date),
    }
  });

  await Promise.all(
    data.questions.map(async (field, index) => {
      const fieldOptions = field.options.map((option) => {
        return { value: option.value };
      });

      const newField = {
        label: field.label,
        type: field.type,
        required: field.required,
        fieldNumber: index + 1,
        form_id: createdForm.id,
        accept_types: field.type === "file" ? (field.accept_types ?? "image/*,application/pdf,.doc,.docx") : null,
      };

      await prisma.field.create({
        data: {
          ...newField,
          options: { createMany: { data: fieldOptions } },
        },
      });
    }),
  );

  const campaign = await prisma.recruitment_Campaign.create({
    data: {
      organisasi_id: organisasi_id,
      form_id: formId,
      title: data.title,
      description: data.description,
      open_date: parseDateWIB(data.open_date),
      close_date: parseDateWIB(data.close_date),
      default_role_id: data.default_role_id,
      is_active: false,
    }
  });

  revalidatePath(`/admin/organisasi/${data.organisasi_string}/recruitment`);
  return campaign;
}

export async function toggleCampaign(campaignId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    include: { organisasi: true }
  });
  if (!campaign) throw new Error("Campaign tidak ditemukan.");

  await requireRecruitmentAccess(session.user.id, campaign.organisasi.organisasi);

  await prisma.recruitment_Campaign.update({
    where: { id: campaignId },
    data: { is_active: isActive }
  });

  revalidatePath(`/admin/organisasi/${campaign.organisasi.organisasi.toLowerCase()}/recruitment`);
}

export async function editCampaignDates(campaignId: string, openDate?: string, closeDate?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    include: { organisasi: true }
  });
  if (!campaign) throw new Error("Campaign tidak ditemukan.");

  await requireRecruitmentAccess(session.user.id, campaign.organisasi.organisasi);

  await prisma.recruitment_Campaign.update({
    where: { id: campaignId },
    data: {
      open_date: parseDateWIB(openDate),
      close_date: parseDateWIB(closeDate),
    }
  });

  revalidatePath(`/admin/organisasi/${campaign.organisasi.organisasi.toLowerCase()}/recruitment`);
}

export async function editCampaignDetails(campaignId: string, title: string, description?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    include: { organisasi: true }
  });
  if (!campaign) throw new Error("Campaign tidak ditemukan.");

  await requireRecruitmentAccess(session.user.id, campaign.organisasi.organisasi);

  await prisma.recruitment_Campaign.update({
    where: { id: campaignId },
    data: { title, description: description || null }
  });

  revalidatePath(`/admin/organisasi/${campaign.organisasi.organisasi.toLowerCase()}/recruitment`);
}

export async function addStep(
  campaignId: string,
  name: string,
  announcementDate?: string,
  options?: {
    type?: "ANNOUNCEMENT" | "FORM";
    description?: string;
    closeDate?: string;
    questions?: FieldsWithOptions[];
  },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    include: { organisasi: true }
  });
  if (!campaign) throw new Error("Campaign tidak ditemukan.");

  await requireRecruitmentAccess(session.user.id, campaign.organisasi.organisasi);

  const existingSteps = await prisma.recruitment_Step.count({ where: { campaign_id: campaignId } });

  const type = options?.type ?? "ANNOUNCEMENT";
  let formId: string | null = null;

  // For FORM-type steps, create an inline form with the provided questions
  if (type === "FORM" && options?.questions && options.questions.length > 0) {
    formId = generateRandomSlug();
    const stepForm = await prisma.form.create({
      data: {
        id: formId,
        user_id: session.user.id,
        title: `Form Tahap: ${name}`,
        description: options.description || "",
        is_open: true,
        allow_edit: false,
        submit_once: true,
        close_at: parseDateWIB(options.closeDate),
      }
    });

    await Promise.all(
      options.questions.map(async (field, index) => {
        const fieldOptions = field.options.map((option) => ({ value: option.value }));
        await prisma.field.create({
          data: {
            label: field.label,
            type: field.type,
            required: field.required,
            fieldNumber: index + 1,
            form_id: stepForm.id,
            accept_types: field.type === "file" ? (field.accept_types ?? "image/*,application/pdf,.doc,.docx") : null,
            options: { createMany: { data: fieldOptions } },
          },
        });
      }),
    );
  }

  // Guard: a FORM-type step without questions would leave applicants stuck forever
  if (type === "FORM" && (!options?.questions || options.questions.length === 0))
    throw new Error("Tahapan tipe Formulir harus memiliki minimal 1 pertanyaan.");

  const step = await prisma.recruitment_Step.create({
    data: {
      campaign_id: campaignId,
      name,
      description: options?.description || null,
      type,
      order: existingSteps + 1,
      announcement_date: parseDateWIB(announcementDate),
      close_date: parseDateWIB(options?.closeDate),
      form_id: formId,
    }
  });

  revalidatePath(`/admin/organisasi/${campaign.organisasi.organisasi.toLowerCase()}/recruitment`);
  return step;
}

export async function submitStepForm(applicantId: string, stepId: string, submissionId: string) {
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
  if (applicant.user_id !== session.user.id) throw new Error("Tidak punya akses.");

  // Find the step within this campaign
  const step = applicant.campaign.steps.find((s: { id: string }) => s.id === stepId);
  if (!step) throw new Error("Tahapan tidak ditemukan di campaign ini.");

  // Only FORM-type steps accept submissions
  if (step.type !== "FORM") throw new Error("Tahapan ini tidak menerima formulir.");

  if (!step.form_id) throw new Error("Tahapan formulir belum memiliki form.");
  const now = new Date();
  if (step.close_date && step.close_date < now)
    throw new Error("Batas waktu pengisian formulir sudah lewat.");

  // Verify the applicant passed the previous step (if any)
  const stepIndex = applicant.campaign.steps.indexOf(step);
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

  // Verify submission ownership and form match
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
      }
    },
    create: {
      applicant_id: applicantId,
      step_id: stepId,
      status: "PENDING",
      submission_id: submissionId,
    },
    update: {
      submission_id: submissionId,
    }
  });

  revalidatePath(`/recruitment/${applicant.campaign_id}`);
}

export async function editStep(stepId: string, name: string, announcementDate?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const step = await prisma.recruitment_Step.findUnique({
    where: { id: stepId },
    include: { campaign: { include: { organisasi: true } } }
  });
  if (!step) throw new Error("Step tidak ditemukan.");

  await requireRecruitmentAccess(session.user.id, step.campaign.organisasi.organisasi);

  await prisma.recruitment_Step.update({
    where: { id: stepId },
    data: {
      name,
      announcement_date: parseDateWIB(announcementDate),
    }
  });

  revalidatePath(`/admin/organisasi/${step.campaign.organisasi.organisasi.toLowerCase()}/recruitment`);
}

export async function deleteStep(stepId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const step = await prisma.recruitment_Step.findUnique({
    where: { id: stepId },
    include: { campaign: { include: { organisasi: true } } }
  });
  if (!step) throw new Error("Step tidak ditemukan.");

  await requireRecruitmentAccess(session.user.id, step.campaign.organisasi.organisasi);

  const campaignId = step.campaign_id;

  // Delete + reorder in a single transaction to prevent race conditions with
  // concurrent addStep/deleteStep calls that would produce duplicate orders.
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.recruitment_Step.delete({ where: { id: stepId } });

    const remaining = await tx.recruitment_Step.findMany({
      where: { campaign_id: campaignId },
      orderBy: { order: "asc" },
    });
    await Promise.all(
      remaining.map((s, i) =>
        tx.recruitment_Step.update({
          where: { id: s.id },
          data: { order: i + 1 },
        }),
      ),
    );
  });

  revalidatePath(`/admin/organisasi/${step.campaign.organisasi.organisasi.toLowerCase()}/recruitment`);
}

export async function editStepTime(stepId: string, announcementDate?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const step = await prisma.recruitment_Step.findUnique({
    where: { id: stepId },
    include: { campaign: { include: { organisasi: true } } }
  });
  if (!step) throw new Error("Step tidak ditemukan.");

  await requireRecruitmentAccess(session.user.id, step.campaign.organisasi.organisasi);

  await prisma.recruitment_Step.update({
    where: { id: stepId },
    data: { announcement_date: parseDateWIB(announcementDate) }
  });

  revalidatePath(`/admin/organisasi/${step.campaign.organisasi.organisasi.toLowerCase()}/recruitment`);
}

export async function registerApplicant(campaignId: string, submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Load campaign to validate state: must be active AND within open/close window
  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, is_active: true, open_date: true, close_date: true, form_id: true },
  });
  if (!campaign) throw new Error("Campaign tidak ditemukan.");
  if (!campaign.is_active) throw new Error("Campaign tidak aktif.");
  const now = new Date();
  if (campaign.open_date && campaign.open_date > now)
    throw new Error("Campaign belum dibuka.");
  if (campaign.close_date && campaign.close_date < now)
    throw new Error("Pendaftaran sudah ditutup.");

  // Verify the submission exists, belongs to the caller, and matches the campaign's form
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, user_id: true, form_id: true },
  });
  if (!submission) throw new Error("Submission tidak ditemukan.");
  if (submission.user_id !== session.user.id)
    throw new Error("Submission bukan milik Anda.");
  if (submission.form_id !== campaign.form_id)
    throw new Error("Submission tidak sesuai dengan campaign ini.");

  try {
    const applicant = await prisma.recruitment_Applicant.create({
      data: {
        campaign_id: campaignId,
        user_id: session.user.id,
        submission_id: submissionId,
      }
    });
    return applicant;
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new Error("Anda sudah mendaftar pada campaign ini.");
    }
    throw err;
  }
}

export async function finalizeApplicant(applicantId: string, status: ApplicantStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const applicant = await prisma.recruitment_Applicant.findUnique({
    where: { id: applicantId },
    include: {
      campaign: {
        include: { organisasi: true }
      },
      user: {
        include: { memberships: true }
      }
    }
  });

  if (!applicant) throw new Error("Applicant tidak ditemukan.");

  await requireRecruitmentAccess(session.user.id, applicant.campaign.organisasi.organisasi);

  // Everything below runs inside a transaction so concurrent finalizations of
  // the same user across orgs cannot leave inconsistent is_main state.
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
        // Only clear is_main when this user becomes the main member, and only
        // if they already had at least one membership.
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
        },
        update: {
          role_id: applicant.campaign.default_role_id,
          is_main: isMain,
        },
      });
    } else if (status === "REJECTED" || status === "PENDING") {
      // Only delete the membership if it has the default_role_id (i.e. it was
      // created by THIS campaign's ACCEPT flow). A manually-preset membership
      // for the same org should not be silently removed when reviewing.
      await tx.org_Member.deleteMany({
        where: {
          user_id: applicant.user_id,
          organisasi_id: applicant.campaign.organisasi_id,
          role_id: applicant.campaign.default_role_id,
        },
      });
    }
  });

  revalidatePath(`/admin/organisasi/${applicant.campaign.organisasi.organisasi.toLowerCase()}/recruitment`);
}

export async function passApplicantStep(applicantId: string, stepId: string, status: StepStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const applicant = await prisma.recruitment_Applicant.findUnique({
    where: { id: applicantId },
    include: { campaign: { include: { organisasi: true } } }
  });
  if (!applicant) throw new Error("Applicant tidak ditemukan.");

  await requireRecruitmentAccess(session.user.id, applicant.campaign.organisasi.organisasi);

  await prisma.applicant_Step_Status.upsert({
    where: {
      applicant_id_step_id: {
        applicant_id: applicantId,
        step_id: stepId,
      }
    },
    create: {
      applicant_id: applicantId,
      step_id: stepId,
      status,
    },
    update: {
      status,
    }
  });

  revalidatePath(`/admin/organisasi/${applicant.campaign.organisasi.organisasi.toLowerCase()}/recruitment`);
}
