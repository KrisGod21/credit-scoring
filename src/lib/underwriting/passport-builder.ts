import { scoreProfile } from "@/lib/scoring/scoring-engine";
import { cashflowToModelFeatures, deriveCashflowProfile } from "./cashflow-engine";
import { buildCreditPlan } from "./credit-plan";
import { buildEvidenceLedger } from "./evidence-builder";
import { computePassportDimensions } from "./passport-dimensions";
import { runStressTests } from "./stress-test-engine";
import { runUnderwriting } from "./underwriting-engine";
import type { WhatIfInputs } from "./what-if";
import type { FinancialPassport, TransactionHistory } from "./types";

export interface BuildPassportParams {
  applicantLabel: string;
  history: TransactionHistory;
  requestedAmount: number;
  tenureMonths: number;
}

/**
 * The single entry point that runs the whole pipeline: transaction history
 * -> derived cashflow stats -> trained risk model -> underwriting decision
 * -> evidence ledger -> Financial Passport dimensions -> stress tests ->
 * credit-building plan. Everything the UI needs comes out of this one call.
 */
export function buildFinancialPassport(params: BuildPassportParams): FinancialPassport {
  const { applicantLabel, history, requestedAmount, tenureMonths } = params;

  const cashflow = deriveCashflowProfile(history);
  const modelFeatures = cashflowToModelFeatures(cashflow, history);
  const scored = scoreProfile(modelFeatures);

  const underwriting = runUnderwriting({
    cashflow,
    history,
    probabilityGood: scored.probabilityGood,
    requestedAmount,
    tenureMonths,
  });

  const evidence = buildEvidenceLedger(cashflow, history, underwriting.dataConfidence);
  const dimensions = computePassportDimensions(cashflow, underwriting);
  const stressTests = runStressTests({
    cashflow,
    probabilityGood: scored.probabilityGood,
    dataConfidence: underwriting.dataConfidence,
    impliedEmi: underwriting.impliedEmi,
  });

  const whatIfBaseline: WhatIfInputs = {
    avg_monthly_income: modelFeatures.avg_monthly_income,
    income_consistency: modelFeatures.income_consistency,
    avg_monthly_txn_count: modelFeatures.avg_monthly_txn_count,
    txn_consistency: modelFeatures.txn_consistency,
    utility_ontime_rate: modelFeatures.utility_ontime_rate,
    platform_tenure_months: modelFeatures.platform_tenure_months,
    customer_rating: modelFeatures.customer_rating,
    cancellation_rate: modelFeatures.cancellation_rate,
    savings_rate: modelFeatures.savings_rate,
    debt_to_income: modelFeatures.debt_to_income,
    monthlySurplus: cashflow.monthlySurplus,
    tenureMonths,
    dataConfidence: underwriting.dataConfidence,
  };

  const creditPlan = buildCreditPlan(whatIfBaseline, underwriting.recommendedCreditMax);

  return {
    applicantLabel,
    occupation: history.occupation,
    transactionHistory: history,
    cashflow,
    underwriting,
    dimensions,
    evidence,
    stressTests,
    creditPlan,
  };
}
