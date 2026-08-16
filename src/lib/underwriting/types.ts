export type Occupation = "delivery-rider" | "tailor" | "street-vendor" | "domestic-worker";

export type DataSource = "verified" | "self-declared" | "derived";

/** One month of a synthetic transaction history for an applicant. */
export interface TransactionMonth {
  monthIndex: number; // 0 = oldest, 11 = most recent
  label: string; // "Sep 2025"
  income: number;
  incomeBySource: { source: string; amount: number }[];
  expenses: number;
  essentialExpenses: number;
  billsDue: number;
  billsPaidOnTime: number;
  savingsContribution: number;
  debtServiced: number;
  transactionCount: number;
  isAnomalous: boolean;
}

export interface DebtObligation {
  name: string;
  monthlyEmi: number;
}

/** The full evidence record an applicant's identity is built from. */
export interface TransactionHistory {
  personaId: string;
  occupation: Occupation;
  months: TransactionMonth[]; // 12, oldest to newest
  incomeSourceNames: string[];
  debtObligations: DebtObligation[];
  platformTenureMonths: number;
  customerRating: number; // 1-5
  cancellationRate: number; // 0-1
  verifiedMonths: number; // how many months came from a "verified" feed vs self-declared
}

/** A single explainable fact, tagged with where it came from and how sure we are. */
export interface EvidenceMetric {
  key: string;
  label: string;
  value: string;
  source: DataSource;
  confidence: number; // 0-1
  explanation: string;
  impact: "positive" | "negative" | "neutral";
}

/** Derived cashflow statistics — the output of the Cashflow Intelligence Engine. */
export interface CashflowProfile {
  medianMonthlyIncome: number;
  incomeVolatility: number; // coefficient of variation, 0+
  incomeTrend: "rising" | "falling" | "flat";
  incomeTrendPctPerMonth: number;
  seasonalityDetected: boolean;
  seasonalityNote?: string;
  monthlySurplus: number;
  essentialExpenseRatio: number; // essential expenses / income
  debtToIncomeRatio: number;
  savingsRate: number; // 0-1, mean share of income saved
  savingsConsistency: number; // 0-1, share of months with positive savings
  recurringPaymentDiscipline: number; // 0-1, bills paid on time / bills due
  incomeConcentration: number; // 0-1, share of income from top source
  numIncomeSources: number;
  activeEarningMonths: number; // out of 12
  workContinuity: number; // 0-1
  anomalousMonths: number;
  avgMonthlyTransactionCount: number;
  transactionConsistency: number; // 0-1
}

export type RiskTier = "LOW" | "MODERATE" | "HIGH";
export type UnderwritingVerdict = "APPROVED" | "PARTIAL" | "NOT_READY";

export interface UnderwritingResult {
  riskTier: RiskTier;
  probabilityGood: number;
  dataConfidence: number; // 0-1
  repaymentCapacityMonthly: number;
  recommendedCreditMin: number;
  recommendedCreditMax: number;
  maxSafeExposure: number;
  requestedAmount: number;
  tenureMonths: number;
  impliedEmi: number;
  verdict: UnderwritingVerdict;
  positiveFactors: EvidenceMetric[];
  riskFactors: EvidenceMetric[];
}

export const STRESS_SCENARIOS = [
  "income-drop-20",
  "lose-top-source",
  "one-bad-month",
  "shock-expense-10k",
] as const;
export type StressScenarioId = (typeof STRESS_SCENARIOS)[number];

export type StressVerdict = "SAFE" | "WARNING" | "UNSAFE";

export interface StressTestResult {
  scenario: StressScenarioId;
  label: string;
  description: string;
  baseCapacity: number;
  stressedCapacity: number;
  coverageRatio: number; // stressed capacity / implied EMI
  verdict: StressVerdict;
}

export interface CreditPlanStep {
  action: string;
  detail: string;
  capacityGain: number;
}

export interface CreditPlan {
  currentMax: number;
  targetMax: number;
  steps: CreditPlanStep[];
}

/** The six dimensions shown on the Financial Passport. */
export interface PassportDimensions {
  financialReliability: number; // 0-100
  incomeStability: number;
  repaymentCapacity: number;
  debtBurden: number; // higher = healthier (i.e. already inverted from raw burden)
  incomeResilience: number;
  dataConfidence: number;
}

export interface FinancialPassport {
  applicantLabel: string;
  occupation: Occupation;
  transactionHistory: TransactionHistory;
  cashflow: CashflowProfile;
  underwriting: UnderwritingResult;
  dimensions: PassportDimensions;
  evidence: EvidenceMetric[];
  stressTests: StressTestResult[];
  creditPlan: CreditPlan;
}
