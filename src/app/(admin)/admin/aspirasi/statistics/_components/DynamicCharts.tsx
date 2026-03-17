"use client";

import dynamic from "next/dynamic";

const ChartLoading = () => <div className="h-[320px] bg-gray-100 rounded-lg animate-pulse" />;

export const MonthlyTrendChart = dynamic(() => import("./MonthlyTrendChart"), {
  ssr: false,
  loading: ChartLoading,
});

export const StatisticsDistributionChart = dynamic(() => import("./StatisticsDistributionChart"), {
  ssr: false,
  loading: ChartLoading,
});
