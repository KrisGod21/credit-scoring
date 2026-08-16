import { linearTrendSlope, mean, median, stdDev } from "./stats";
import type { CashflowProfile, TransactionHistory, TransactionMonth } from "./types";
import type { ProfileInput } from "@/lib/scoring/types";

const ACTIVE_MONTH_THRESHOLD_RATIO = 0.15;

/**
 * The Cashflow Intelligence Engine: turns a 12-month transaction history
 * into the derived statistics an underwriter actually cares about. Every
 * number here is computed from the transaction data itself — nothing is
 * read back from the occupation profile that generated it, so this works
 * identically for demo personas and for a manually-entered custom profile.
 */
export function deriveCashflowProfile(history: TransactionHistory): CashflowProfile {
  const months = history.months;
  const incomes = months.map((m) => m.income);
  const medianIncome = median(incomes);
  const meanIncome = mean(incomes);
  const incomeStdDev = stdDev(incomes);
  const incomeVolatility = meanIncome > 0 ? incomeStdDev / meanIncome : 0;

  const trendSlope = linearTrendSlope(incomes);
  const trendPctPerMonth = meanIncome > 0 ? trendSlope / meanIncome : 0;
  const incomeTrend = trendPctPerMonth > 0.015 ? "rising" : trendPctPerMonth < -0.015 ? "falling" : "flat";

  const seasonality = detectSeasonality(months, incomes, medianIncome);

  const surplusSeries = months.map((m) => m.income - m.expenses);
  const monthlySurplus = mean(surplusSeries);

  const essentialExpenseRatio = mean(
    months.map((m) => (m.income > 0 ? m.essentialExpenses / m.income : 0))
  );

  const totalMonthlyEmi = history.debtObligations.reduce((sum, d) => sum + d.monthlyEmi, 0);
  const debtToIncomeRatio = medianIncome > 0 ? totalMonthlyEmi / medianIncome : 0;

  const savingsRate = mean(months.map((m) => (m.income > 0 ? m.savingsContribution / m.income : 0)));
  const savingsConsistency = months.filter((m) => m.savingsContribution > 0).length / months.length;

  const billsDueTotal = months.reduce((sum, m) => sum + m.billsDue, 0);
  const billsPaidTotal = months.reduce((sum, m) => sum + m.billsPaidOnTime, 0);
  const recurringPaymentDiscipline = billsDueTotal > 0 ? billsPaidTotal / billsDueTotal : 1;

  const concentrationPerMonth = months.map((m) => {
    if (m.incomeBySource.length === 0 || m.income === 0) return 0;
    const top = Math.max(...m.incomeBySource.map((s) => s.amount));
    return top / m.income;
  });
  const incomeConcentration = mean(concentrationPerMonth);

  const activeEarningMonths = incomes.filter((v) => v >= medianIncome * ACTIVE_MONTH_THRESHOLD_RATIO).length;
  const workContinuity = activeEarningMonths / months.length;
  const anomalousMonths = months.filter((m) => m.isAnomalous).length;

  const txnCounts = months.map((m) => m.transactionCount);
  const avgMonthlyTransactionCount = mean(txnCounts);
  const txnStdDev = stdDev(txnCounts);
  const transactionConsistency =
    avgMonthlyTransactionCount > 0 ? Math.max(0, 1 - txnStdDev / avgMonthlyTransactionCount) : 0;

  return {
    medianMonthlyIncome: Math.round(medianIncome),
    incomeVolatility,
    incomeTrend,
    incomeTrendPctPerMonth: trendPctPerMonth,
    seasonalityDetected: seasonality.detected,
    seasonalityNote: seasonality.note,
    monthlySurplus: Math.round(monthlySurplus),
    essentialExpenseRatio,
    debtToIncomeRatio,
    savingsRate,
    savingsConsistency,
    recurringPaymentDiscipline,
    incomeConcentration,
    numIncomeSources: history.incomeSourceNames.length,
    activeEarningMonths,
    workContinuity,
    anomalousMonths,
    avgMonthlyTransactionCount,
    transactionConsistency,
  };
}

/**
 * Distinguishes predictable seasonal income from random volatility: fits a
 * linear trend, looks at whether the extreme months (high and low) sit far
 * outside the residual noise band, and excludes one-off anomalous months
 * (those are shocks, not a repeating seasonal pattern).
 */
function detectSeasonality(
  months: TransactionMonth[],
  incomes: number[],
  medianIncome: number
): { detected: boolean; note?: string } {
  const trendSlope = linearTrendSlope(incomes);
  const trendMean = mean(incomes);
  const residuals = incomes.map((v, i) => v - (trendMean + trendSlope * (i - (incomes.length - 1) / 2)));
  const residualStdDev = stdDev(residuals);

  const structural = months
    .map((m, i) => ({ label: m.label, residual: residuals[i], anomalous: m.isAnomalous }))
    .filter((m) => !m.anomalous);

  if (structural.length < 6 || residualStdDev === 0 || medianIncome === 0) {
    return { detected: false };
  }

  const sorted = [...structural].sort((a, b) => a.residual - b.residual);
  const low = sorted.slice(0, 2);
  const high = sorted.slice(-2);
  const swing = mean(high.map((m) => m.residual)) - mean(low.map((m) => m.residual));
  const swingRatio = swing / medianIncome;
  const zScore = residualStdDev > 0 ? swing / (2 * residualStdDev) : 0;

  // A swing that's both large relative to income AND well outside typical
  // noise (not explained by month-to-month randomness alone) reads as a
  // repeating seasonal pattern rather than volatility.
  if (swingRatio > 0.35 && zScore > 1.5) {
    return {
      detected: true,
      note: `${high.map((m) => m.label.split(" ")[0]).join("/")} run notably higher than ${low
        .map((m) => m.label.split(" ")[0])
        .join("/")}.`,
    };
  }

  return { detected: false };
}

/** Feeds the derived cashflow stats into the already-trained scorecard model. */
export function cashflowToModelFeatures(cashflow: CashflowProfile, history: TransactionHistory): ProfileInput {
  return {
    avg_monthly_income: cashflow.medianMonthlyIncome,
    income_consistency: Math.max(0, Math.min(1, 1 - cashflow.incomeVolatility)),
    avg_monthly_txn_count: cashflow.avgMonthlyTransactionCount,
    txn_consistency: cashflow.transactionConsistency,
    utility_ontime_rate: cashflow.recurringPaymentDiscipline,
    platform_tenure_months: history.platformTenureMonths,
    customer_rating: history.customerRating,
    cancellation_rate: history.cancellationRate,
    savings_rate: Math.max(0, Math.min(1, cashflow.savingsRate)),
    debt_to_income: cashflow.debtToIncomeRatio,
  };
}
