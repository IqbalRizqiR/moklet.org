import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { H2 } from "@/app/_components/global/Text";
import CountdownTimer from "@/app/_components/global/CountdownTimer";
import StatusTimeline from "./_components/StatusTimeline";
import CampaignDetailClient from "./_components/CampaignDetailClient";

type PageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  const { campaignId } = await params;
  const session = await auth();
  if (!session?.user?.id)
    redirect("/api/auth/signin?callbackUrl=/recruitment/" + campaignId);

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    include: {
      organisasi: true,
      steps: { orderBy: { order: "asc" } },
    },
  });

  if (!campaign)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <H2>Campaign tidak ditemukan.</H2>
        <Link
          href="/recruitment"
          className="text-primary-500 mt-4 inline-block"
        >
          Kembali ke Daftar Oprec
        </Link>
      </div>
    );

  const applicant = await prisma.recruitment_Applicant.findUnique({
    where: {
      campaign_id_user_id: {
        campaign_id: campaign.id,
        user_id: session.user.id,
      },
    },
    include: {
      step_statuses: true,
    },
  });

  const now = new Date();
  const notYetOpen = campaign.open_date && campaign.open_date > now;
  const isClosed = campaign.close_date && campaign.close_date < now;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/recruitment"
        className="text-gray-500 hover:text-black mb-6 inline-block"
      >
        &larr; Kembali
      </Link>

      {/* Campaign Header */}
      <div className="bg-white rounded-xl p-8 shadow-sm border mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
        <p className="text-gray-600">
          {campaign.organisasi.organisasi_name ||
            campaign.organisasi.organisasi}
        </p>
        {campaign.description && (
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            {campaign.description}
          </p>
        )}

        {/* Dates */}
        <div className="flex justify-center gap-8 mt-6 text-sm">
          {campaign.open_date && (
            <div>
              <span className="text-gray-400 block text-xs uppercase tracking-wide">
                Dibuka
              </span>
              <span className="font-medium">
                {new Date(campaign.open_date).toLocaleDateString("id-ID", {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          )}
          {campaign.close_date && (
            <div>
              <span className="text-gray-400 block text-xs uppercase tracking-wide">
                Ditutup
              </span>
              <span className="font-medium">
                {new Date(campaign.close_date).toLocaleDateString("id-ID", {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {!applicant ? (
        /* Not registered yet — show registration CTA */
        <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
          <H2>Daftar {campaign.title}</H2>
          {notYetOpen ? (
            <div className="mt-4">
              <p className="text-gray-600 mb-4">Pendaftaran akan dibuka dalam:</p>
              <CountdownTimer
                targetDate={campaign.open_date!.toISOString()}
              />
            </div>
          ) : isClosed ? (
            <p className="text-gray-600 mt-4">Pendaftaran sudah ditutup.</p>
          ) : (
            <div className="mt-6">
              <p className="text-gray-600 mb-6">
                Isi formulir pendaftaran untuk bergabung dengan{" "}
                {campaign.organisasi.organisasi_name ||
                  campaign.organisasi.organisasi}.
              </p>
              <CampaignDetailClient
                campaignId={campaign.id}
                formId={campaign.form_id}
                userId={session.user.id}
                registrationSuccessMessage={
                  campaign.registration_success_message
                }
                registrationSuccessLinks={
                  campaign.registration_success_links as
                    | Array<{ label: string; url: string }>
                    | undefined
                }
              />
            </div>
          )}
        </div>
      ) : (
        /* Already registered — show status timeline */
        <div>
          <p className="text-sm text-gray-500 mb-6">
            Status pendaftaran Anda untuk {campaign.title}
          </p>

          {campaign.steps.length > 0 ? (
            <StatusTimeline
              steps={campaign.steps.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                type: s.type,
                announcement_date: s.announcement_date,
                close_date: s.close_date,
                form_id: s.form_id,
                success_message: s.success_message,
                success_links: s.success_links as
                  | Array<{ label: string; url: string }>
                  | undefined,
              }))}
              applicantStepStatuses={applicant.step_statuses.map((s) => ({
                step_id: s.step_id,
                status: s.status as "PASSED" | "FAILED",
                submission_id: s.submission_id,
              }))}
              applicantId={applicant.id}
              userId={session.user.id}
            />
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center text-gray-500">
              Belum ada tahapan seleksi yang diatur.
            </div>
          )}

          {/* Final Status */}
          {applicant.status !== "PENDING" && (
            <div
              className={`mt-8 p-6 rounded-xl border-2 text-center ${
                applicant.status === "ACCEPTED"
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <h2 className="text-2xl font-bold mb-2">Status Akhir</h2>
              <p className="text-lg">
                {applicant.status === "ACCEPTED"
                  ? `Selamat! Anda telah diterima sebagai anggota ${campaign.organisasi.organisasi_name || campaign.organisasi.organisasi}.`
                  : "Mohon maaf, Anda belum diterima pada periode kali ini. Tetap semangat!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
