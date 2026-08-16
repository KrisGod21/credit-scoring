import { scoreProfile } from "@/lib/scoring/scoring-engine";
import { computeRepaymentCapacity, riskTierFromProbability } from "./underwriting-engine";
import type { RiskTier } from "./types";

/** Everything the simulator needs: the 10 model features plus the
 * affordability-specific numbers that sit outside the ML model. */
export interface WhatIfInputs {
  avg_monthly_income: number;
  income_consistency: number;
  avg_monthly_txn_count: number;
  txn_consistency: number;
  utility_ontime_rate: number;
  platform_tenure_months: number;
  customer_rating: number;
  cancellation_rate: number;
  savings_rate: number;
  debt_to_income: number;
  monthlySurplus: number;
  tenureMonths: number;
  dataConfidence: number;
}

export interface WhatIfResult {
  probabilityGood: number;
  riskTier: RiskTier;
  repaymentCapacityMonthly: number;
  recommendedCreditMax: number;
  recommendedCreditMin: number;
}

/** Live re-run of the full pipeline (trained model -> affordability math)
 * for an edited set of inputs. Pure and fast, so it's safe to call on every
 * slider tick in the What-If Simulator. */
export function simulateUnderwriting(inputs: WhatIfInputs): WhatIfResult {
  const scored = scoreProfile({
    avg_monthly_income: inputs.avg_monthly_income,
    income_consistency: inputs.income_consistency,
    avg_monthly_txn_count: inputs.avg_monthly_txn_count,
    txn_consistency: inputs.txn_consistency,
    utility_ontime_rate: inputs.utility_ontime_rate,
    platform_tenure_months: inputs.platform_tenure_months,
    customer_rating: inputs.customer_rating,
    cancellation_rate: inputs.cancellation_rate,
    savings_rate: inputs.savings_rate,
    debt_to_income: inputs.debt_to_income,
  });
  const repaymentCapacityMonthly = computeRepaymentCapacity(
    inputs.monthlySurplus,
    scored.probabilityGood,
    inputs.dataConfidence
  );
  const recommendedCreditMax = Math.round(repaymentCapacityMonthly * inputs.tenureMonths);

  return {
    probabilityGood: scored.probabilityGood,
    riskTier: riskTierFromProbability(scored.probabilityGood),
    repaymentCapacityMonthly: Math.round(repaymentCapacityMonthly),
    recommendedCreditMax,
    recommendedCreditMin: Math.round(recommendedCreditMax * 0.55),
  };
}
