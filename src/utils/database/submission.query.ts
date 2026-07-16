import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

export const findSubmissions = async (filter?: Prisma.SubmissionWhereInput) => {
  return await prisma.submission.findMany({ where: filter });
};

export const findSubmission = async (filter: Prisma.SubmissionWhereInput) => {
  return await prisma.submission.findFirst({
    where: filter,
    include: { fields: true, user: true },
  });
};

export const findSubmissionWithForm = async (
  filter: Prisma.SubmissionWhereInput,
) => {
  return await prisma.submission.findFirst({
    where: filter,
    include: {
      fields: true,
      form: {
        include: {
          fields: {
            include: { options: true },
            orderBy: { fieldNumber: "asc" },
          },
          sections: { orderBy: { order: "asc" } },
          _count: { select: { submissions: true } },
        },
      },
    },
  });
};

export const createSubmission = async (
  data: Prisma.SubmissionUncheckedCreateInput,
) => {
  return await prisma.submission.create({ data });
};

export const updateSubmission = async (
  where: Prisma.SubmissionWhereUniqueInput,
  update: Prisma.SubmissionUncheckedUpdateInput,
) => {
  return await prisma.submission.update({ where, data: update });
};

export const deleteSubmissionField = async (submission_id: string) => {
  return await prisma.submission_Field.deleteMany({ where: { submission_id } });
};

export const deleteSubmission = async (form_id: string) => {
  return await prisma.submission.delete({ where: { id: form_id } });
};
