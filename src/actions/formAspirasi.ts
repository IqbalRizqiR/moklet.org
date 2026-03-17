"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  deleteForm,
  findAllForms,
  findForm,
} from "@/utils/database/form.query";
import {
  createSubmission,
  deleteSubmissionField,
  findSubmission,
  updateSubmission,
} from "@/utils/database/submission.query";

export const findFormById = async (form_id: string, active: boolean) => {
  const form = await findForm({ id: form_id, is_open: active });

  return form;
};

export const findFormByUserId = async (user_id: string) => {
  const forms = await findAllForms({ user_id });

  return forms;
};

export const deleteFormById = async (form_id: string) => {
  const form = await deleteForm(form_id);

  revalidatePath("/admin/form");
  return form;
};

export const submitForm = async (
  user_id: string,
  form_id: string,
  answers: Array<{ name: string; value: string }>,
  submission_id?: string,
) => {
  try {
    const form = await findForm({ id: form_id, is_open: true });
    if (submission_id) {
      const submission = await findSubmission({ id: submission_id });
      if (!submission) return { success: false, message: "Form not found" };
    }

    if (!form) return { success: false, message: "Form not found" };
    if (
      (form.open_at &&
        new Date(form.open_at).getTime() > new Date().getTime()) ||
      (form.close_at &&
        new Date(form.close_at).getTime() < new Date().getTime())
    )
      return { success: false, message: "Form closed" };

    if (form.submit_once && !submission_id) {
      const submission = await findSubmission({ user_id, form_id });
      if (submission && !form.allow_edit)
        return { success: false, message: "Already submit" };
    }

    answers = answers.filter((answer) => answer.value && answer.value !== "");

    const invalidAnswer = answers.find(
      (item) => !form.fields.find((i: any) => item.name == i.id.toString()),
    );

    if (invalidAnswer) return { success: false, message: "Invalid request" };

    for (const field of form.fields) {
      const qAnswer = answers.find((item) => item.name == field.id.toString());

      if (field.required && !qAnswer?.value)
        return { success: false, message: field.label + " is required." };

      if (
        qAnswer?.value &&
        (field.type === "radio" || field.type === "checkbox")
      ) {
        const invalidAnswer = !field.options.find(
          (i: any) => qAnswer.value == i.value,
        );

        if (invalidAnswer)
          return { success: false, message: "Invalid request" };
      }
    }

    const fields_create: Prisma.Submission_FieldUncheckedCreateWithoutSubmissionInput[] =
      answers.map((answer) => {
        return { field_id: parseInt(answer.name), value: answer.value };
      });

    if (submission_id) {
      await deleteSubmissionField(submission_id);
      const update = await updateSubmission(
        { id: submission_id },
        { fields: { create: fields_create }, updated_at: new Date() },
      );
      if (!update) return { success: false, message: "Internal Server Error" };

      return { submission_id: submission_id, success: true };
    }
    const submission = await createSubmission({
      user_id,
      form_id,
      fields: { create: fields_create },
    });

    return { submission_id: submission.id, success: true };
  } catch {
    return { success: false, message: "Internal Server Error" };
  }
};
