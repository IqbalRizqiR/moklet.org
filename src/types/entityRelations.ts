import { Prisma } from "@prisma/client";

export type PostWithTagsAndUser = Prisma.PostGetPayload<{
  include: {
    tags: true;
    user: { select: { name: true; user_pic: true; role: true } };
    organisasi: true;
  };
}>;

export type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    organisasi: true;
    user: { select: { name: true; user_pic: true; role: true } };
  };
}>;

export type FormWithFields = Prisma.FormGetPayload<{
  include: {
    fields: { include: { options: true } };
    _count: { select: { submissions: true } };
  };
}>;

export type FieldsWithOptions = Prisma.FieldGetPayload<{
  include: { options: true };
}>;

export type FormWithFieldsAndUser = Prisma.FormGetPayload<{
  include: {
    fields: { include: { options: true } };
    user: { select: { name: true } };
    _count: { select: { submissions: true } };
  };
}>;

export type SubmissionWithFormAndFields = Prisma.SubmissionGetPayload<{
  include: {
    fields: true;
    form: { include: { fields: { include: { options: true } } } };
  };
}>;

export type FormWithSubmissions = Prisma.FormGetPayload<{
  include: {
    submissions: {
      include: { user: true; fields: { include: { field: true } } };
    };
    fields: { include: { options: true } };
    user: true;
  };
}>;

export type SubmissionWithUserAndFields = Prisma.SubmissionGetPayload<{
  include: { user: true; fields: { include: { field: true } } };
}>;

export type LinkWithCountAndUser = Prisma.Link_ShortenerGetPayload<{
  include: {
    user: { select: { name: true } };
    count: { select: { click_count: true } };
  };
}>;

export type TagWithPostCount = Prisma.TagGetPayload<{
  include: {
    _count: {
      select: { posts: { where: { published: true } } };
    };
  };
}>;

export type UserWithLastlog = Prisma.UserGetPayload<{
  include: { userAuth: { select: { last_login: true } } };
}>;

export type OrganizationWithPeriod = Prisma.OrganisasiGetPayload<{
  include: { period: true };
}>;

export type PeriodWithOrganisasi = Prisma.Period_YearGetPayload<{
  include: { organisasis: { select: { organisasi: true; id: true } } };
}>;

export type TwibbonWithUser = Prisma.TwibbonGetPayload<{
  include: { user: true };
}>;

export type AspirationWithUser = Prisma.AspirasiGetPayload<{
  include: { user: true };
}>;

export type AspirationWithUserAndEvent = Prisma.AspirasiGetPayload<{
  include: { user: true; event: true };
}>;
