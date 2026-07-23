"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { H3, P } from "@/app/_components/global/Text";
import { Button } from "@/app/_components/global/Button";
import { auth } from "@/lib/auth";

interface Campaign {
  id: string;
  title: string;
  description: string | null;
}

interface Props {
  campaigns: Campaign[];
  orgName: string;
  applicantStatus?: "WAITING_ANNOUNCEMENT" | "REJECTED_STEP" | "REJECTED_FINAL" | "ACCEPTED_FINAL" | "PENDING_FINAL";
  stepName?: string;
  announcementDate?: Date;
  passedStepName?: string;
}

export default function RecruitmentBanner({ campaigns, orgName, applicantStatus, stepName, announcementDate, passedStepName }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const session = auth();
  useEffect(() => {
    if (applicantStatus !== "WAITING_ANNOUNCEMENT" || !announcementDate) return;

    const targetTime = new Date(announcementDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        window.location.reload();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [applicantStatus, announcementDate]);

  if (!campaigns || campaigns.length === 0) return null;
  const campaign = campaigns[0];

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 md:p-14 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Decorative background shapes */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-white rounded-full blur-3xl opacity-10 pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white rounded-full blur-3xl opacity-10 pointer-events-none"></div>

        <div className="relative z-10 max-w-xl text-white">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-white/30">
            {applicantStatus ? "Status Pendaftaran" : "Sedang Berlangsung"}
          </span>
          <h3 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight">
            {applicantStatus ? `Pendaftaran ${orgName}` : `Open Recruitment ${orgName}`}
          </h3>
          
          {passedStepName && applicantStatus === "WAITING_ANNOUNCEMENT" && (
            <div className="mt-4 inline-block bg-green-500/20 border border-green-400/50 rounded-lg px-4 py-2">
              <span className="text-green-100 font-medium">Selamat! Anda lolos pada tahap {passedStepName}.</span>
            </div>
          )}

          <p className="text-primary-50 mt-4 text-lg">
            {applicantStatus === "WAITING_ANNOUNCEMENT" ? `Pengumuman untuk tahap ${stepName} sedang diproses. Mohon tunggu informasi selanjutnya.` :
             applicantStatus === "REJECTED_STEP" ? `Mohon maaf, Anda tidak lolos pada tahap ${stepName}. Jangan patah semangat!` :
             applicantStatus === "REJECTED_FINAL" ? `Mohon maaf, Anda dinyatakan belum lolos pada rekrutmen kali ini.` :
             applicantStatus === "ACCEPTED_FINAL" ? `Selamat! Anda telah resmi diterima. Silakan tunggu informasi dari pengurus.` :
             applicantStatus === "PENDING_FINAL" ? `Anda telah melewati seluruh tahapan. Keputusan akhir sedang diproses.` :
             (campaign.description ? campaign.description : `Mari bergabung bersama kami dan jadilah bagian dari perjalanan luar biasa ${orgName}.`)}
          </p>
        </div>

        <div className="relative z-10 shrink-0 w-full md:w-auto">
          {!applicantStatus ? (
            <Link href={!session ? "/api/auth/signin?callbackUrl=/recruitment/" + campaign.id : `/recruitment/${campaign.id}`} className="w-full md:w-auto">
              <Button variant="secondary" className="w-full md:w-auto text-lg font-bold px-10 py-4 shadow-xl hover:scale-105 transition-transform">
                Daftar Sekarang
              </Button>
            </Link>
          ) : applicantStatus === "WAITING_ANNOUNCEMENT" && timeLeft ? (
            <div className="flex justify-center gap-2 md:gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="flex flex-col items-center min-w-[60px] md:min-w-[80px]">
                <span className="text-3xl font-bold text-white">{timeLeft.days}</span>
                <span className="text-xs font-medium text-white/80 uppercase tracking-wider mt-1">Hari</span>
              </div>
              <div className="flex flex-col items-center min-w-[60px] md:min-w-[80px]">
                <span className="text-3xl font-bold text-white">{timeLeft.hours}</span>
                <span className="text-xs font-medium text-white/80 uppercase tracking-wider mt-1">Jam</span>
              </div>
              <div className="flex flex-col items-center min-w-[60px] md:min-w-[80px]">
                <span className="text-3xl font-bold text-white">{timeLeft.minutes}</span>
                <span className="text-xs font-medium text-white/80 uppercase tracking-wider mt-1">Menit</span>
              </div>
              <div className="flex flex-col items-center min-w-[60px] md:min-w-[80px]">
                <span className="text-3xl font-bold text-white">{timeLeft.seconds}</span>
                <span className="text-xs font-medium text-white/80 uppercase tracking-wider mt-1">Detik</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
