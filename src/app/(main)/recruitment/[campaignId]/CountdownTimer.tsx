"use client";

import React, { useEffect, useState } from "react";

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft(null);
        window.location.reload(); // Refresh to see the result!
        return;
      }
      
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-2 text-center">
      <div className="bg-neutral-800 text-white rounded p-2 min-w-[50px]">
        <div className="text-xl font-bold">{timeLeft.d}</div>
        <div className="text-xs">Hari</div>
      </div>
      <div className="bg-neutral-800 text-white rounded p-2 min-w-[50px]">
        <div className="text-xl font-bold">{timeLeft.h}</div>
        <div className="text-xs">Jam</div>
      </div>
      <div className="bg-neutral-800 text-white rounded p-2 min-w-[50px]">
        <div className="text-xl font-bold">{timeLeft.m}</div>
        <div className="text-xs">Menit</div>
      </div>
      <div className="bg-neutral-800 text-white rounded p-2 min-w-[50px]">
        <div className="text-xl font-bold">{timeLeft.s}</div>
        <div className="text-xs">Detik</div>
      </div>
    </div>
  );
}
