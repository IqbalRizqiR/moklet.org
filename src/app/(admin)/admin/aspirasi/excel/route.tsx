import { Organisasi_Type, Prisma, UnitSekolah } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";
import { findAllAspirationsWithEvent } from "@/utils/database/aspiration.query";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const to = searchParams.get("to");
  const from = searchParams.get("from");
  const organisasi = searchParams.get("organisasi");
  const unit = searchParams.get("unit");
  const event = searchParams.get("event");

  let query: Prisma.AspirasiWhereInput;

  if (organisasi && organisasi != "" && to && to != "" && from && from != "") {
    const organ = organisasi.toUpperCase() as Organisasi_Type;
    query = {
      organisasi: organ,
      created_at: { gte: new Date(from), lte: new Date(to + "T23:59:59Z") },
    };
  }
  if (unit && unit != "" && from && from != "" && to && to != "") {
    const unitQ = unit.toUpperCase() as UnitSekolah;
    query = {
      unit_sekolah: unitQ,
      created_at: { gte: new Date(from), lte: new Date(to + "T23:59:59Z") },
    };
  }

  if (event && event != "")
    query = {
      event: { id: event },
    };

  if (!query!)
    return NextResponse.json(
      {
        success: false,
        message: "Bad Request",
      },
      { status: 400 },
    );

  const aspirations = await findAllAspirationsWithEvent(query);

  const headerRow = [
    {
      value: "Timestamp",
      fontWeight: "bold",
    },
    {
      value: "Email",
      fontWeight: "bold",
    },
    {
      value: "Nama",
      fontWeight: "bold",
    },
    {
      value: "Tujuan",
      fontWeight: "bold",
    },
    {
      value: "Judul",
      fontWeight: "bold",
    },
    {
      value: "Isi Aspirasi",
      fontWeight: "bold",
    },
  ];

  const dataRow = aspirations.map((item: any) => {
    return headerRow.map((header: any) => {
      let value: string | Date;

      if (header.value == "Timestamp") {
        value = new Date(
          new Date(item.created_at).toLocaleString("en", {
            timeZone: "Asia/Jakarta",
          }),
        );
      } else if (header.value == "Email") {
        value = item.user.email;
      } else if (header.value == "Nama") {
        value = item.user.name;
      } else if (header.value == "Tujuan") {
        value =
          item.organisasi ?? item.unit_sekolah ?? item.event?.event_name ?? "";
      } else if (header.value == "Isi Aspirasi") {
        value = item.pesan_aspirasi;
      } else {
        value = item.judul_aspirasi;
      }
      return {
        type: typeof value == "string" ? String : Date,
        format: typeof value == "object" ? "dd/mm/yyyy hh:mm AM/PM" : undefined,
        value,
      };
    });
  });

  const data = [headerRow, ...dataRow];

  const buffer = await writeXlsxFile(data as unknown as never, {
    buffer: true,
  });

  const response = new NextResponse(new Uint8Array(buffer));
  response.headers.set(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  response.headers.set(
    "Content-Disposition",
    `attachment; filename="response aspirasi.xlsx"`,
  );
  return response;
}
