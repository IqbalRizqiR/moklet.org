import { findLatestPeriod } from "@/utils/database/periodYear.query";
import { redirect } from "next/navigation";

export default async function Edit({
  params,
}: {
  params: Promise<{ organisasi: string }>;
}) {
  const { organisasi } = await params;
  const latestPeriod = await findLatestPeriod();
  if (latestPeriod)
    return redirect(
      `/admin/organisasi/${organisasi}/${latestPeriod.period}`,
    );

  return <></>;
}
