"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import generateRandomSlug from "@/utils/randomSlug";
import { FieldsWithOptions } from "@/types/entityRelations";
import {
  parseDateWIB,
  requireDateWIB,
  requireRecruitmentAccess,
  validateStepDates,
} from "./shared";

export type SuccessLink = { label: string; url: string };

export async function addStep(
  campaignId: string,
  data: {
    name: string;
    type: "ANNOUNCEMENT" | "FORM";
    description?: string;
    open_date: string;
    announcement_date: string;
    close_date?: string;
    questions?: FieldsWithOptions[];
    pass_message?: string;
    pass_links?: SuccessLink[];
    fail_message?: string;
    fail_links?: SuccessLink[];
    sections?: { tempId: number; title: string; order: number }[];
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

  const type = data.type;
  const stepOpenDate = requireDateWIB(data.open_date, "Tanggal buka tahapan");
  const stepAnnouncementDate = requireDateWIB(data.announcement_date, "Tanggal pengumuman");
  const stepCloseDate = type === "FORM" ? parseDateWIB(data.close_date) : null;

  validateStepDates(
    campaign.open_date,
    campaign.close_date,
    stepOpenDate,
    stepAnnouncementDate,
    stepCloseDate,
    type,
  );

  if (
    type === "FORM" &&
    (!data.questions || data.questions.length === 0)
  )
    throw new Error(
      "Tahapan tipe Formulir harus memiliki minimal 1 pertanyaan.",
    );

  let formId: string | null = null;

  if (type === "FORM" && data.questions && data.questions.length > 0) {
    formId = generateRandomSlug();
    const stepForm = await prisma.form.create({
      data: {
        id: formId,
        user_id: session.user.id,
        title: `Form Tahap: ${data.name}`,
        description: data.description || "",
        is_open: true,
        allow_edit: false,
        submit_once: true,
        close_at: stepCloseDate,
      },
    });

    const sectionIdMap = new Map<number, number>();
    if (data.sections && data.sections.length > 0) {
      for (let i = 0; i < data.sections.length; i++) {
        const s = data.sections[i];
        const created = await prisma.field_Section.create({
          data: { form_id: stepForm.id, title: s.title, order: s.order },
        });
        sectionIdMap.set(s.tempId, created.id);
      }
    }

    await Promise.all(
      data.questions.map(async (field, index) => {
        const fieldOptions = field.options.map((option) => ({ value: option.value }));
        const resolvedSectionId = field.section_id != null
          ? (sectionIdMap.get(field.section_id) ?? null)
          : null;
        await prisma.field.create({
          data: {
            label: field.label,
            type: field.type,
            required: field.required,
            fieldNumber: index + 1,
            form_id: stepForm.id,
            accept_types:
              field.type === "file"
                ? (field.accept_types ?? "image/*,application/pdf,.doc,.docx")
                : null,
            section_id: resolvedSectionId,
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
      name: data.name,
      description: data.description || null,
      type,
      order: existingSteps + 1,
      open_date: stepOpenDate,
      announcement_date: stepAnnouncementDate,
      close_date: stepCloseDate,
      form_id: formId,
      pass_message: data.pass_message || null,
      pass_links: (data.pass_links || null) as unknown as Prisma.InputJsonValue,
      fail_message: data.fail_message || null,
      fail_links: (data.fail_links || null) as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath(
    `/admin/organisasi/${campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
  return step;
}

export async function editStep(
  stepId: string,
  data: {
    name: string;
    description?: string | null;
    open_date: string;
    announcement_date: string;
    close_date?: string;
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

  const stepOpenDate = requireDateWIB(data.open_date, "Tanggal buka tahapan");
  const stepAnnouncementDate = requireDateWIB(data.announcement_date, "Tanggal pengumuman");
  const stepCloseDate = step.type === "FORM" ? parseDateWIB(data.close_date) : null;

  validateStepDates(
    step.campaign.open_date,
    step.campaign.close_date,
    stepOpenDate,
    stepAnnouncementDate,
    stepCloseDate,
    step.type,
  );

  await prisma.recruitment_Step.update({
    where: { id: stepId },
    data: {
      name: data.name,
      description: data.description !== undefined ? data.description : undefined,
      open_date: stepOpenDate,
      announcement_date: stepAnnouncementDate,
      close_date: stepCloseDate,
    },
  });

  revalidatePath(
    `/admin/organisasi/${step.campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
}

export async function updateStepOutcome(
  stepId: string,
  data: {
    pass_message?: string | null;
    pass_links?: SuccessLink[] | null;
    fail_message?: string | null;
    fail_links?: SuccessLink[] | null;
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
      pass_message: data.pass_message !== undefined ? data.pass_message : undefined,
      pass_links: data.pass_links !== undefined ? data.pass_links as unknown as Prisma.InputJsonValue : undefined,
      fail_message: data.fail_message !== undefined ? data.fail_message : undefined,
      fail_links: data.fail_links !== undefined ? data.fail_links as unknown as Prisma.InputJsonValue : undefined,
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
