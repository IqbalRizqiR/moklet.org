import { NextRequest, NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageRecruitment } from "@/utils/permissions";

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
      steps: { orderBy: { order: "asc" } },
      applicants: {
        include: {
          user: true,
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
  const stepHeaders = campaign.steps.map((s: { name: string }) => `Tahap: ${s.name}`);

  const headerRow = [...staticHeaders, ...stepHeaders].map(
    (value) => ({ value, fontWeight: "bold" as const }),
  );

  // Build data rows
  const dataRows = campaign.applicants.map((app: typeof campaign.applicants[number]) => {
    const staticCells = [
      { type: String, value: app.user.name },
      { type: String, value: app.user.email },
      { type: String, value: app.status },
    ];

    const stepCells = campaign.steps.map((step: { id: string; type?: string }) => {
      const status = app.step_statuses.find((s: { step_id: string; status: string }) => s.step_id === step.id);
      return {
        type: String,
        value: status?.status ?? (step.type === "FORM" ? "BELUM DIISI" : "PENDING"),
      };
    });

    return [...staticCells, ...stepCells];
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
