import { simulateUnderwriting, type WhatIfInputs } from "./what-if";
import type { CreditPlan, CreditPlanStep } from "./types";

interface Nudge {
  action: string;
  detail: string;
  /** Full transform, not a single-field patch — debt reduction needs to
   * free up monthlySurplus too, not just move the model feature. */
  apply: (baseline: WhatIfInputs) => WhatIfInputs;
}

const NUDGES: Nudge[] = [
  {
    action: "Reduce existing debt burden",
    detail: "Pay down or consolidate existing EMIs to free up monthly repayment capacity.",
    apply: (b) => {
      const nextDebtToIncome = Math.max(0, b.debt_to_income * 0.6);
      const freedCash = (b.debt_to_income - nextDebtToIncome) * b.avg_monthly_income;
      return { ...b, debt_to_income: nextDebtToIncome, monthlySurplus: b.monthlySurplus + freedCash };
    },
  },
  {
    action: "Improve bill payment consistency",
    detail: "Pay recurring bills on time for the next few months.",
    apply: (b) => ({ ...b, utility_ontime_rate: Math.min(1, b.utility_ontime_rate + 0.15) }),
  },
  {
    action: "Stabilize monthly income",
    detail: "Smooth out month-to-month income swings where possible — e.g. spreading work across the month.",
    apply: (b) => ({ ...b, income_consistency: Math.min(1, b.income_consistency + 0.15) }),
  },
  {
    action: "Build a consistent savings habit",
    detail: "Set aside a fixed share of income each month, even a small one.",
    apply: (b) => ({ ...b, savings_rate: Math.min(1, b.savings_rate + 0.1) }),
  },
  {
    action: "Maintain continuous work history",
    detail: "Keep working steadily — six more months of tenure strengthens the record.",
    apply: (b) => ({ ...b, platform_tenure_months: b.platform_tenure_months + 6 }),
  },
];

const GAIN_THRESHOLD = 300;

/** Marginal-analysis credit-building plan: for each lever the applicant can
 * plausibly pull, re-run the full pipeline with that one change and measure
 * the capacity gain. Ranked, capped, and combined with diminishing returns
 * since the levers aren't perfectly additive in practice.
 *
 * When monthly surplus is already negative, no amount of "looking more
 * reliable" produces safe credit — capacity is clamped at zero regardless
 * of risk probability. In that case the plan surfaces the debt-reduction
 * step's effect on the monthly shortfall instead of a credit-amount gain,
 * because closing that gap is the honest prerequisite, not a rejection.
 */
export function buildCreditPlan(baseline: WhatIfInputs, currentMax: number): CreditPlan {
  const candidates: CreditPlanStep[] = [];

  for (const nudge of NUDGES) {
    const nudged = nudge.apply(baseline);
    const result = simulateUnderwriting(nudged);
    const gain = result.recommendedCreditMax - currentMax;

    if (gain > GAIN_THRESHOLD) {
      candidates.push({ action: nudge.action, detail: nudge.detail, capacityGain: Math.round(gain) });
    }
  }

  if (candidates.length === 0 && baseline.monthlySurplus < 0) {
    const debtNudge = NUDGES[0];
    const nudged = debtNudge.apply(baseline);
    const shortfallReduction = nudged.monthlySurplus - baseline.monthlySurplus;
    if (shortfallReduction > 100) {
      candidates.push({
        action: debtNudge.action,
        detail: `Cuts the monthly shortfall by roughly ₹${Math.round(shortfallReduction).toLocaleString(
          "en-IN"
        )} — the necessary first step before any credit becomes safe to extend, not yet enough on its own.`,
        capacityGain: 0,
      });
    }
  }

  candidates.sort((a, b) => b.capacityGain - a.capacityGain);
  const steps = candidates.slice(0, 4);
  const combinedGain = steps.reduce((sum, s) => sum + s.capacityGain, 0) * 0.6;

  return {
    currentMax,
    targetMax: Math.round(currentMax + combinedGain),
    steps,
  };
}
