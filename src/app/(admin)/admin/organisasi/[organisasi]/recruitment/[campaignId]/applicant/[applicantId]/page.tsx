import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { isOrgLeader } from "@/utils/permissions";
import Link from "next/link";
import { H2, H3, P } from "@/app/_components/global/Text";
import { TextField, TextArea, RadioField, CheckboxField } from "@/app/_components/global/Input";

import { findLatestPeriod } from "@/utils/database/periodYear.query";
import { findOrganisasi } from "@/utils/database/organisasi.query";
import { Organisasi_Type, Submission_Field, StepStatus } from "@prisma/client";
import { transformToArrayCheckbox } from "@/utils/atomics";

type PageProps = {
  params: Promise<{ organisasi: string, campaignId: string, applicantId: string }>;
};

export default async function ApplicantReviewPage({ params }: PageProps) {
  const { organisasi: orgTypeString, campaignId, applicantId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

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

  const applicant = await prisma.recruitment_Applicant.findUnique({
    where: { id: applicantId },
    include: {
      user: true,
      campaign: {
        include: {
          steps: { orderBy: { order: 'asc' } },
          form: { include: { fields: { include: { options: true } } } }
        }
      },
      step_statuses: true,
    }
  });

  if (!applicant || applicant.campaign_id !== campaignId) return notFound();

  const submission = await prisma.submission.findUnique({
    where: { id: applicant.submission_id },
    include: { fields: true }
  });

  if (!submission) return notFound();

  const form = applicant.campaign.form;
  const submissionFields = transformToArrayCheckbox((submission.fields as any[]) || []) as Submission_Field[];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link href={`/admin/organisasi/${orgTypeString}/recruitment/${campaignId}`} className="text-gray-500 hover:text-black mb-4 inline-block">&larr; Kembali ke Dashboard Campaign</Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Answers */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm">
          <div className="p-6 border-b">
            <H2>Jawaban Pendaftar: {applicant.user.name}</H2>
            <P className="text-gray-500">Email: {applicant.user.email}</P>
          </div>
          <div className="p-6">
            {form?.fields && form.fields.map((field: any) => (
              <div key={field.id}>
                {["email", "text", "password", "number"].includes(field.type) && (
                  <TextField
                    type={field.type as string}
                    label={field.label}
                    name={field.id.toString()}
                    className="mb-6 w-full"
                    required={field.required}
                    value={submissionFields.find((item) => item.field_id == field.id)?.value}
                    disabled
                  />
                )}
                {field.type === "longtext" && (
                  <TextArea
                    label={field.label}
                    name={field.id.toString()}
                    className="mb-6 w-full"
                    required={field.required}
                    value={submissionFields.find((item) => item.field_id == field.id)?.value}
                    disabled
                  />
                )}
                {field.type === "radio" && (
                  <RadioField
                    label={field.label}
                    name={field.id.toString()}
                    options={field.options.map((item: any) => ({
                      id: item.field_id + "_" + item.id,
                      value: item.value,
                    }))}
                    className="mb-6 w-full"
                    required={field.required}
                    value={submissionFields.find((item) => item.field_id === field.id)?.value}
                    disabled
                  />
                )}
                {field.type === "checkbox" && (
                  <CheckboxField
                    label={field.label}
                    name={field.id.toString()}
                    options={field.options.map((item: any) => ({
                      id: item.field_id + "_" + item.id,
                      value: item.value,
                    }))}
                    className="mb-6 w-full"
                    required={field.required}
                    value={submissionFields.find((item) => item.field_id === field.id)?.value}
                    disabled
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Step Status & Final Decision */}
        <div className="flex flex-col gap-6">
          
          {/* Steps Progress */}
          {applicant.campaign.steps.length > 0 && (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <H3 className="mb-4">Evaluasi Tahapan</H3>
              <div className="flex flex-col gap-4">
                {applicant.campaign.steps.map((step: any) => {
                  const stepStatus = applicant.step_statuses.find((s: any) => s.step_id === step.id)?.status || "PENDING";
                  return (
                    <div key={step.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="font-semibold mb-2">{step.name}</div>
                      <div className="flex gap-2">
                        <form action={async () => {
                          "use server";
                          const { passApplicantStep } = await import("@/actions/recruitment");
                          await passApplicantStep(applicant.id, step.id, "PASSED");
                        }}>
                          <button type="submit" disabled={stepStatus === "PASSED"} className={`px-3 py-1 rounded text-sm font-medium ${stepStatus === "PASSED" ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Lulus</button>
                        </form>
                        <form action={async () => {
                          "use server";
                          const { passApplicantStep } = await import("@/actions/recruitment");
                          await passApplicantStep(applicant.id, step.id, "FAILED");
                        }}>
                          <button type="submit" disabled={stepStatus === "FAILED"} className={`px-3 py-1 rounded text-sm font-medium ${stepStatus === "FAILED" ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Gagal</button>
                        </form>
                        <form action={async () => {
                          "use server";
                          const { passApplicantStep } = await import("@/actions/recruitment");
                          await passApplicantStep(applicant.id, step.id, "PENDING");
                        }}>
                          <button type="submit" disabled={stepStatus === "PENDING"} className={`px-3 py-1 rounded text-sm font-medium ${stepStatus === "PENDING" ? 'bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Pending</button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Decision */}
          <div className="bg-white p-6 rounded-xl border shadow-sm border-blue-200">
            <H3 className="mb-2">Keputusan Akhir</H3>
            <P className="text-sm text-gray-600 mb-4">Ubah status akhir pendaftar. Jika diluluskan, sistem akan otomatis mendaftarkan user ke dalam Organisasi periode ini.</P>
            
            <div className="font-medium mb-3">
              Status Saat Ini: <span className={`px-2 py-1 rounded text-xs font-bold ${applicant.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : applicant.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{applicant.status}</span>
            </div>

            <div className="flex gap-2 w-full">
              <form action={async () => {
                "use server";
                const { finalizeApplicant } = await import("@/actions/recruitment");
                await finalizeApplicant(applicant.id, "ACCEPTED");
              }} className="flex-1">
                <button type="submit" disabled={applicant.status === 'ACCEPTED'} className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition-colors">
                  Luluskan
                </button>
              </form>
              <form action={async () => {
                "use server";
                const { finalizeApplicant } = await import("@/actions/recruitment");
                await finalizeApplicant(applicant.id, "REJECTED");
              }} className="flex-1">
                <button type="submit" disabled={applicant.status === 'REJECTED'} className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition-colors">
                  Tolak
                </button>
              </form>
            </div>
            
            {(applicant.status === 'ACCEPTED' || applicant.status === 'REJECTED') && (
              <form action={async () => {
                "use server";
                const { finalizeApplicant } = await import("@/actions/recruitment");
                await finalizeApplicant(applicant.id, "PENDING");
              }} className="mt-2 w-full">
                <button type="submit" className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium transition-colors">
                  Batalkan Keputusan
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
