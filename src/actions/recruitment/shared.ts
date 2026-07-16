import prisma from "@/lib/prisma";
import { canManageRecruitment } from "@/utils/permissions";

export function parseDateWIB(d?: string): Date | null {
  if (!d) return null;
  if (d.includes("Z") || /[+-]\d{2}:\d{2}$/.test(d)) {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  const normalized = d.length === 16 ? `${d}:00+07:00` : `${d}+07:00`;
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? null : parsed;
}

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
