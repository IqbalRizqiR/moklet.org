import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CountdownTimer from "@/app/_components/global/CountdownTimer";
import Link from "next/link";
import { H2 } from "@/app/_components/global/Text";
import StepFormSection from "./_components/StepFormSection";

type PageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function AnnouncementPage({ params }: PageProps) {
  const { campaignId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin?callbackUrl=/recruitment/" + campaignId);

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    include: {
      organisasi: true,
      steps: { orderBy: { order: 'asc' } },
    }
  });

  if (!campaign) return <div className="p-8 text-center">Campaign tidak ditemukan.</div>;

  const applicant = await prisma.recruitment_Applicant.findUnique({
    where: {
      campaign_id_user_id: {
        campaign_id: campaign.id,
        user_id: session.user.id
      }
    },
    include: {
      step_statuses: true
    }
  });

  if (!applicant) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <H2>Anda belum mendaftar untuk campaign ini.</H2>
        <Link href="/recruitment" className="text-primary-500 mt-4 block">Kembali ke Daftar Oprec</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/recruitment" className="text-gray-500 hover:text-black mb-6 inline-block">&larr; Kembali</Link>

      <div className="bg-white rounded-xl p-8 shadow-sm border mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Pengumuman {campaign.title}</h1>
        <p className="text-gray-600">{campaign.organisasi.organisasi_name}</p>
      </div>

      <div className="space-y-6">
        {campaign.steps.map((step: any, idx: number) => {
          const statusRecord = applicant.step_statuses.find((s: any) => s.step_id === step.id);
          const isAnnounced = step.announcement_date && new Date(step.announcement_date) <= new Date();
          const prevStep = idx > 0 ? campaign.steps[idx - 1] : null;
          const prevStatus = prevStep
            ? applicant.step_statuses.find((s: any) => s.step_id === prevStep.id)?.status
            : "PASSED";
          const canAccess = idx === 0 || prevStatus === "PASSED";

          return (
            <div key={step.id} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">Tahap {idx + 1}: {step.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${step.type === "FORM" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {step.type === "FORM" ? "Formulir" : "Pengumuman"}
                    </span>
                  </div>
                  {step.description && <p className="text-sm text-gray-500 mt-1">{step.description}</p>}
                  {step.announcement_date && (
                    <p className="text-sm text-gray-500 mt-1">
                      Pengumuman: {new Date(step.announcement_date).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                <div className="text-right flex flex-col items-center gap-2">
                  {/* FORM-type step: show form button */}
                  {step.type === "FORM" && canAccess && !statusRecord?.submission_id && (
                    <StepFormSection
                      stepId={step.id}
                      formId={step.form_id}
                      applicantId={applicant.id}
                      userId={session.user.id}
                    />
                  )}

                  {/* Show status for both types */}
                  {!step.announcement_date && step.type !== "FORM" ? (
                    <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-bold">Menunggu Jadwal</span>
                  ) : step.type === "FORM" && statusRecord?.submission_id && !isAnnounced ? (
                    <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold">Formulir Terkirim</span>
                  ) : isAnnounced ? (
                    statusRecord ? (
                      <span className={`px-4 py-2 rounded-full font-bold text-white ${statusRecord.status === 'PASSED' ? 'bg-green-500' : statusRecord.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                        {statusRecord.status === 'PASSED' ? 'LULUS' : statusRecord.status === 'FAILED' ? 'TIDAK LULUS' : 'PENDING'}
                      </span>
                    ) : (
                      <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-bold">Sedang Diproses</span>
                    )
                  ) : step.announcement_date && step.type !== "FORM" ? (
                    <CountdownTimer targetDate={new Date(step.announcement_date).toISOString()} />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
        {campaign.steps.length === 0 && (
          <div className="text-center text-gray-500 p-4 border rounded-xl border-dashed">
            Belum ada tahapan seleksi yang diatur.
          </div>
        )}
      </div>

      {applicant.status !== "PENDING" && (
        <div className={`mt-8 p-6 rounded-xl border-2 text-center ${applicant.status === 'ACCEPTED' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <h2 className="text-2xl font-bold mb-2">Status Akhir</h2>
          <p className="text-lg">
            {applicant.status === 'ACCEPTED'
              ? `Selamat! Anda telah diterima sebagai anggota ${campaign.organisasi.organisasi_name}.`
              : "Mohon maaf, Anda belum diterima pada periode kali ini. Tetap semangat!"}
          </p>
        </div>
      )}
    </div>
  );
}
