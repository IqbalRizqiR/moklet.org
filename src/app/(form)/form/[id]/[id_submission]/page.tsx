import { Metadata } from "next";
import Link from "next/link";
import { redirect, RedirectType, notFound } from "next/navigation";
import React from "react";

import { H2, P } from "@/app/_components/global/Text";
import { auth } from "@/lib/auth";
import {
  stringifyCompleteDate,
  transformToArrayCheckbox,
} from "@/utils/atomics";
import { findForm } from "@/utils/database/form.query";
import { findSubmissionWithForm } from "@/utils/database/submission.query";

import ForbiddenForm from "../../_components/ForbiddenForm";
import Form from "../../_components/Form";

type Props = {
  params: Promise<{ id: string; id_submission: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const form = await findForm({ id });

  return {
    title: form?.title ?? "Not Found",
    description: form?.description,
  };
}

const page = async ({ params }: Props) => {
  const { id, id_submission } = await params;
  const session = await auth();
  if (!session)
    return redirect(
      `/api/auth/signin?callbackUrl=/form/${id}/${id_submission}`,
      RedirectType.replace,
    );

  const submission = await findSubmissionWithForm({
    user_id: session.user?.id,
    form_id: id,
    id: id_submission,
  });

  if (!submission) return notFound();

  const form = submission?.form;

  if (!form.is_open) return <ForbiddenForm />;
  if (
    (form.open_at && new Date(form.open_at).getTime() > new Date().getTime()) ||
    (form.close_at && new Date(form.close_at).getTime() < new Date().getTime())
  )
    return <ForbiddenForm />;

  if (!form.allow_edit)
    return <ForbiddenForm message="Anda sudah menjawab formulir ini." />;

  return (
    <div className="items-start justify-between mx-auto max-w-[90vw] w-[640px] bg-white rounded-md">
      <div className="w-full p-6 border-b border-black box-border">
        <H2>{form.title}</H2>
        <P>{form.description}</P>
        <P className="mt-4 font-medium">{session.user?.name}</P>{" "}
        <Link
          className="hover:cursor-pointer text-info-500 hover:text-info-700 transition-all"
          href={"/api/auth/signout?callbackUrl=/form/" + id}
        >
          Ganti akun
        </Link>
        <P className="text-red-500 text-sm mt-4">
          * Menunjukkan pertanyaan yang wajib diisi
        </P>
        <P className="text-sm mt-2">
          Saat ini Anda sedang mengedit jawaban yang sudah dikirim pada{" "}
          <strong>
            {stringifyCompleteDate(submission.updated_at).replace(
              /at/,
              "pukul",
            )}
          </strong>
          .
        </P>
      </div>
      <Form
        form={form}
        a={session.user?.id as string}
        b={id}
        answers={transformToArrayCheckbox(submission.fields)}
        submission_id={id_submission}
      />
    </div>
  );
};

export default page;
