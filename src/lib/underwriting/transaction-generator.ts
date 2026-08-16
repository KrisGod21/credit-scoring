import { clamp, gaussian, hashSeed, mulberry32 } from "./random";
import type { OccupationProfile } from "./occupation-profiles";
import type { DebtObligation, Occupation, TransactionHistory, TransactionMonth } from "./types";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pick(rng: () => number, [min, max]: [number, number]): number {
  return min + rng() * (max - min);
}

function last12MonthLabels(referenceDate: Date): { calendarMonth: number; label: string }[] {
  const out: { calendarMonth: number; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    out.push({ calendarMonth: d.getMonth() + 1, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` });
  }
  return out;
}

/**
 * Generates a deterministic, occupation-flavored 12-month transaction
 * history. Same personaId + profile always produces the same history, so
 * demos are reproducible without shipping large static data files.
 */
export function generateTransactionHistory(
  personaId: string,
  occupation: Occupation,
  profile: OccupationProfile,
  referenceDate: Date = new Date()
): TransactionHistory {
  const rng = mulberry32(hashSeed(personaId));

  const baseIncome = pick(rng, profile.baseMonthlyIncome);
  const essentialRatioBase = pick(rng, profile.essentialExpenseRatio);
  const billOnTimeBase = pick(rng, profile.billOnTimeRate);
  const verifiedMonths = Math.round(pick(rng, profile.verifiedMonthsRange));

  const debtObligations: DebtObligation[] =
    profile.debt && profile.debt.monthlyEmi > 0
      ? [{ name: profile.debt.name, monthlyEmi: profile.debt.monthlyEmi }]
      : [];
  const monthlyEmi = debtObligations.reduce((sum, d) => sum + d.monthlyEmi, 0);

  const monthMeta = last12MonthLabels(referenceDate);
  const months: TransactionMonth[] = monthMeta.map(({ calendarMonth, label }, monthIndex) => {
    const seasonalMultiplier = profile.seasonality[calendarMonth] ?? 1;
    const expectedIncome = baseIncome * seasonalMultiplier;

    let anomalous = false;
    let income = Math.max(0, gaussian(rng, expectedIncome, expectedIncome * profile.monthlyVolatility));

    // Occasional distinct shock event (income spike or dip) rather than
    // ordinary volatility — this is what the anomaly detector should catch.
    if (rng() < 0.07) {
      anomalous = true;
      income *= rng() < 0.5 ? 1.6 : 0.45;
    }

    const essentialRatio = clamp(gaussian(rng, essentialRatioBase, 0.04), 0.25, 0.85);
    const essentialExpenses = income * essentialRatio;
    const discretionaryExpenses = income * clamp(gaussian(rng, 0.12, 0.03), 0, 0.3);
    const expenses = essentialExpenses + discretionaryExpenses + monthlyEmi;

    const billsDue = Math.round(pick(rng, [2, 5]));
    const onTimeRate = clamp(gaussian(rng, billOnTimeBase, 0.06), 0, 1);
    const billsPaidOnTime = Math.min(billsDue, Math.round(billsDue * onTimeRate));

    const leftover = Math.max(0, income - expenses);
    const savingsPropensity = clamp(gaussian(rng, 0.35, 0.15), 0, 0.8);
    const savingsContribution = leftover * savingsPropensity;

    const txnCount = Math.max(
      1,
      Math.round(gaussian(rng, pick(rng, profile.transactionCountRange), 3 * profile.transactionCountVolatility))
    );

    const incomeBySource = profile.incomeSources.map((s, i) => {
      const noise = 1 + gaussian(rng, 0, 0.08);
      const raw = income * s.share * noise;
      return { source: s.name, amount: i === profile.incomeSources.length - 1 ? NaN : Math.max(0, raw) };
    });
    // Last source absorbs rounding so shares sum exactly to `income`.
    const allocated = incomeBySource.slice(0, -1).reduce((sum, s) => sum + s.amount, 0);
    incomeBySource[incomeBySource.length - 1].amount = Math.max(0, income - allocated);

    return {
      monthIndex,
      label,
      income: Math.round(income),
      incomeBySource: incomeBySource.map((s) => ({ source: s.source, amount: Math.round(s.amount) })),
      expenses: Math.round(expenses),
      essentialExpenses: Math.round(essentialExpenses),
      billsDue,
      billsPaidOnTime,
      savingsContribution: Math.round(savingsContribution),
      debtServiced: monthlyEmi,
      transactionCount: txnCount,
      isAnomalous: anomalous,
    };
  });

  return {
    personaId,
    occupation,
    months,
    incomeSourceNames: profile.incomeSources.map((s) => s.name),
    debtObligations,
    platformTenureMonths: Math.round(pick(rng, profile.platformTenureRange)),
    customerRating: Number(pick(rng, profile.customerRatingRange).toFixed(1)),
    cancellationRate: Number(pick(rng, profile.cancellationRateRange).toFixed(3)),
    verifiedMonths,
  };
}
