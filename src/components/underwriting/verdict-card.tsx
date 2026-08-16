"use client";

import { cn } from "@/lib/utils";
import { RiskGauge } from "./risk-gauge";
import { CountUp } from "./count-up";
import type { UnderwritingResult } from "@/lib/underwriting/types";

const VERDICT_STYLE: Record<UnderwritingResult["verdict"], { label: string; className: string }> = {
  APPROVED: { label: "Approved", className: "bg-credit/10 text-credit border-credit/40 ring-1 ring-credit/40" },
  PARTIAL: { label: "Partially approved", className: "bg-signal/10 text-signal border-signal/40 ring-1 ring-signal/40" },
  NOT_READY: { label: "Not yet ready", className: "bg-debit/10 text-debit border-debit/40 ring-1 ring-debit/40" },
};

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function VerdictCard({ result }: { result: UnderwritingResult }) {
  const verdict = VERDICT_STYLE[result.verdict];

  return (
    <div className="surface grid grid-cols-1 gap-6 rounded-2xl p-6 sm:grid-cols-[auto_1fr] sm:items-center">
      <RiskGauge
        value={Math.round(result.probabilityGood * 100)}
        tier={result.riskTier}
        size={140}
        strokeWidth={11}
        label={result.riskTier}
        sublabel={`${Math.round(result.probabilityGood * 100)}% confidence`}
        className="mx-auto sm:mx-0"
      />

      <div className="space-y-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider",
            verdict.className
          )}
        >
          {verdict.label}
        </span>
        <p className="text-sm text-muted-foreground">
          Requested <strong className="text-foreground">{inr(result.requestedAmount)}</strong> over{" "}
          {result.tenureMonths} months (implied EMI {inr(result.impliedEmi)}/mo).
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Repayment capacity" value={result.repaymentCapacityMonthly} suffix="/mo" />
          <MetricRange label="Recommended range" min={result.recommendedCreditMin} max={result.recommendedCreditMax} />
          <Metric label="Data confidence" value={Math.round(result.dataConfidence * 100)} suffix="%" noPrefix />
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  suffix = "",
  noPrefix = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  noPrefix?: boolean;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-accent px-3 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-primary">
        <CountUp value={value} prefix={noPrefix ? "" : "₹"} suffix={suffix} />
      </p>
    </div>
  );
}

function MetricRange({ label, min, max }: { label: string; min: number; max: number }) {
  return (
    <div className="rounded-xl border border-hairline bg-accent px-3 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-primary">
        <CountUp value={min} prefix="₹" />
        {"–"}
        <CountUp value={max} prefix="₹" />
      </p>
    </div>
  );
}
