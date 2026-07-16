"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import generateRandomSlug from "@/utils/randomSlug";
import { FieldsWithOptions } from "@/types/entityRelations";
import { parseDateWIB, requireRecruitmentAccess } from "./shared";
import type { SuccessLink } from "./campaign";

export async function addStep(
  campaignId: string,
  name: string,
  announcementDate?: string,
  options?: {
    type?: "ANNOUNCEMENT" | "FORM";
    description?: string;
    closeDate?: string;
    questions?: FieldsWithOptions[];
    success_message?: string;
    success_links?: SuccessLink[];
  },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    include: { organisasi: true },
  });
  if (!campaign) throw new Error("Campaign tidak ditemukan.");

  await requireRecruitmentAccess(
    session.user.id,
    campaign.organisasi.organisasi,
  );

  const type = options?.type ?? "ANNOUNCEMENT";

  if (
    type === "FORM" &&
    (!options?.questions || options.questions.length === 0)
  )
    throw new Error(
      "Tahapan tipe Formulir harus memiliki minimal 1 pertanyaan.",
    );

  let formId: string | null = null;

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
      },
    });

    await Promise.all(
      options.questions.map(async (field, index) => {
        const fieldOptions = field.options.map((option) => ({
          value: option.value,
        }));
        await prisma.field.create({
          data: {
            label: field.label,
            type: field.type,
            required: field.required,
            fieldNumber: index + 1,
            form_id: stepForm.id,
            accept_types:
              field.type === "file"
                ? (field.accept_types ??
                  "image/*,application/pdf,.doc,.docx")
                : null,
            options: { createMany: { data: fieldOptions } },
          },
        });
      }),
    );
  }

  const existingSteps = await prisma.recruitment_Step.count({
    where: { campaign_id: campaignId },
  });

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
      success_message: options?.success_message || null,
      success_links: (options?.success_links || null) as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath(
    `/admin/organisasi/${campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
  return step;
}

export async function editStep(
  stepId: string,
  name: string,
  announcementDate?: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const step = await prisma.recruitment_Step.findUnique({
    where: { id: stepId },
    include: { campaign: { include: { organisasi: true } } },
  });
  if (!step) throw new Error("Step tidak ditemukan.");

  await requireRecruitmentAccess(
    session.user.id,
    step.campaign.organisasi.organisasi,
  );

  await prisma.recruitment_Step.update({
    where: { id: stepId },
    data: {
      name,
      announcement_date: parseDateWIB(announcementDate),
    },
  });

  revalidatePath(
    `/admin/organisasi/${step.campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
}

export async function updateStepConfig(
  stepId: string,
  data: {
    success_message?: string | null;
    success_links?: SuccessLink[] | null;
    description?: string | null;
  },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const step = await prisma.recruitment_Step.findUnique({
    where: { id: stepId },
    include: { campaign: { include: { organisasi: true } } },
  });
  if (!step) throw new Error("Step tidak ditemukan.");

  await requireRecruitmentAccess(
    session.user.id,
    step.campaign.organisasi.organisasi,
  );

  await prisma.recruitment_Step.update({
    where: { id: stepId },
    data: {
      success_message: data.success_message !== undefined ? data.success_message : undefined,
      success_links: data.success_links !== undefined ? data.success_links as unknown as Prisma.InputJsonValue : undefined,
      description: data.description !== undefined ? data.description : undefined,
    },
  });

  revalidatePath(
    `/admin/organisasi/${step.campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
}

export async function deleteStep(stepId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const step = await prisma.recruitment_Step.findUnique({
    where: { id: stepId },
    include: { campaign: { include: { organisasi: true } } },
  });
  if (!step) throw new Error("Step tidak ditemukan.");

  await requireRecruitmentAccess(
    session.user.id,
    step.campaign.organisasi.organisasi,
  );

  const campaignId = step.campaign_id;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.recruitment_Step.delete({ where: { id: stepId } });

    const remaining = await tx.recruitment_Step.findMany({
      where: { campaign_id: campaignId },
      orderBy: { order: "asc" },
    });
    for (let i = 0; i < remaining.length; i++) {
      await tx.recruitment_Step.update({
        where: { id: remaining[i].id },
        data: { order: i + 1 },
      });
    }
  });

  revalidatePath(
    `/admin/organisasi/${step.campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
}

export async function editStepTime(
  stepId: string,
  announcementDate?: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const step = await prisma.recruitment_Step.findUnique({
    where: { id: stepId },
    include: { campaign: { include: { organisasi: true } } },
  });
  if (!step) throw new Error("Step tidak ditemukan.");

  await requireRecruitmentAccess(
    session.user.id,
    step.campaign.organisasi.organisasi,
  );

  await prisma.recruitment_Step.update({
    where: { id: stepId },
    data: { announcement_date: parseDateWIB(announcementDate) },
  });

  revalidatePath(
    `/admin/organisasi/${step.campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
}
