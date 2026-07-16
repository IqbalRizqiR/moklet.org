"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Organisasi_Type } from "@prisma/client";
import {
  findLatestPeriod,
  findPeriod,
  createPeriod,
} from "@/utils/database/periodYear.query";
import {
  findOrganisasi,
  createOrganisasi,
} from "@/utils/database/organisasi.query";
import { parseDateWIB, requireRecruitmentAccess } from "./shared";

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
    }) as unknown as typeof nextPeriod;
  }
  if (!nextPeriod) throw new Error("Gagal membuat periode.");

  let nextOrganisasi = await findOrganisasi({
    organisasi_period_id: {
      period_id: nextPeriod.id,
      organisasi: organisasiType,
    },
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
      image:
        "https://res.cloudinary.com/mokletorg/image/upload/v1720188074/assets/image_placeholder.png",
    });
  }

  return { organisasi: nextOrganisasi, period: nextPeriod };
}

export async function createCampaign(data: {
  organisasi_string: string;
  title: string;
  description?: string;
  open_date?: string;
  close_date?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requireRecruitmentAccess(session.user.id, data.organisasi_string);

  const { organisasi } = await getOrCreateNextPeriodOrganisasi(
    data.organisasi_string,
  );

  const campaign = await prisma.recruitment_Campaign.create({
    data: {
      organisasi_id: organisasi.id,
      title: data.title,
      description: data.description || null,
      open_date: parseDateWIB(data.open_date),
      close_date: parseDateWIB(data.close_date),
      is_active: false,
    },
  });

  revalidatePath(`/admin/organisasi/${data.organisasi_string}/recruitment`);
  return campaign;
}

export async function toggleCampaign(
  campaignId: string,
  isActive: boolean,
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

  await prisma.recruitment_Campaign.update({
    where: { id: campaignId },
    data: { is_active: isActive },
  });

  revalidatePath(
    `/admin/organisasi/${campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
}

export async function updateCampaign(
  campaignId: string,
  data: {
    title?: string;
    description?: string | null;
    open_date?: string;
    close_date?: string;
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

  await prisma.recruitment_Campaign.update({
    where: { id: campaignId },
    data: {
      title: data.title ?? undefined,
      description: data.description !== undefined ? (data.description || null) : undefined,
      open_date: data.open_date !== undefined ? parseDateWIB(data.open_date) : undefined,
      close_date: data.close_date !== undefined ? parseDateWIB(data.close_date) : undefined,
    },
  });

  revalidatePath(
    `/admin/organisasi/${campaign.organisasi.organisasi.toLowerCase()}/recruitment`,
  );
}
