import { H2, P } from "@/app/_components/global/Text";
import { auth } from "@/lib/auth";
import {
  findAllPeriods,
  findLatestPeriod,
} from "@/utils/database/periodYear.query";
import { redirect } from "next/navigation";
import Select from "./_components/Select";

export default async function SuborAdmin() {
  const session = await auth();
  const latestPeriod = await findLatestPeriod();
  const allPeriod = await findAllPeriods();

  const { user } = session!;

  if (!user?.role.includes("Admin"))
    return redirect(
      `/admin/organisasi/${user?.role || ""}/${latestPeriod.period}`,
    );

  return (
    <>
      <div>
        <H2 className="font-semibold">Organization Information</H2>
        <P>Introduce your organization&apos;s profile to the world!</P>
      </div>
      <div className="flex items-center justify-between my-4">
        <Select allPeriod={allPeriod} user={user} />
      </div>
    </>
  );
}
