"use client";

import { SelectField } from "@/app/_components/global/Input";
import { Organisasi_Type, Period_Year } from "@prisma/client";
import { Session } from "next-auth";
import { useRouter } from "next-nprogress-bar";

export default function Select({
  organisasi,
  user,
  period,
  allPeriod,
}: {
  organisasi?: string;
  user?: Session["user"];
  period?: string;
  allPeriod: Period_Year[];
}) {
  const router = useRouter();

  return (
    <div className="flex gap-2 my-4">
      <SelectField
        name="organisasi"
        value={organisasi}
        disabled={!user?.role.includes("Admin")}
        handleChange={(e) =>
          router.push(
            `/admin/organisasi/${e.target.value}${period ? "/" + period : ""}`,
          )
        }
        options={Object.values(Organisasi_Type).map((item) => ({
          label: item,
          value: item,
        }))}
      ></SelectField>
      <SelectField
        name="period"
        value={period}
        disabled={!user?.role.includes("Admin")}
        handleChange={(e) =>
          router.push(
            `/admin/organisasi/${organisasi || "OSIS"}/${e.target.value}`,
          )
        }
        options={allPeriod.map((item) => ({
          label: item.period?.replace(/-/, "/"),
          value: item.period,
        }))}
      ></SelectField>
    </div>
  );
}
