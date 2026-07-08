import { NextRequest, NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageRecruitment } from "@/utils/permissions";
import { transformToArrayCheckbox } from "@/utils/atomics";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ organisasi: string; campaignId: string }> },
) {
  const { organisasi: orgTypeString, campaignId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { hasAccess } = await canManageRecruitment(session.user.id, orgTypeString);
  if (!hasAccess) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const campaign = await prisma.recruitment_Campaign.findUnique({
    where: { id: campaignId },
    include: {
      form: {
        include: { fields: { orderBy: { fieldNumber: "asc" } } },
      },
      steps: { orderBy: { order: "asc" } },
      applicants: {
        include: {
          user: true,
          submission: { include: { fields: true } },
          step_statuses: true,
        },
      },
    },
  });

  if (!campaign) {
    return new NextResponse("Campaign not found", { status: 404 });
  }

  // Build header row
  const staticHeaders = ["Nama", "Email", "Status Akhir"];
  const questionHeaders = campaign.form.fields.map((f: { label: string }) => f.label);
  const stepHeaders = campaign.steps.map((s: { name: string }) => `Tahap: ${s.name}`);

  const headerRow = [...staticHeaders, ...questionHeaders, ...stepHeaders].map(
    (value) => ({ value, fontWeight: "bold" as const }),
  );

  // Build data rows
  const dataRows = campaign.applicants.map((app: typeof campaign.applicants[number]) => {
    // app.submission is always present by schema (submission_id is required on
    // Recruitment_Applicant with Cascade). Still guard against null so a single
    // orphan row never crashes the entire export.
    const answers = app.submission
      ? (transformToArrayCheckbox(app.submission.fields) as {
          field_id: number;
          value: string | string[];
        }[])
      : [];

    const staticCells = [
      { type: String, value: app.user.name },
      { type: String, value: app.user.email },
      { type: String, value: app.status },
    ];

    const questionCells = campaign.form.fields.map((field: { id: number }) => {
      const found = answers.find((a) => a.field_id === field.id);
      let value = "";
      if (found) {
        value = Array.isArray(found.value) ? found.value.join(", ") : found.value;
      }
      return { type: String, value };
    });

    const stepCells = campaign.steps.map((step: { id: string; type?: string }) => {
      const status = app.step_statuses.find((s: { step_id: string; status: string }) => s.step_id === step.id);
      // Distinguish "not yet reached" (no record) from "explicitly PENDING":
      // if the step type is FORM and there's no record, the applicant hasn't
      // reached it yet. If the type is ANNOUNCEMENT, PENDING = awaiting review.
      return {
        type: String,
        value: status?.status ?? (step.type === "FORM" ? "BELUM DIISI" : "PENDING"),
      };
    });

    return [...staticCells, ...questionCells, ...stepCells];
  });

  const data = [headerRow, ...dataRows];

  const buffer = await writeXlsxFile(data as unknown as never, {
    buffer: true,
  });

  const safeTitle = campaign.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const response = new NextResponse(new Uint8Array(buffer));
  response.headers.set(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  response.headers.set(
    "Content-Disposition",
    `attachment; filename="pendaftar_${safeTitle}.xlsx"`,
  );
  return response;
}
