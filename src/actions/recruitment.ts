"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isOrgLeader } from "@/utils/permissions";
import { ApplicantStatus, StepStatus, Organisasi_Type } from "@prisma/client";
import generateRandomSlug from "@/utils/randomSlug";
import { FieldsWithOptions } from "@/types/entityRelations";
import { findLatestPeriod, findPeriod, createPeriod } from "@/utils/database/periodYear.query";
import { findOrganisasi, createOrganisasi } from "@/utils/database/organisasi.query";

export async function getOrCreateNextPeriodOrganisasi(organisasiStr: string) {
  const organisasiType = organisasiStr.toUpperCase() as Organisasi_Type;
  
  // 1. Get current active period
  const latestActivePeriod = await findLatestPeriod(true);
  if (!latestActivePeriod) throw new Error("Tidak ada periode aktif saat ini.");

  // 2. Calculate next period (e.g. 2024-2025 -> 2025-2026)
  const [startYear, endYear] = latestActivePeriod.period.split("-").map(Number);
  const nextPeriodString = `${startYear + 1}-${endYear + 1}`;

  // 3. Find or Create Next Period
  let nextPeriod = await findPeriod({ period: nextPeriodString });
  if (!nextPeriod) {
    nextPeriod = await createPeriod({
      period: nextPeriodString,
      is_active: false,
    });
  }

  // 4. Find or Create Organisasi for the next period
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
  
  const hasAccess = await isOrgLeader(session.user.id, data.organisasi_id);
  if (!hasAccess && session.user.role !== "Admin" && session.user.role !== "SuperAdmin") {
    throw new Error("Tidak punya akses membuat campaign untuk organisasi ini.");
  }

  const campaign = await prisma.recruitment_Campaign.create({
    data: {
      ...data,
      open_date: data.open_date ? new Date(data.open_date) : null,
      close_date: data.close_date ? new Date(data.close_date) : null,
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
  
  // Get current period for Auth check
  const currentPeriod = await findLatestPeriod(true);
  let hasAccess = false;

  if (session.user.role === "SuperAdmin" || session.user.role === "Admin") {
    hasAccess = true;
  } else if (currentPeriod) {
    const currentOrg = await findOrganisasi({
      organisasi_period_id: {
        period_id: currentPeriod.id,
        organisasi: data.organisasi_string.toUpperCase() as Organisasi_Type
      }
    });
    if (currentOrg) {
      hasAccess = await isOrgLeader(session.user.id, currentOrg.id);
    }
  }

  if (!hasAccess) {
    throw new Error("Tidak punya akses membuat campaign untuk organisasi ini.");
  }

  // Auto-generate Next Period & Organization
  const { organisasi } = await getOrCreateNextPeriodOrganisasi(data.organisasi_string);
  const organisasi_id = organisasi.id;

  // Automate Form Creation
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
      open_at: data.open_date ? new Date(data.open_date) : null,
      close_at: data.close_date ? new Date(data.close_date) : null,
    }
  });

  // Create Fields and Options
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
      };

      await prisma.field.create({
        data: {
          ...newField,
          options: { createMany: { data: fieldOptions } },
        },
      });
    }),
  );

  // Create Campaign
  const campaign = await prisma.recruitment_Campaign.create({
    data: {
      organisasi_id: organisasi_id,
      form_id: formId,
      title: data.title,
      description: data.description,
      open_date: data.open_date ? new Date(data.open_date) : null,
      close_date: data.close_date ? new Date(data.close_date) : null,
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

  const currentPeriod = await findLatestPeriod(true);
  let hasAccess = false;

  if (session.user.role === "SuperAdmin" || session.user.role === "Admin") {
    hasAccess = true;
  } else if (currentPeriod) {
    const currentOrg = await findOrganisasi({
      organisasi_period_id: {
        period_id: currentPeriod.id,
        organisasi: campaign.organisasi.organisasi
      }
    });
    if (currentOrg) {
      hasAccess = await isOrgLeader(session.user.id, currentOrg.id);
    }
  }

  if (!hasAccess) {
    throw new Error("Tidak punya akses.");
  }

  await prisma.recruitment_Campaign.update({
    where: { id: campaignId },
    data: { is_active: isActive }
  });
  
  revalidatePath(`/admin/organisasi/${campaign.organisasi_id}/recruitment`);
}

export async function addStep(campaignId: string, name: string, announcementDate?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const campaign = await prisma.recruitment_Campaign.findUnique({ 
    where: { id: campaignId },
    include: { organisasi: true }
  });
  if (!campaign) throw new Error("Campaign tidak ditemukan.");
  
  const currentPeriod = await findLatestPeriod(true);
  let hasAccess = false;

  if (session.user.role === "SuperAdmin" || session.user.role === "Admin") {
    hasAccess = true;
  } else if (currentPeriod) {
    const currentOrg = await findOrganisasi({
      organisasi_period_id: {
        period_id: currentPeriod.id,
        organisasi: campaign.organisasi.organisasi
      }
    });
    if (currentOrg) {
      hasAccess = await isOrgLeader(session.user.id, currentOrg.id);
    }
  }

  if (!hasAccess) {
    throw new Error("Tidak punya akses.");
  }

  const existingSteps = await prisma.recruitment_Step.count({ where: { campaign_id: campaignId } });

  const step = await prisma.recruitment_Step.create({
    data: {
      campaign_id: campaignId,
      name,
      order: existingSteps + 1,
      announcement_date: announcementDate ? new Date(announcementDate) : null,
    }
  });
  
  revalidatePath(`/admin/organisasi/${campaign.organisasi_id}/recruitment`);
  return step;
}

export async function registerApplicant(campaignId: string, submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

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
  
  const currentPeriod = await findLatestPeriod(true);
  let hasAccess = false;

  if (session.user.role === "SuperAdmin" || session.user.role === "Admin") {
    hasAccess = true;
  } else if (currentPeriod) {
    const currentOrg = await findOrganisasi({
      organisasi_period_id: {
        period_id: currentPeriod.id,
        organisasi: applicant.campaign.organisasi.organisasi
      }
    });
    if (currentOrg) {
      hasAccess = await isOrgLeader(session.user.id, currentOrg.id);
    }
  }

  if (!hasAccess) {
    throw new Error("Tidak punya akses.");
  }

  await prisma.recruitment_Applicant.update({
    where: { id: applicantId },
    data: { status }
  });

  // Automated Assignment Logic
  if (status === "ACCEPTED" && applicant.campaign.default_role_id) {
    const isOsisOrMpk = applicant.campaign.organisasi.organisasi === "OSIS" || applicant.campaign.organisasi.organisasi === "MPK";
    const hasExistingMemberships = applicant.user.memberships.length > 0;
    
    let isMain = false;
    if (isOsisOrMpk || !hasExistingMemberships) {
      isMain = true;
      
      if (isMain && hasExistingMemberships) {
        await prisma.org_Member.updateMany({
          where: { user_id: applicant.user_id },
          data: { is_main: false }
        });
      }
    }

    await prisma.org_Member.upsert({
      where: {
        user_id_organisasi_id: {
          user_id: applicant.user_id,
          organisasi_id: applicant.campaign.organisasi_id,
        }
      },
      create: {
        user_id: applicant.user_id,
        organisasi_id: applicant.campaign.organisasi_id,
        role_id: applicant.campaign.default_role_id,
        is_main: isMain,
      },
      update: {
        role_id: applicant.campaign.default_role_id,
        ...(isMain && { is_main: true })
      }
    });
  } else if (status === "REJECTED" || status === "PENDING") {
    // If they are cancelled or rejected, remove them from the organization if they were previously added
    await prisma.org_Member.deleteMany({
      where: {
        user_id: applicant.user_id,
        organisasi_id: applicant.campaign.organisasi_id,
      }
    });
  }

  revalidatePath(`/admin/organisasi/${applicant.campaign.organisasi_id}/recruitment`);
}

export async function passApplicantStep(applicantId: string, stepId: string, status: StepStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const applicant = await prisma.recruitment_Applicant.findUnique({
    where: { id: applicantId },
    include: { campaign: true }
  });
  if (!applicant) throw new Error("Applicant tidak ditemukan.");

  const currentPeriod = await findLatestPeriod(true);
  let hasAccess = false;

  if (session.user.role === "SuperAdmin" || session.user.role === "Admin") {
    hasAccess = true;
  } else if (currentPeriod) {
    const orgData = await prisma.organisasi.findUnique({ where: { id: applicant.campaign.organisasi_id } });
    if (orgData) {
      const currentOrg = await findOrganisasi({
        organisasi_period_id: {
          period_id: currentPeriod.id,
          organisasi: orgData.organisasi
        }
      });
      if (currentOrg) {
        hasAccess = await isOrgLeader(session.user.id, currentOrg.id);
      }
    }
  }

  if (!hasAccess) {
    throw new Error("Tidak punya akses.");
  }

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

  revalidatePath(`/admin/organisasi/${applicant.campaign.organisasi_id}/recruitment`);
}
