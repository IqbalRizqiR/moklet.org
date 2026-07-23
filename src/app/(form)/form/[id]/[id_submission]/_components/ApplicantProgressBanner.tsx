"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { H3, P } from "@/app/_components/global/Text";

interface ApplicantProgressBannerProps {
  status: "WAITING_ANNOUNCEMENT" | "REJECTED_STEP" | "REJECTED_FINAL" | "ACCEPTED_FINAL" | "PENDING_FINAL";
  stepName?: string;
  announcementDate?: Date;
  passedStepName?: string;
}

export default function ApplicantProgressBanner({ status, stepName, announcementDate, passedStepName }: ApplicantProgressBannerProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    if (status !== "WAITING_ANNOUNCEMENT" || !announcementDate) return;

    const targetTime = new Date(announcementDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        router.refresh();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    updateTimer(); // Initial call
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [status, announcementDate]);

  if (status === "REJECTED_STEP" || status === "REJECTED_FINAL") {
    return (
      <div className="mx-auto max-w-[90vw] w-[640px] bg-red-50 border border-red-200 rounded-md p-6 mb-6 text-center">
        <H3 className="text-red-700 mb-2">Mohon Maaf</H3>
        <P className="text-red-600">
          {status === "REJECTED_STEP" 
            ? `Anda dinyatakan tidak lolos pada tahap ${stepName}. Jangan menyerah dan tetap semangat!` 
            : "Anda dinyatakan belum lolos pada rekrutmen kali ini. Terima kasih atas partisipasi Anda!"}
        </P>
      </div>
    );
  }

  if (status === "ACCEPTED_FINAL") {
    return (
      <div className="mx-auto max-w-[90vw] w-[640px] bg-green-50 border border-green-200 rounded-md p-6 mb-6 text-center">
        <H3 className="text-green-700 mb-2">Selamat!</H3>
        <P className="text-green-600">Anda telah resmi diterima. Silakan tunggu informasi selanjutnya dari pengurus.</P>
      </div>
    );
  }

  if (status === "PENDING_FINAL") {
    return (
      <div className="mx-auto max-w-[90vw] w-[640px] bg-blue-50 border border-blue-200 rounded-md p-6 mb-6 text-center">
        <H3 className="text-blue-700 mb-2">Menunggu Keputusan Akhir</H3>
        <P className="text-blue-600">Anda telah melewati seluruh tahapan. Keputusan akhir sedang diproses oleh pengurus.</P>
      </div>
    );
  }

  if (status === "WAITING_ANNOUNCEMENT" && timeLeft) {
    return (
      <div className="mx-auto max-w-[90vw] w-[640px] bg-indigo-50 border border-indigo-200 rounded-md p-6 mb-6 text-center shadow-sm">
        {passedStepName && (
          <div className="mb-4 pb-4 border-b border-indigo-100">
            <H3 className="text-green-700 mb-1">Selamat!</H3>
            <P className="text-green-600 font-medium">Anda lolos pada tahap {passedStepName}.</P>
          </div>
        )}
        
        <H3 className="text-indigo-800 mb-2">Pengumuman: {stepName}</H3>
        <P className="text-indigo-600 mb-6">Hasil seleksi tahap ini akan diumumkan dalam:</P>
        
        <div className="flex justify-center gap-4">
          <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border border-indigo-100 min-w-[80px]">
            <span className="text-3xl font-bold text-indigo-700">{timeLeft.days}</span>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mt-1">Hari</span>
          </div>
          <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border border-indigo-100 min-w-[80px]">
            <span className="text-3xl font-bold text-indigo-700">{timeLeft.hours}</span>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mt-1">Jam</span>
          </div>
          <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border border-indigo-100 min-w-[80px]">
            <span className="text-3xl font-bold text-indigo-700">{timeLeft.minutes}</span>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mt-1">Menit</span>
          </div>
          <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border border-indigo-100 min-w-[80px]">
            <span className="text-3xl font-bold text-indigo-700">{timeLeft.seconds}</span>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mt-1">Detik</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
