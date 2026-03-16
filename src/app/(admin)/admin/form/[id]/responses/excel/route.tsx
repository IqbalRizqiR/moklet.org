import { FormWithSubmissions } from "@/types/entityRelations";
import { transformToArrayCheckbox } from "@/utils/atomics";
import { findFormWithSubmission } from "@/utils/database/form.query";
import { NextRequest, NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const form = (await findFormWithSubmission({
    id,
  })) as FormWithSubmissions;

  let headerRow = [
    {
      field_id: 0,
      value: "Submitted",
      fontWeight: "bold",
    },
    {
      field_id: 0,
      value: "Edited",
      fontWeight: "bold",
    },
    {
      field_id: 0,
      value: "Email Address",
      fontWeight: "bold",
    },
    {
      field_id: 0,
      value: "Name",
      fontWeight: "bold",
    },
  ];

  headerRow = headerRow.concat(
    form.fields.map((item) => {
      return {
        field_id: item.id,
        value: item.label,
        fontWeight: "bold",
      };
    }),
  );

  const dataRow = form.submissions.map((item) => {
    const convert = transformToArrayCheckbox(item.fields) as {
      field_id: number;
      value: string | string[];
    }[];
    return headerRow.map((header) => {
      let value: string | Date;

      if (header.value == "Submitted") {
        value = new Date(
          new Date(item.created_at).toLocaleString("en", {
            timeZone: "Asia/Jakarta",
          }),
        );
      } else if (header.value == "Edited") {
        value = new Date(
          new Date(item.updated_at).toLocaleString("en", {
            timeZone: "Asia/Jakarta",
          }),
        );
      } else if (header.value == "Email Address") {
        value = item.user.email;
      } else if (header.value == "Name") {
        value = item.user.name;
      } else {
        const findValue = convert.find(
          (field: { field_id: number; value: string | string[] }) =>
            field.field_id == header.field_id,
        );

        if (!findValue) {
          value = "";
        } else if (typeof findValue.value === "string") {
          value = findValue.value;
        } else {
          value = findValue.value.join(", ");
        }
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
    `attachment; filename="Form Response ${form.title}.xlsx"`,
  );
  return response;
}
