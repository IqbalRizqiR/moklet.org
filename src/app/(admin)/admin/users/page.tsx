import React from "react";

import { H2, P } from "@/app/_components/global/Text";
import { UserWithLastlog } from "@/types/entityRelations";
import { findAllUsers } from "@/utils/database/user.query";

import AddUser from "./_components/AddUser";
import UserTable from "./_components/Table";
import { auth } from "@/lib/auth";

export default async function UsersPage() {
  const session = await auth();
  const { user } = session!;

  const users: UserWithLastlog[] = await findAllUsers({
    AND: [
      { NOT: { role: "Guest" } },
      { role: user?.role === "SuperAdmin" ? undefined : user?.role },
    ],
  });
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <H2 className="font-semibold">User Managements</H2>
          <P>Change roles and permisson </P>
        </div>
        <AddUser session={session} />
      </div>
      <UserTable data={users} session={session} />
    </>
  );
}
