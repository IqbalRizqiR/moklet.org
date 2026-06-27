import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isOrgLeader } from "@/utils/permissions";
import Link from "next/link";
import { H2, H3 } from "@/app/_components/global/Text";
import { Button } from "@/app/_components/global/Button";
import { TextField } from "@/app/_components/global/Input";

import { findLatestPeriod } from "@/utils/database/periodYear.query";
import { findOrganisasi } from "@/utils/database/organisasi.query";
import { Organisasi_Type } from "@prisma/client";
import EditStepTime from "./_components/EditStepTime";

export default async function CampaignStepsDashboard({ params }: { params: Promise<{ organisasi: string, campaignId: string }> }) {
  const { organisasi: orgTypeString, campaignId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  // Auth logic (similar to campaign dashboard)
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
      steps: { orderBy: { order: 'asc' } }
    }
  });

  if (!campaign) return <div>Campaign tidak ditemukan</div>;

  return (
    <div className="p-6">
      <Link href={`/admin/organisasi/${orgTypeString}/recruitment/${campaignId}`} className="text-gray-500 hover:text-black mb-4 inline-block">&larr; Kembali ke Dashboard Campaign</Link>
      
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <H2>Kelola Tahapan: {campaign.title}</H2>
        <p className="text-gray-500">Atur tahapan rekrutmen (misalnya: Tes Tulis, Wawancara). Peserta harus melewati tahapan ini secara berurutan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
          <H3 className="mb-4">Tambah Tahapan Baru</H3>
          <form action={async (formData: FormData) => {
            "use server";
            const name = formData.get("name") as string;
            const announcementDate = formData.get("announcementDate") as string;
            if (!name) return;
            const { addStep } = await import("@/actions/recruitment");
            await addStep(campaignId, name, announcementDate);
          }} className="flex flex-col gap-4">
            <TextField 
              type="text"
              label="Nama Tahapan" 
              name="name" 
              placeholder="Contoh: Wawancara Tahap 1" 
              required 
            />
            <TextField 
              label="Waktu Pengumuman (Opsional)" 
              name="announcementDate" 
              type="datetime-local"
            />
            <Button type="submit" variant="primary">Simpan Tahapan</Button>
          </form>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-fit">
          <div className="bg-gray-50 p-4 border-b">
            <H3 className="text-lg m-0">Daftar Tahapan</H3>
          </div>
          {campaign.steps.length > 0 ? (
            <ul className="divide-y">
              {campaign.steps.map((step: any, index: number) => (
                <li key={step.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-bold text-gray-900">
                      <span className="text-primary-500 mr-2">{index + 1}.</span> 
                      {step.name}
                    </div>
                    <EditStepTime stepId={step.id} currentDate={step.announcement_date} />
                  </div>
                  {/* Future enhancement: add move up/down or delete buttons here */}
                </li>
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
