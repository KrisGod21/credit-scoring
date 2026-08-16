"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { PassportDimensions } from "@/lib/underwriting/types";

const LABELS: Record<keyof PassportDimensions, string> = {
  financialReliability: "Reliability",
  incomeStability: "Income Stability",
  repaymentCapacity: "Repayment Capacity",
  debtBurden: "Low Debt Burden",
  incomeResilience: "Resilience",
  dataConfidence: "Data Confidence",
};

export function PassportRadar({ dimensions }: { dimensions: PassportDimensions }) {
  const data = (Object.keys(LABELS) as (keyof PassportDimensions)[]).map((key) => ({
    dimension: LABELS[key],
    value: dimensions[key],
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--hairline)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontFamily: "var(--font-sans)", fontSize: 11, fill: "var(--foreground)" }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="var(--primary)"
            fill="var(--credit)"
            fillOpacity={0.32}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
