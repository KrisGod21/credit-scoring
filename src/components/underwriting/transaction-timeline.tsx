"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TransactionMonth } from "@/lib/underwriting/types";

const axisTick = { fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--muted-foreground)" };

export function TransactionTimeline({ months }: { months: TransactionMonth[] }) {
  const data = months.map((m) => ({
    label: m.label.split(" ")[0],
    income: m.income,
    expenses: -m.expenses,
    surplus: m.income - m.expenses,
    anomalous: m.isAnomalous,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--hairline)" />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--hairline)" }} />
          <YAxis
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `₹${Math.round(Math.abs(v) / 1000)}k`}
          />
          <Tooltip
            formatter={(value, name) => [`₹${Math.abs(Number(value)).toLocaleString("en-IN")}`, name]}
            labelStyle={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--hairline)",
              borderRadius: 4,
              fontFamily: "var(--font-sans)",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
          <Bar dataKey="income" name="Income" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.anomalous ? "var(--signal)" : "var(--credit)"} />
            ))}
          </Bar>
          <Bar dataKey="expenses" name="Expenses" fill="var(--debit)" fillOpacity={0.55} radius={[0, 0, 2, 2]} />
          <Line
            type="monotone"
            dataKey="surplus"
            name="Surplus"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
        Gold bars mark months flagged as unusual (excluded from the seasonality read).
      </p>
    </div>
  );
}
