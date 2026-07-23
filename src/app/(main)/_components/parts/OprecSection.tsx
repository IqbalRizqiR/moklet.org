import LinkButton from "@/app/_components/global/Button";
import { P } from "@/app/_components/global/Text";
import { SectionWrapper } from "@/app/_components/global/Wrapper";
import { syncCampaignActiveStates } from "@/utils/database/recruitment.query";
import prisma from "@/lib/prisma";
import Link from "next/link";
import CampaignCard from "./CampaignCard";

export default async function OprecSection() {
  await syncCampaignActiveStates();

  const campaigns = await prisma.recruitment_Campaign.findMany({
    where: { is_active: true },
    include: { organisasi: true },
    orderBy: { close_date: "asc" },
    take: 4,
  });

  if (campaigns.length === 0) return null;

  const display = campaigns.slice(0, 3);
  const hasMore = campaigns.length > 3;

  return (
    <SectionWrapper id="open-recruitment" className="bg-surface-50">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-[24px] md:text-4xl font-bold leading-[130%] text-black">
              Open Recruitment
            </h2>
            <P className="mt-2">
              Daftar ke organisasi dan sub-organisasi pilihanmu
            </P>
          </div>
          {hasMore && (
            <Link
              href="/recruitment"
              className="hidden md:inline-flex text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors shrink-0"
            >
              Lihat Semua &rarr;
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {display.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              id={campaign.id}
              title={campaign.title}
              orgName={
                campaign.organisasi.organisasi_name ||
                campaign.organisasi.organisasi
              }
              orgLogo={campaign.organisasi.logo}
              closeDate={campaign.close_date.toISOString()}
            />
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 text-center md:hidden">
            <LinkButton href="/recruitment" variant="secondary">
              Lihat Semua Campaign
            </LinkButton>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
