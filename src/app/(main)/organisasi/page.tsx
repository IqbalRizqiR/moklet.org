import Maintenance from "@/app/maintenance/page";
import { findOrganisasis } from "@/utils/database/organisasi.query";
import { findLatestPeriod } from "@/utils/database/periodYear.query";
import { redirect } from "next/navigation";

export default async function OrganisasiPage() {
  const [activePeriod, lastPeriod] = await Promise.all([
    findLatestPeriod(true),
    findLatestPeriod(false),
  ]);

  if (!activePeriod && !lastPeriod) return <Maintenance />;

  const currentPeriod = activePeriod ?? lastPeriod!;
  const organisasis = await findOrganisasis({ period_id: currentPeriod.id });
  return redirect(
    `/organisasi/${currentPeriod.period}`,
  );
}
