/* eslint-disable @typescript-eslint/ban-types */

import { notFound } from "next/navigation";
import { ReactNode } from "react";
import {
  FaCalendar,
  FaEdit,
  FaList,
  FaPaperPlane,
  FaRegFileExcel,
  FaUser,
} from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";

import { H2, P } from "@/app/_components/global/Text";
import { FormWithSubmissions } from "@/types/entityRelations";
import { stringifyDate } from "@/utils/atomics";
import { findFormWithSubmission } from "@/utils/database/form.query";

import {
  BarChartSummary,
  ListSummary,
  PieChartSummary,
} from "./_components/ResponsesSummary";
import ResponsesTable from "./_components/Table";
import LinkButton from "@/app/_components/global/Button";

function StatsCard({
  title,
  stats,
  Icon,
}: Readonly<{
  title: string;
  stats: string;
  Icon: ReactNode;
}>) {
  return (
    <div className="w-full md:w-[30%] px-8 py-4 flex items-center justify-between bg-neutral-200 rounded-xl">
      <div className="w-[80%] block">
        <P>{title}</P>
        <H2>{stats}</H2>
      </div>
      {Icon}
    </div>
  );
}

export default async function FormResponses({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const form = (await findFormWithSubmission({
    id,
  })) as FormWithSubmissions;

  if (!form) return notFound();

  const submissionsFields = form.submissions
    .map((submission) => submission.fields)
    .flat(1);

  return (
    <>
      <div className="w-full mb-8">
        <div className="flex md:flex-row flex-col md:items-center mb-5 md:justify-between">
          <H2 className="font-semibold">
            {form.submissions.length ? (
              <>
                Respon untuk{" "}
                <span className="text-primary-500">{form.title}</span>
              </>
            ) : (
              <>
                Belum ada respon untuk{" "}
                <span className="text-primary-500">{form.title}</span>
              </>
            )}
          </H2>
          <LinkButton
            href="responses/excel"
            variant={"primary"}
            className="text-center flex gap-2 items-center"
            disabledProgressBar
            target="_blank"
            prefetch={false}
          >
            <FaRegFileExcel />
            Download Excel
          </LinkButton>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-y-4">
          <StatsCard
            title="Total Responden"
            stats={form.submissions.length.toString()}
            Icon={<FaUserGroup color="black" className="w-8 h-8" />}
          />
          <StatsCard
            title="Jumlah Field"
            stats={form.fields.length.toString()}
            Icon={<FaList color="black" className="w-8 h-8" />}
          />
          <StatsCard
            title="Dibuka"
            stats={form.open_at ? stringifyDate(form.open_at) : "-"}
            Icon={<FaCalendar color="black" className="w-8 h-8" />}
          />
          <StatsCard
            title="Dibuat oleh"
            stats={form.user.name.split(" ")[0]}
            Icon={<FaUser color="black" className="w-8 h-8" />}
          />
          <StatsCard
            title="Dapat diedit"
            stats={{ true: "Ya", false: "Tidak" }[form.allow_edit as keyof {}]}
            Icon={<FaEdit color="black" className="w-8 h-8" />}
          />
          <StatsCard
            title="Ditutup"
            stats={form.close_at ? stringifyDate(form.close_at) : "-"}
            Icon={<FaCalendar color="black" className="w-8 h-8" />}
          />
          <StatsCard
            title="Sekali submit"
            stats={{ true: "Ya", false: "Tidak" }[form.submit_once as keyof {}]}
            Icon={<FaPaperPlane color="black" className="w-8 h-8" />}
          />
        </div>
      </div>
      <ResponsesTable data={form.submissions} formId={id} />
      <div className="w-full mb-8">
        <H2 className="font-semibold mb-5">Ringkasan</H2>
        <div className="flex flex-col gap-4">
          {form.fields.map((field) => {
            // Submissions for this field
            const fieldSubmissions = submissionsFields.filter(
              (item) => item.field_id === field.id,
            );
            // Values of the submissions
            const fieldSubmissionsValues = fieldSubmissions.map(
              (submissionField) => submissionField.value,
            );

            if (field.type === "radio") {
              return (
                <PieChartSummary
                  key={field.id}
                  question={field.label}
                  submissions={fieldSubmissionsValues}
                />
              );
            }

            if (field.type === "checkbox") {
              return (
                <BarChartSummary
                  key={field.id}
                  question={field.label}
                  submissions={fieldSubmissionsValues}
                />
              );
            }

            return (
              <ListSummary
                key={field.id}
                question={field.label}
                submissions={fieldSubmissionsValues}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
