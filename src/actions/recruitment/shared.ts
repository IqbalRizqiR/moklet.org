import prisma from "@/lib/prisma";
import { canManageRecruitment } from "@/utils/permissions";

export { syncCampaignActiveStates } from "@/utils/database/recruitment.query";
export { parseDateWIB, requireDateWIB, validateStepDates } from "./dateUtils";

export async function requireRecruitmentAccess(
  userId: string,
  orgTypeString: string,
) {
  const { hasAccess } = await canManageRecruitment(userId, orgTypeString);
  if (!hasAccess) throw new Error("Tidak punya akses.");
}

export async function requireRecruitmentAccessByOrgId(
  userId: string,
  organisasiId: string,
) {
  const orgData = await prisma.organisasi.findUnique({
    where: { id: organisasiId },
  });
  if (!orgData) throw new Error("Organisasi tidak ditemukan.");
  await requireRecruitmentAccess(userId, orgData.organisasi);
}
