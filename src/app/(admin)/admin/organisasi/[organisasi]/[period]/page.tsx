import { Organisasi_Type } from "@prisma/client";

import { findOrganisasi } from "@/utils/database/organisasi.query";
import {
  findAllPeriodsWithOrganisasi,
  findPeriod,
} from "@/utils/database/periodYear.query";
import { notFound } from "next/navigation";
import { H2, P } from "@/app/_components/global/Text";
import Form from "../../_components/Form";
import { auth } from "@/lib/auth";
import Select from "../../_components/Select";
import { canEditOrgInfo } from "@/utils/permissions";

export default async function Edit({
  params,
}: {
  params: Promise<{ organisasi: Organisasi_Type; period: string }>;
}) {
  const { organisasi, period } = await params;

  const session = await auth();
  const { user } = session!;

  if (!Object.values(Organisasi_Type).includes(organisasi)) return notFound();

  const periode = await findPeriod({ period });
  if (!periode) return notFound();

  const allPeriod = await findAllPeriodsWithOrganisasi();
  allPeriod.sort((a: any, b: any) => {
    return parseInt(b.period.split("-")[0]) - parseInt(a.period.split("-")[0]);
  });
  const notFoundPeriod = allPeriod.filter(
    (item: any) =>
      item.organisasis.findIndex((org: any) => org.organisasi == organisasi) == -1,
  );

  let organization = await findOrganisasi({
    organisasi_period_id: {
      period_id: periode.id,
      organisasi: organisasi.toLocaleUpperCase() as Organisasi_Type,
    },
  });

  if (!organization) {
    const findNewest = allPeriod.find((item: any) =>
      item.organisasis.find((org: any) => org.organisasi == organisasi),
    );
    if (findNewest?.organisasis[0]) {
      organization = await findOrganisasi({ id: findNewest.organisasis[0].id });
      organization!.id = "";
    } else
      organization = {
        companion: "",
        contact: "",
        description: "",
        id: "",
        image:
          "https://res.cloudinary.com/mokletorg/image/upload/v1720188074/assets/image_placeholder.png",
        image_description: "",
        is_suborgan: true,
        logo: "",
        mission: "",
        organisasi,
        organisasi_name: "",
        period_id: periode.id,
        structure: "",
        wa_notify_phone: null,
        created_at: new Date(),
        updated_at: new Date(),
        vision: "",
      };
  }

  let isReadOnly = true;
  if (user.role === "SuperAdmin" || user.role === "Admin") {
    isReadOnly = false;
  } else if (organization?.id) {
    const hasAccess = await canEditOrgInfo(user.id, organization.id);
    if (hasAccess) isReadOnly = false;
  }

  return (
    <>
      <div>
        <H2 className="font-semibold">Organization Information</H2>
        <P>Introduce your organization&apos;s profile to the world!</P>
      </div>
      {notFoundPeriod.length != 0 && (
        <div
          className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold block">Data tidak ditemukan!</strong>
          <span className="block sm:inline">
            Anda belum memperbarui informasi {organisasi} pada Masa Bakti{" "}
            {notFoundPeriod
              .map((item: any) => item.period.replace(/-/, "/"))
              .join(", ")}
            .
          </span>
        </div>
      )}
      <Select
        allPeriod={allPeriod}
        organisasi={organisasi}
        period={period}
        user={user}
      />
      <Form
        organisasi={organization!}
        period={period}
        organisasiType={organisasi}
        currentPeriod={period}
        isReadOnly={isReadOnly}
      />
    </>
  );
}
