import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isOrgLeader } from "@/utils/permissions";
import Link from "next/link";
import { H2 } from "@/app/_components/global/Text";
import CampaignRealtimeListener from "@/app/_components/global/CampaignRealtimeListener";

import { findLatestPeriod } from "@/utils/database/periodYear.query";
import { findOrganisasi } from "@/utils/database/organisasi.query";
import { Organisasi_Type } from "@prisma/client";

type PageProps = {
  params: Promise<{ organisasi: string, campaignId: string }>;
};

export default async function CampaignDashboard({ params }: PageProps) {
  const { organisasi: orgTypeString, campaignId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  // Get current period for Auth check
  const currentPeriod = await findLatestPeriod(true);
  let hasAccess = false;

  if (session.user.role === "SuperAdmin" || session.user.role === "Admin") {
    hasAccess = true;
  } else if (currentPeriod) {
    const currentOrg = await findOrganisasi({
      organisasi_period_id: {
        period_id: currentPeriod.id,
        organisasi: orgTypeString.toUpperCase() as Organisasi_Type
      }
    });
    if (currentOrg) {
      hasAccess = await isOrgLeader(session.user.id, currentOrg.id);
    }
  }

  if (!hasAccess) {
    redirect("/admin/organisasi");
  }

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    include: {
      steps: { orderBy: { order: 'asc' } },
      applicants: {
        include: {
          user: true,
          step_statuses: true
        }
      }
    }
  });

  if (!campaign) return <div>Campaign tidak ditemukan</div>;

  return (
    <div className="p-6">
      <CampaignRealtimeListener campaignId={campaignId} />
      <Link href={`/admin/organisasi/${orgTypeString}/recruitment`} className="text-gray-500 hover:text-black mb-4 inline-block">&larr; Kembali</Link>
      
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 flex justify-between items-center">
        <div>
          <H2>{campaign.title}</H2>
          <p className="text-gray-500">Total Pendaftar: {campaign.applicants.length}</p>
        </div>
        <div className="flex gap-4">
          <Link href={`/admin/organisasi/${orgTypeString}/recruitment/${campaignId}/steps`} className="bg-primary-500 hover:bg-primary-600 transition-colors text-white px-4 py-2 rounded font-medium">
            Kelola Tahapan (Steps)
          </Link>
          <form action={async () => {
            "use server";
            const { toggleCampaign } = await import("@/actions/recruitment");
            await toggleCampaign(campaignId, !campaign.is_active);
          }}>
            <button type="submit" className={`px-4 py-2 rounded text-white ${campaign.is_active ? 'bg-red-500' : 'bg-green-500'}`}>
              {campaign.is_active ? 'Tutup Campaign' : 'Buka Campaign'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Nama Pendaftar</th>
              <th className="p-4">Status Akhir</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {campaign.applicants.map((app: any) => (
              <tr key={app.id} className="border-b">
                <td className="p-4 font-medium">{app.user.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : app.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/admin/organisasi/${orgTypeString}/recruitment/${campaignId}/applicant/${app.id}`} className="text-primary-500 hover:underline font-medium">
                    Review Pendaftar
                  </Link>
                </td>
              </tr>
            ))}
            {campaign.applicants.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">Belum ada pendaftar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
