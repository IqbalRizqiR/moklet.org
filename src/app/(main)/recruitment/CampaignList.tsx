"use client";

import React from "react";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import CountdownTimer from "@/app/_components/global/CountdownTimer";

type CampaignWithRelations = Prisma.Recruitment_CampaignGetPayload<{
  include: {
    organisasi: true;
    applicants: true;
  };
}>;

interface CampaignListProps {
  campaigns: CampaignWithRelations[];
  userId?: string;
}

export default function CampaignList({ campaigns, userId }: CampaignListProps) {
  const now = new Date();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => {
          const hasApplied = campaign.applicants?.some((a) => a.user_id === userId);
          const openDate = campaign.open_date ? new Date(campaign.open_date) : null;
          const closeDate = campaign.close_date ? new Date(campaign.close_date) : null;

          const notYetOpen = openDate && openDate > now;
          const isClosed = closeDate && closeDate < now;
          const isOpen = !notYetOpen && !isClosed;

          const orgName = campaign.organisasi.organisasi_name || campaign.organisasi.organisasi;
          const truncatedDescription = campaign.description 
            ? campaign.description.length > 120 
              ? campaign.description.slice(0, 120) + "..." 
              : campaign.description
            : null;

          return (
            <div key={campaign.id} className="border border-neutral-200 p-6 rounded-xl shadow-sm bg-white flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                {campaign.organisasi.logo && (
                  <img
                    src={campaign.organisasi.logo}
                    alt={orgName}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-black leading-tight">{campaign.title}</h2>
                  <p className="text-neutral-600 text-sm mt-1">{orgName}</p>
                </div>
              </div>

              {truncatedDescription && (
                <p className="text-sm text-neutral-500 mb-4 flex-1">{truncatedDescription}</p>
              )}

              <div className="text-xs text-neutral-500 mb-4 space-y-1">
                {openDate && (
                  <p>
                    <span className="font-semibold">Dibuka:</span> {openDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
                {closeDate && (
                  <p>
                    <span className="font-semibold">Ditutup:</span> {closeDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>

              {hasApplied && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                  <p className="text-sm font-semibold text-green-700">Sudah Mendaftar</p>
                </div>
              )}

              {!hasApplied && notYetOpen && openDate && (
                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 p-3">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Dibuka dalam</p>
                  <div className="text-blue-800 text-sm font-medium">
                    <CountdownTimer targetDate={openDate.toISOString()} compact onExpire="reload" />
                  </div>
                </div>
              )}

              {!hasApplied && isOpen && closeDate && (
                <div className="mb-4 rounded-lg bg-amber-50 border border-amber-100 p-3">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Pendaftaran ditutup dalam</p>
                  <div className="text-amber-800 text-sm font-medium">
                    <CountdownTimer targetDate={closeDate.toISOString()} compact onExpire="reload" />
                  </div>
                </div>
              )}

              {!hasApplied && isClosed && (
                <div className="mb-4 rounded-lg bg-neutral-100 border border-neutral-200 p-3 text-center">
                  <p className="text-sm font-semibold text-neutral-500">Pendaftaran Ditutup</p>
                </div>
              )}

              {hasApplied ? (
                <Link
                  href={`/recruitment/${campaign.id}`}
                  className="px-4 py-2 rounded-lg text-white font-medium bg-secondary-500 hover:bg-secondary-600 transition-colors text-center"
                >
                  Lihat Pengumuman
                </Link>
              ) : notYetOpen ? (
                <button
                  disabled
                  className="px-4 py-2 rounded-lg text-white font-medium bg-neutral-300 cursor-not-allowed"
                >
                  Belum Dibuka
                </button>
              ) : isClosed ? (
                <button
                  disabled
                  className="px-4 py-2 rounded-lg text-white font-medium bg-neutral-300 cursor-not-allowed"
                >
                  Ditutup
                </button>
              ) : (
                <Link
                  href={`/recruitment/${campaign.id}`}
                  className="px-4 py-2 rounded-lg text-white font-medium bg-primary-500 hover:bg-primary-600 transition-colors text-center"
                >
                  Daftar Sekarang
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
