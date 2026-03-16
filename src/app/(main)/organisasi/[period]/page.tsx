import { notFound } from "next/navigation";
import Organizations from "./_components/Parts/Organizations";

import { findOrganisasis } from "@/utils/database/organisasi.query";
import { findPeriod } from "@/utils/database/periodYear.query";

export default async function OrganisasiByPeriod({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;
  const periodData = await findPeriod({ period });
  if (!periodData) return notFound();

  const organisasis = await findOrganisasis({ period_id: periodData.id });

  return <Organizations period={periodData.period} data={organisasis} />;
}
