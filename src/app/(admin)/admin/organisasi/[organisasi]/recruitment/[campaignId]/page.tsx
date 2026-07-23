import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageRecruitment } from "@/utils/permissions";
import Link from "next/link";
import { H2 } from "@/app/_components/global/Text";
import CampaignRealtimeListener from "@/app/_components/global/CampaignRealtimeListener";
import { toggleCampaign } from "@/actions/recruitment";
import EditCampaignTime from "./_components/EditCampaignTime";
import EditCampaignDetails from "./_components/EditCampaignDetails";
import ApplicantTable from "./_components/ApplicantTable";

type PageProps = {
  params: Promise<{ organisasi: string, campaignId: string }>;
};

export default async function CampaignDashboard({ params }: PageProps) {
  const { organisasi: orgTypeString, campaignId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const { hasAccess } = await canManageRecruitment(session.user.id, orgTypeString);
  if (!hasAccess) redirect("/admin/organisasi");

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

  const isExpired = campaign.close_date < new Date();

  const applicantsData = campaign.applicants.map((app: any) => ({
    id: app.id,
    name: app.user.name,
    email: app.user.email,
    status: app.status,
    user_pic: app.user.user_pic,
  }));

  return (
    <div className="p-6">
      <CampaignRealtimeListener campaignId={campaignId} />
      <Link href={`/admin/organisasi/${orgTypeString}/recruitment`} className="text-gray-500 hover:text-black mb-4 inline-block">&larr; Kembali</Link>

      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <EditCampaignDetails
              campaignId={campaignId}
              currentTitle={campaign.title}
              currentDescription={campaign.description}
            />
            <p className="text-gray-500 mt-2">Total Pendaftar: {campaign.applicants.length}</p>

            {isExpired && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                Campaign sudah melewati tanggal tutup
              </div>
            )}

            <div className="mt-4 max-w-sm">
              <EditCampaignTime campaignId={campaignId} currentOpenDate={campaign.open_date} currentCloseDate={campaign.close_date} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <Link href={`/admin/organisasi/${orgTypeString}/recruitment/${campaignId}/steps`} className="bg-primary-500 hover:bg-primary-600 transition-colors text-white px-4 py-2 rounded font-medium text-sm">
              Kelola Tahapan
            </Link>
            <a
              href={`/admin/organisasi/${orgTypeString}/recruitment/${campaignId}/excel`}
              className="bg-green-600 hover:bg-green-700 transition-colors text-white px-4 py-2 rounded font-medium text-sm"
            >
              Export Excel
            </a>
            {!isExpired && (
              <form action={toggleCampaign.bind(null, campaignId, !campaign.is_active)}>
                <button type="submit" className={`px-4 py-2 rounded text-white text-sm font-medium ${campaign.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} transition-colors`}>
                  {campaign.is_active ? 'Nonaktifkan' : 'Aktifkan Campaign'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <ApplicantTable
        applicants={applicantsData}
        orgTypeString={orgTypeString}
        campaignId={campaignId}
      />
    </div>
  );
}
