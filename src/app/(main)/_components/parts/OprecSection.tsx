import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { SectionWrapper } from "@/app/_components/global/Wrapper";
import { H2, P } from "@/app/_components/global/Text";
import LinkButton from "@/app/_components/global/Button";
import CountdownTimer from "@/app/_components/global/CountdownTimer";

export default async function OprecSection() {
  const now = new Date();

  const campaigns = await prisma.recruitment_Campaign.findMany({
    where: { is_active: true },
    include: { organisasi: true },
    orderBy: { close_date: "asc" },
    take: 4,
  });

  const activeCampaigns = campaigns.filter((c) => {
    const isOpen = !c.open_date || c.open_date <= now;
    const notClosed = !c.close_date || c.close_date > now;
    return isOpen && notClosed;
  });

  if (activeCampaigns.length === 0) return null;

  const displayCampaigns = activeCampaigns.slice(0, 3);
  const hasMore = activeCampaigns.length > 3;

  return (
    <SectionWrapper id="open-recruitment" className="bg-surface-50">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <H2>Open Recruitment</H2>
            <P className="mt-2">Daftar ke organisasi dan sub-organisasi pilihanmu</P>
          </div>
          {hasMore && (
            <Link
              href="/recruitment"
              className="text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors"
            >
              Lihat Semua →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCampaigns.map((campaign) => {
            const closeDate = campaign.close_date ? new Date(campaign.close_date) : null;
            
            return (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3 mb-4">
                  {campaign.organisasi.logo && (
                    <img
                      src={campaign.organisasi.logo}
                      alt={campaign.organisasi.organisasi_name || campaign.organisasi.organisasi}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-black leading-tight">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {campaign.organisasi.organisasi_name || campaign.organisasi.organisasi}
                    </p>
                  </div>
                </div>

                {closeDate && (
                  <div className="mb-4 rounded-lg bg-amber-50 border border-amber-100 p-3">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                      Pendaftaran ditutup dalam
                    </p>
                    <div className="text-amber-800 text-sm font-medium">
                      <CountdownTimer targetDate={closeDate.toISOString()} compact onExpire="reload" />
                    </div>
                  </div>
                )}

                <LinkButton
                  href="/recruitment"
                  variant="primary"
                  className="mt-auto w-full"
                >
                  Daftar Sekarang
                </LinkButton>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
