/* eslint-disable prettier/prettier */

import { Submission_Field } from "@prisma/client";
import { notFound } from "next/navigation";

import {
  CheckboxField,
  RadioField,
  TextArea,
  TextField,
} from "@/app/_components/global/Input";
import { H2, P } from "@/app/_components/global/Text";
import { transformToArrayCheckbox } from "@/utils/atomics";
import { findForm } from "@/utils/database/form.query";
import { findSubmission } from "@/utils/database/submission.query";

export default async function SubmissionDetail({
  params,
}: {
  params: Promise<{ id: string; submission_id: string }>;
}) {
  const { id, submission_id } = await params;
  const form = await findForm({ id });
  const submission = await findSubmission({ id: submission_id });

  if (!form || !submission) return notFound();

  return (
    <div className="block">
      <div className="w-full p-6 border-b border-black box-border">
        <H2>{form.title}</H2>
        <P>{form.description}</P>
        <P className="mt-4 font-medium">{submission.user.name}</P>{" "}
        <P className="text-red-500 text-sm mt-4">
          * Menunjukkan pertanyaan yang wajib diisi
        </P>
      </div>
      <div className="block mx-auto p-6">
        {form.fields &&
          form.fields.map((field: any) => {
            const submissionFields = transformToArrayCheckbox(
              submission.fields,
            ) as Submission_Field[];

            return (
              <div key={field.id}>
                {["email", "text", "password", "number"].includes(
                  field.type,
                ) && (
                  <TextField
                    type={field.type as string}
                    label={field.label}
                    name={field.id.toString()}
                    placeholder={"Jawaban Anda"}
                    className="mb-6 w-full"
                    required={field.required}
                    value={
                      submissionFields.find((item) => item.field_id == field.id)
                        ?.value
                    }
                    disabled
                  />
                )}
                {field.type === "longtext" && (
                  <TextArea
                    label={field.label}
                    name={field.id.toString()}
                    placeholder={"Jawaban Anda"}
                    className="mb-6 w-full"
                    required={field.required}
                    value={
                      submissionFields.find((item) => item.field_id == field.id)
                        ?.value
                    }
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
                    value={
                      submissionFields.find(
                        (item) => item.field_id === field.id,
                      )?.value
                    }
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
                    value={
                      submissionFields.find(
                        (item) => item.field_id === field.id,
                      )?.value
                    }
                    disabled
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
