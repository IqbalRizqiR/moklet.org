import { Organisasi_Type } from "@prisma/client";
import prisma from "@/lib/prisma";

/**
 * Returns recruitment campaigns the given user can manage.
 * - SuperAdmin / Admin: all campaigns across all orgs.
 * - Others: campaigns whose (next-period) org corresponds to an org where the
 *   user is a leader in the CURRENT period, or has the `manage_recruitment`
 *   permission. Matching is done by Organisasi_Type so current-period leaders
 *   can manage their next-period recruitment org.
 */
export const findAccessibleCampaigns = async (
  userId: string,
  role: string,
) => {
  const include = {
    organisasi: { include: { period: true } },
    _count: { select: { applicants: true, steps: true } },
  } as const;

  if (role === "SuperAdmin" || role === "Admin") {
    return await prisma.recruitment_Campaign.findMany({
      include,
      orderBy: { open_date: "desc" },
    });
  }

  const ledMemberships = await prisma.org_Member.findMany({
    where: { user_id: userId, role: { is_leader: true } },
    select: { organisasi: { select: { organisasi: true } } },
  });

  const permittedOrgs = await prisma.org_Permission.findMany({
    where: { user_id: userId, permission: "manage_recruitment" },
    select: { organisasi: { select: { organisasi: true } } },
  });

  const orgTypes = Array.from(
    new Set([
      ...ledMemberships.map((m: { organisasi: { organisasi: string } }) => m.organisasi.organisasi),
      ...permittedOrgs.map((p: { organisasi: { organisasi: string } }) => p.organisasi.organisasi),
    ]),
  );

  if (orgTypes.length === 0) return [];

  return await prisma.recruitment_Campaign.findMany({
    where: { organisasi: { organisasi: { in: orgTypes as Organisasi_Type[] } } },
    include,
    orderBy: { open_date: "desc" },
  });
};
