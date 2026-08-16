import { cn } from "@/lib/utils";
import { OccupationIcon } from "./occupation-icons";
import { SourceTag } from "./source-tag";
import type { FinancialPassport, RiskTier, UnderwritingVerdict } from "@/lib/underwriting/types";
import type { UnderwritingPersona } from "@/lib/underwriting/personas";

const RISK_STYLE: Record<RiskTier, string> = {
  LOW: "border-credit/40 bg-credit/10 text-credit",
  MODERATE: "border-signal/40 bg-signal/10 text-signal",
  HIGH: "border-debit/40 bg-debit/10 text-debit",
};

const VERDICT_STYLE: Record<UnderwritingVerdict, { label: string; className: string }> = {
  APPROVED: { label: "Approved", className: "border-credit/40 bg-credit/10 text-credit" },
  PARTIAL: { label: "Partial", className: "border-signal/40 bg-signal/10 text-signal" },
  NOT_READY: { label: "Not ready", className: "border-debit/40 bg-debit/10 text-debit" },
};

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function LenderApplicantCard({
  persona,
  passport,
}: {
  persona: UnderwritingPersona;
  passport: FinancialPassport;
}) {
  const { underwriting, cashflow, stressTests } = passport;
  const verdict = VERDICT_STYLE[underwriting.verdict];
  const safeCount = stressTests.filter((s) => s.verdict === "SAFE").length;
  const topPositive = passport.evidence.find((e) => e.impact === "positive");
  const topRisk = passport.evidence.find((e) => e.impact === "negative");

  return (
    <div className="surface rounded-xl px-5 py-4 transition-transform hover:-translate-y-0.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-dashed border-hairline bg-accent text-primary">
            <OccupationIcon occupation={persona.occupation} className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-base font-semibold leading-tight">{persona.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{persona.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider",
              RISK_STYLE[underwriting.riskTier]
            )}
          >
            {underwriting.riskTier} risk
          </span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider",
              verdict.className
            )}
          >
            {verdict.label}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Requested" value={inr(underwriting.requestedAmount)} />
        <Metric label="Recommended" value={`${inr(underwriting.recommendedCreditMin)}–${inr(underwriting.recommendedCreditMax)}`} />
        <Metric label="Capacity" value={`${inr(underwriting.repaymentCapacityMonthly)}/mo`} />
        <Metric label="Data confidence" value={`${Math.round(underwriting.dataConfidence * 100)}%`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        {topPositive && (
          <div className="flex items-center gap-1.5 text-credit">
            <span className="font-bold">+</span>
            <span className="truncate text-foreground">{topPositive.label}</span>
            <SourceTag source={topPositive.source} />
          </div>
        )}
        {topRisk && (
          <div className="flex items-center gap-1.5 text-debit">
            <span className="font-bold">−</span>
            <span className="truncate text-foreground">{topRisk.label}</span>
            <SourceTag source={topRisk.source} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 font-mono text-[11px] text-muted-foreground">
        <span>Stress tests: {safeCount}/4 scenarios stay SAFE</span>
        <span>Median income {inr(cashflow.medianMonthlyIncome)}/mo</span>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-primary">{value}</p>
    </div>
  );
}
