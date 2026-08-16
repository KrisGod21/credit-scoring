import type { CashflowProfile, EvidenceMetric, TransactionHistory } from "./types";

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Builds the full, auditable evidence ledger behind a score — every entry
 * carries a source (verified/self-declared/derived) and a plain-language
 * explanation, so nothing in the underwriting decision is a black box. */
export function buildEvidenceLedger(
  cashflow: CashflowProfile,
  history: TransactionHistory,
  dataConfidence: number
): EvidenceMetric[] {
  const items: EvidenceMetric[] = [];

  items.push({
    key: "income_stability",
    label: "Income stability",
    value: `${pct(Math.max(0, 1 - cashflow.incomeVolatility))} consistency`,
    source: "derived",
    confidence: dataConfidence,
    impact: cashflow.incomeVolatility < 0.22 ? "positive" : cashflow.incomeVolatility > 0.4 ? "negative" : "neutral",
    explanation: `${cashflow.activeEarningMonths} of the last 12 months had active income, with month-to-month volatility of ${pct(cashflow.incomeVolatility)}.`,
  });

  items.push({
    key: "income_pattern",
    label: "Income pattern",
    value: cashflow.seasonalityDetected ? "Predictable seasonal" : "Steady / non-seasonal",
    source: "derived",
    confidence: dataConfidence,
    impact: "neutral",
    explanation:
      cashflow.seasonalityDetected && cashflow.seasonalityNote
        ? cashflow.seasonalityNote
        : "No strong repeating seasonal pattern detected — variation looks like ordinary month-to-month noise.",
  });

  items.push({
    key: "bill_discipline",
    label: "Bill payment discipline",
    value: `${pct(cashflow.recurringPaymentDiscipline)} on-time`,
    source: "derived",
    confidence: dataConfidence,
    impact:
      cashflow.recurringPaymentDiscipline >= 0.8 ? "positive" : cashflow.recurringPaymentDiscipline < 0.6 ? "negative" : "neutral",
    explanation: `Paid ${pct(cashflow.recurringPaymentDiscipline)} of recurring bills on time across the tracked period.`,
  });

  items.push({
    key: "income_concentration",
    label: "Income concentration",
    value: `${pct(cashflow.incomeConcentration)} from top source`,
    source: "derived",
    confidence: dataConfidence,
    impact: cashflow.incomeConcentration > 0.75 ? "negative" : cashflow.incomeConcentration < 0.5 ? "positive" : "neutral",
    explanation: `${history.incomeSourceNames.length} income source(s) tracked; the largest contributes ${pct(cashflow.incomeConcentration)} of total income.`,
  });

  const monthlyEmi = history.debtObligations.reduce((sum, d) => sum + d.monthlyEmi, 0);
  items.push({
    key: "debt_burden",
    label: "Existing debt burden",
    value: `${pct(cashflow.debtToIncomeRatio)} of income`,
    source: history.debtObligations.length > 0 ? "self-declared" : "derived",
    confidence: history.debtObligations.length > 0 ? 0.7 : 0.9,
    impact: cashflow.debtToIncomeRatio > 0.25 ? "negative" : "positive",
    explanation:
      history.debtObligations.length > 0
        ? `${history.debtObligations.map((d) => d.name).join(", ")} totalling ₹${monthlyEmi.toLocaleString("en-IN")}/month.`
        : "No existing debt obligations declared.",
  });

  items.push({
    key: "work_tenure",
    label: "Work tenure",
    value: `${history.platformTenureMonths} months`,
    source: "self-declared",
    confidence: 0.75,
    impact: history.platformTenureMonths >= 18 ? "positive" : history.platformTenureMonths < 6 ? "negative" : "neutral",
    explanation: `${history.platformTenureMonths} months of continuous work history in this trade.`,
  });

  items.push({
    key: "customer_rating",
    label: "Customer / client rating",
    value: `${history.customerRating.toFixed(1)} / 5`,
    source: "verified",
    confidence: 0.85,
    impact: history.customerRating >= 4.5 ? "positive" : history.customerRating < 4 ? "negative" : "neutral",
    explanation: `Average customer or client rating of ${history.customerRating.toFixed(1)} out of 5, drawn from platform/reputation records.`,
  });

  items.push({
    key: "savings_behaviour",
    label: "Savings behaviour",
    value: `${pct(cashflow.savingsConsistency)} of months saved`,
    source: "derived",
    confidence: dataConfidence,
    impact: cashflow.savingsConsistency >= 0.6 ? "positive" : cashflow.savingsConsistency < 0.35 ? "negative" : "neutral",
    explanation: `Positive savings in ${Math.round(cashflow.savingsConsistency * 12)} of the last 12 months.`,
  });

  if (cashflow.anomalousMonths > 0) {
    items.push({
      key: "anomalies",
      label: "Unusual activity",
      value: `${cashflow.anomalousMonths} month(s) flagged`,
      source: "derived",
      confidence: dataConfidence,
      impact: "negative",
      explanation: `${cashflow.anomalousMonths} month(s) showed income or expenses well outside this applicant's normal range and were excluded from the seasonality read.`,
    });
  }

  return items;
}
