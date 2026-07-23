import React from "react";
import prisma from "@/lib/prisma";
import CampaignList from "./CampaignList";
import { auth } from "@/lib/auth";
import { syncCampaignActiveStates } from "@/actions/recruitment";
import { H2, P } from "@/app/_components/global/Text";

export const metadata = {
  title: "Open Recruitment | Moklet",
  description: "Daftar Organisasi dan Sub-Organisasi SMK Telkom Malang",
};

export default async function RecruitmentPage() {
  const session = await auth();
  
  await syncCampaignActiveStates();

  const campaigns = await prisma.recruitment_Campaign.findMany({
      where: { is_active: true },
      include: {
        organisasi: true,
        applicants: {
          where: { user_id: session?.user?.id || 'none' }
        }
      },
      orderBy: { close_date: "asc" }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <H2>Open Recruitment</H2>
        <P className="mt-2">Daftar ke organisasi dan sub-organisasi pilihanmu.</P>
      </div>
      <CampaignList campaigns={campaigns} userId={session?.user?.id} />
    </div>
  );
}
