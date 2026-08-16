import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { CashflowProfile } from "@/lib/underwriting/types";

const pct = (v: number) => `${Math.round(v * 100)}%`;

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-sm border border-hairline bg-card px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function TrendIcon({ trend }: { trend: CashflowProfile["incomeTrend"] }) {
  if (trend === "rising") return <TrendingUp className="inline h-4 w-4 text-credit" />;
  if (trend === "falling") return <TrendingDown className="inline h-4 w-4 text-debit" />;
  return <Minus className="inline h-4 w-4 text-muted-foreground" />;
}

export function CashflowStatsGrid({ cashflow }: { cashflow: CashflowProfile }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard label="Median monthly income" value={`₹${cashflow.medianMonthlyIncome.toLocaleString("en-IN")}`} />
      <StatCard
        label="Income trend"
        value={
          <>
            <TrendIcon trend={cashflow.incomeTrend} /> {cashflow.incomeTrend}
          </>
        }
        sub={`${cashflow.incomeTrendPctPerMonth >= 0 ? "+" : ""}${(cashflow.incomeTrendPctPerMonth * 100).toFixed(1)}%/mo`}
      />
      <StatCard label="Income volatility" value={pct(cashflow.incomeVolatility)} sub="coefficient of variation" />
      <StatCard
        label="Monthly surplus"
        value={`₹${cashflow.monthlySurplus.toLocaleString("en-IN")}`}
        sub="income minus expenses"
      />
      <StatCard label="Essential expense ratio" value={pct(cashflow.essentialExpenseRatio)} />
      <StatCard label="Debt-to-income" value={pct(cashflow.debtToIncomeRatio)} />
      <StatCard label="Savings consistency" value={pct(cashflow.savingsConsistency)} sub="months with positive savings" />
      <StatCard label="Bill payment discipline" value={pct(cashflow.recurringPaymentDiscipline)} />
      <StatCard
        label="Income sources"
        value={cashflow.numIncomeSources}
        sub={`${pct(cashflow.incomeConcentration)} from top source`}
      />
      <StatCard label="Active earning months" value={`${cashflow.activeEarningMonths} / 12`} />
      <StatCard label="Work continuity" value={pct(cashflow.workContinuity)} />
      <StatCard
        label="Income pattern"
        value={cashflow.seasonalityDetected ? "Seasonal" : "Steady"}
        sub={cashflow.seasonalityDetected ? cashflow.seasonalityNote : "No repeating pattern detected"}
      />
    </div>
  );
}
