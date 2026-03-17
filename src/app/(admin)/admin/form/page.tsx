import LinkButton from "@/app/_components/global/Button";
import { H2, P } from "@/app/_components/global/Text";
import { auth } from "@/lib/auth";
import { findFormsWithUser } from "@/utils/database/form.query";

import Table from "./_components/Table";

export default async function Forms() {
  const session = await auth();
  const { user } = session!;

  const forms = await findFormsWithUser({
    user_id: user?.role == "SuperAdmin" ? undefined : user?.id,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <H2 className="font-semibold">Formulir </H2>
          <P>Easily create online surveys, forms, quizzes </P>
        </div>
        <LinkButton variant={"primary"} href="/admin/form/new">
          <div className="flex items-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12H18"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 18V6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Create Form
          </div>
        </LinkButton>
      </div>
      <Table data={forms} />
    </>
  );
}
