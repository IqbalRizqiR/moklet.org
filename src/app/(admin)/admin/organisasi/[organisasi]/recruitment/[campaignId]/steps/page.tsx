import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageRecruitment } from "@/utils/permissions";
import Link from "next/link";
import { H2, H3 } from "@/app/_components/global/Text";
import EditStepItem from "./_components/EditStepItem";
import AddStepForm from "./_components/AddStepForm";

export default async function CampaignStepsDashboard({ params }: { params: Promise<{ organisasi: string, campaignId: string }> }) {
  const { organisasi: orgTypeString, campaignId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const { hasAccess } = await canManageRecruitment(session.user.id, orgTypeString);
  if (!hasAccess) redirect("/admin/organisasi");

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    include: {
      steps: { orderBy: { order: 'asc' } }
    }
  });

  if (!campaign) return <div>Campaign tidak ditemukan</div>;

  return (
    <div className="p-6">
      <Link href={`/admin/organisasi/${orgTypeString}/recruitment/${campaignId}`} className="text-gray-500 hover:text-black mb-4 inline-block">&larr; Kembali ke Dashboard Campaign</Link>

      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <H2>Kelola Tahapan: {campaign.title}</H2>
        <p className="text-gray-500">Atur tahapan rekrutmen (misalnya: Tes Tulis, Wawancara). Peserta harus melewati tahapan ini secara berurutan. Tahapan bisa berupa <b>Pengumuman</b> (lulus/tidak) atau <b>Formulir</b> (peserta mengisi form tambahan).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AddStepForm
          campaignId={campaignId}
          campaignOpenDate={campaign.open_date.toISOString()}
          campaignCloseDate={campaign.close_date.toISOString()}
        />

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-fit">
          <div className="bg-gray-50 p-4 border-b">
            <H3 className="text-lg m-0">Daftar Tahapan</H3>
          </div>
          {campaign.steps.length > 0 ? (
            <ul className="divide-y">
              {campaign.steps.map((step: any, index: number) => (
                <EditStepItem
                  key={step.id}
                  stepId={step.id}
                  name={step.name}
                  order={index + 1}
                  type={step.type}
                  openDate={step.open_date}
                  announcementDate={step.announcement_date}
                  closeDate={step.close_date}
                  description={step.description}
                  passMessage={step.pass_message}
                  passLinks={step.pass_links as Array<{ label: string; url: string }> | null}
                  failMessage={step.fail_message}
                  failLinks={step.fail_links as Array<{ label: string; url: string }> | null}
                  campaignOpenDate={campaign.open_date.toISOString()}
                  campaignCloseDate={campaign.close_date.toISOString()}
                />
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Belum ada tahapan. Silakan buat tahapan baru.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
