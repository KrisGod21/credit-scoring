"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface Row {
  label: string;
  coefficient: number;
}

export function FeatureImportanceChart({ rows }: { rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => a.coefficient - b.coefficient);

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--hairline)" />
          <XAxis type="number" tick={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--muted-foreground)" }} />
          <YAxis
            type="category"
            dataKey="label"
            width={190}
            tick={{ fontFamily: "var(--font-sans)", fontSize: 12, fill: "var(--foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <Bar dataKey="coefficient" radius={2}>
            <LabelList
              dataKey="coefficient"
              position="right"
              formatter={(v) => Number(v).toFixed(2)}
              style={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            {sorted.map((row) => (
              <Cell key={row.label} fill={row.coefficient >= 0 ? "var(--credit)" : "var(--debit)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
