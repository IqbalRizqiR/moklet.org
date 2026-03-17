import dynamic from "next/dynamic";
import React from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

interface ChartProps {
  data: { value: number; name: string }[];
}

export function PieChart({ data }: ChartProps) {
  return (
    <ReactECharts
      option={{
        tooltip: { trigger: "item" },
        series: [
          {
            type: "pie",
            radius: "50%",
            data: data.map((item) => ({
              ...item,
              itemStyle: { color: getRandomColor() },
            })),
          },
        ],
      }}
    />
  );
}

export function BarChart({ data }: ChartProps) {
  return (
    <ReactECharts
      option={{
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        xAxis: {
          type: "category",
          data: data.map((item) => item.name),
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: data.map((item) => ({
              value: item.value,
              itemStyle: { color: getRandomColor() },
            })),
            type: "bar",
          },
        ],
      }}
    />
  );
}
