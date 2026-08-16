import { buildEvidenceLedger } from "./evidence-builder";
import type {
  CashflowProfile,
  RiskTier,
  TransactionHistory,
  UnderwritingResult,
  UnderwritingVerdict,
} from "./types";

const BASE_SAFETY_FACTOR = 0.5;

export function riskTierFromProbability(probabilityGood: number): RiskTier {
  if (probabilityGood >= 0.75) return "LOW";
  if (probabilityGood >= 0.5) return "MODERATE";
  return "HIGH";
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/**
 * Data Confidence: verified data outweighs self-declared, complete history
 * outweighs gaps, clean history outweighs anomalies, and multiple
 * independent income sources outweigh a single one. A ₹35,000 self-reported
 * figure and a 12-month verified transaction history are not the same
 * evidence, and this number is what keeps that distinction visible.
 */
export function computeDataConfidence(history: TransactionHistory, cashflow: CashflowProfile): number {
  const verifiedShare = history.verifiedMonths / 12;
  const completeness = cashflow.activeEarningMonths / 12;
  const anomalyPenalty = Math.max(0, 1 - cashflow.anomalousMonths * 0.1);
  const sourceDiversity = Math.min(1, cashflow.numIncomeSources / 3);

  const raw = 0.45 * verifiedShare + 0.25 * completeness + 0.2 * anomalyPenalty + 0.1 * sourceDiversity;
  return clamp01(raw);
}

export interface UnderwritingParams {
  cashflow: CashflowProfile;
  history: TransactionHistory;
  probabilityGood: number;
  requestedAmount: number;
  tenureMonths: number;
}

/** Shared affordability math, reused by the stress test with perturbed cashflow inputs. */
export function computeRepaymentCapacity(
  monthlySurplus: number,
  probabilityGood: number,
  dataConfidence: number
): number {
  const riskAdjustment = 0.6 + 0.4 * probabilityGood;
  const confidenceAdjustment = 0.7 + 0.3 * dataConfidence;
  const safetyFactor = BASE_SAFETY_FACTOR * riskAdjustment * confidenceAdjustment;
  return Math.max(0, monthlySurplus * safetyFactor);
}

/**
 * Deterministic affordability math layered on top of the trained risk
 * model. Deliberately not another ML model: a repayment-capacity number
 * needs to be auditable, and "surplus x a risk/confidence-adjusted safety
 * factor" is math a lender (or the applicant) can actually check.
 */
export function runUnderwriting(params: UnderwritingParams): UnderwritingResult {
  const { cashflow, history, probabilityGood, requestedAmount, tenureMonths } = params;

  const riskTier = riskTierFromProbability(probabilityGood);
  const dataConfidence = computeDataConfidence(history, cashflow);

  const repaymentCapacityMonthly = computeRepaymentCapacity(cashflow.monthlySurplus, probabilityGood, dataConfidence);
  const recommendedCreditMax = Math.round(repaymentCapacityMonthly * tenureMonths);
  const recommendedCreditMin = Math.round(recommendedCreditMax * 0.55);
  const maxSafeExposure = Math.round(recommendedCreditMax * 1.15);
  const impliedEmi = tenureMonths > 0 ? requestedAmount / tenureMonths : requestedAmount;

  let verdict: UnderwritingVerdict;
  if (recommendedCreditMax >= requestedAmount) verdict = "APPROVED";
  else if (recommendedCreditMax >= requestedAmount * 0.5) verdict = "PARTIAL";
  else verdict = "NOT_READY";

  const ledger = buildEvidenceLedger(cashflow, history, dataConfidence);
  const positiveFactors = ledger.filter((e) => e.impact === "positive").slice(0, 4);
  const riskFactors = ledger.filter((e) => e.impact === "negative").slice(0, 4);

  return {
    riskTier,
    probabilityGood,
    dataConfidence,
    repaymentCapacityMonthly: Math.round(repaymentCapacityMonthly),
    recommendedCreditMin,
    recommendedCreditMax,
    maxSafeExposure,
    requestedAmount,
    tenureMonths,
    impliedEmi: Math.round(impliedEmi),
    verdict,
    positiveFactors,
    riskFactors,
  };
}
