"use client";

import React, { useEffect, useRef, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean;
  onExpire?: "reload" | "hide";
}

export default function CountdownTimer({
  targetDate,
  compact = false,
  onExpire = "reload",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  // Guard: persist a flag across renders so we only reload once even if multiple
  // CountdownTimer instances on the same page hit zero concurrently (#review-18).
  const reloadedRef = useRef(false);

  useEffect(() => {
    // If already expired on mount, hide — do NOT reload (avoids infinite loop
    // when React re-renders stale campaign data).
    const target = new Date(targetDate).getTime();
    if (target - Date.now() <= 0) {
      setTimeLeft(null);
      return;
    }

    const tick = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        if (onExpire === "reload" && !reloadedRef.current) {
          reloadedRef.current = true;
          window.location.reload();
        }
        return false;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
      return true;
    };

    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
    // Intentionally only depend on targetDate string — omitting onExpire so
    // the interval doesn't tear down / restart on every render (the ref guard
    // is enough for the reload-once semantics).
  }, [targetDate]);

  if (!timeLeft) return null;

  if (compact) {
    return (
      <span className="font-mono font-semibold tabular-nums">
        {timeLeft.d > 0 && `${timeLeft.d}h `}
        {String(timeLeft.h).padStart(2, "0")}:{String(timeLeft.m).padStart(2, "0")}:{String(timeLeft.s).padStart(2, "0")}
      </span>
    );
  }

  const units = [
    { value: timeLeft.d, label: "Hari" },
    { value: timeLeft.h, label: "Jam" },
    { value: timeLeft.m, label: "Menit" },
    { value: timeLeft.s, label: "Detik" },
  ];

  return (
    <div className="flex gap-2 text-center">
      {units.map((u) => (
        <div key={u.label} className="bg-neutral-800 text-white rounded p-2 min-w-[50px]">
          <div className="text-xl font-bold tabular-nums">{u.value}</div>
          <div className="text-xs">{u.label}</div>
        </div>
      ))}
    </div>
  );
}
