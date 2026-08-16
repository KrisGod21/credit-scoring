import type { CashflowProfile, PassportDimensions, UnderwritingResult } from "./types";

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** Collapses the cashflow + underwriting output into the six 0-100 dials
 * shown on the Financial Passport. Every dial traces back to a concrete
 * derived statistic — see the evidence ledger for the "why". */
export function computePassportDimensions(
  cashflow: CashflowProfile,
  underwriting: UnderwritingResult
): PassportDimensions {
  const financialReliability = clamp01(underwriting.probabilityGood) * 100;
  const incomeStability = clamp01(1 - cashflow.incomeVolatility) * 100;

  const capacityRatio = cashflow.medianMonthlyIncome > 0
    ? underwriting.repaymentCapacityMonthly / cashflow.medianMonthlyIncome
    : 0;
  const repaymentCapacity = clamp01(capacityRatio * 2) * 100;

  const debtBurden = clamp01(1 - cashflow.debtToIncomeRatio * 2) * 100;

  const incomeResilience =
    clamp01(1 - cashflow.incomeConcentration * 0.5 - cashflow.incomeVolatility * 0.5) * 100;

  const dataConfidence = clamp01(underwriting.dataConfidence) * 100;

  return {
    financialReliability: Math.round(financialReliability),
    incomeStability: Math.round(incomeStability),
    repaymentCapacity: Math.round(repaymentCapacity),
    debtBurden: Math.round(debtBurden),
    incomeResilience: Math.round(incomeResilience),
    dataConfidence: Math.round(dataConfidence),
  };
}
