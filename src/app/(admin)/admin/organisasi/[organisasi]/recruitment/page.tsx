import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageRecruitment } from "@/utils/permissions";
import Link from "next/link";
import { H2 } from "@/app/_components/global/Text";
import { getOrCreateNextPeriodOrganisasi } from "@/actions/recruitment";

type PageProps = {
  params: Promise<{ organisasi: string }>;
};

export default async function AdminRecruitmentPage({ params }: PageProps) {
  const { organisasi: orgTypeString } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const { hasAccess } = await canManageRecruitment(session.user.id, orgTypeString);
  if (!hasAccess) redirect("/admin/organisasi");

  const { organisasi, period: nextPeriod } = await getOrCreateNextPeriodOrganisasi(orgTypeString);

  const organisasiWithCampaigns = await prisma.organisasi.findUnique({
    where: { id: organisasi.id },
    include: {
      recruitment_campaigns: {
        include: { _count: { select: { applicants: true } } }
      }
    }
  });

  if (!organisasiWithCampaigns) return <div>Organisasi tidak ditemukan</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <H2>Recruitment Campaigns</H2>
          <p className="text-gray-500">Kelola open recruitment untuk {orgTypeString.toUpperCase()} (Masa Bakti {nextPeriod.period})</p>
        </div>
        <Link
          href={`/admin/organisasi/${orgTypeString}/recruitment/new`}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition"
        >
          + Buat Campaign
        </Link>
      </div>

      {organisasiWithCampaigns.recruitment_campaigns.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border text-center text-gray-500">
          Belum ada campaign recruitment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organisasiWithCampaigns.recruitment_campaigns.map((c: any) => (
            <Link key={c.id} href={`/admin/organisasi/${orgTypeString}/recruitment/${c.id}`}>
              <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {c.is_active ? 'Aktif' : 'Draft'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Total Pendaftar: <span className="font-bold text-black">{c._count.applicants}</span></p>
                  {c.open_date && <p>Buka: {new Date(c.open_date).toLocaleDateString('id-ID')}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
