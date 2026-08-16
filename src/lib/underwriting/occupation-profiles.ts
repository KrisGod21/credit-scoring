import { clamp } from "./random";
import type { Occupation } from "./types";

export interface OccupationProfile {
  occupation: Occupation;
  baseMonthlyIncome: [number, number];
  incomeSources: { name: string; share: number }[];
  monthlyVolatility: number; // stdev as a fraction of that month's expected income
  essentialExpenseRatio: [number, number];
  billOnTimeRate: [number, number];
  debt: { name: string; monthlyEmi: number } | null;
  transactionCountRange: [number, number];
  transactionCountVolatility: number;
  platformTenureRange: [number, number];
  customerRatingRange: [number, number];
  cancellationRateRange: [number, number];
  verifiedMonthsRange: [number, number];
  /** Calendar-month (1-12) multipliers layered on top of the base income. */
  seasonality: Partial<Record<number, number>>;
  seasonalityNote: string;
}

export const OCCUPATION_PROFILES: Record<Occupation, OccupationProfile> = {
  "delivery-rider": {
    occupation: "delivery-rider",
    baseMonthlyIncome: [15000, 18000],
    incomeSources: [
      { name: "Platform payouts", share: 0.55 },
      { name: "Second platform", share: 0.35 },
      { name: "Customer tips", share: 0.1 },
    ],
    monthlyVolatility: 0.1,
    essentialExpenseRatio: [0.5, 0.6],
    billOnTimeRate: [0.75, 0.88],
    debt: { name: "Two-wheeler EMI", monthlyEmi: 2100 },
    transactionCountRange: [75, 120],
    transactionCountVolatility: 0.15,
    platformTenureRange: [8, 24],
    customerRatingRange: [4.3, 4.8],
    cancellationRateRange: [0.04, 0.11],
    verifiedMonthsRange: [10, 12],
    seasonality: { 10: 1.18, 11: 1.15, 3: 1.05 },
    seasonalityNote: "Festive-season delivery demand (Oct–Nov) lifts earnings.",
  },
  tailor: {
    occupation: "tailor",
    baseMonthlyIncome: [8500, 11500],
    incomeSources: [
      { name: "Repeat customers", share: 0.5 },
      { name: "Festive & wedding orders", share: 0.35 },
      { name: "Alterations", share: 0.15 },
    ],
    monthlyVolatility: 0.22,
    essentialExpenseRatio: [0.45, 0.55],
    billOnTimeRate: [0.62, 0.78],
    debt: { name: "Sewing machine loan", monthlyEmi: 3400 },
    transactionCountRange: [10, 26],
    transactionCountVolatility: 0.3,
    platformTenureRange: [24, 60],
    customerRatingRange: [4.1, 4.6],
    cancellationRateRange: [0.06, 0.12],
    verifiedMonthsRange: [4, 7],
    seasonality: { 9: 1.5, 10: 1.75, 11: 1.35, 1: 1.25, 6: 0.65, 7: 0.6 },
    seasonalityNote: "Wedding and festive season (Sep–Nov, Jan–Feb) vs. monsoon lull (Jun–Jul).",
  },
  "street-vendor": {
    occupation: "street-vendor",
    baseMonthlyIncome: [6500, 8500],
    incomeSources: [
      { name: "Daily cash sales", share: 0.78 },
      { name: "UPI sales", share: 0.22 },
    ],
    monthlyVolatility: 0.16,
    essentialExpenseRatio: [0.6, 0.7],
    billOnTimeRate: [0.42, 0.58],
    debt: { name: "Informal supplier credit", monthlyEmi: 4200 },
    transactionCountRange: [5, 16],
    transactionCountVolatility: 0.35,
    platformTenureRange: [36, 96],
    customerRatingRange: [3.8, 4.3],
    cancellationRateRange: [0.12, 0.22],
    verifiedMonthsRange: [2, 4],
    seasonality: { 6: 0.78, 7: 0.75, 8: 0.85 },
    seasonalityNote: "Monsoon months (Jun–Aug) reduce foot traffic and daily sales.",
  },
  "domestic-worker": {
    occupation: "domestic-worker",
    baseMonthlyIncome: [10500, 13500],
    incomeSources: [
      { name: "Household A", share: 0.4 },
      { name: "Household B", share: 0.35 },
      { name: "Household C", share: 0.25 },
    ],
    monthlyVolatility: 0.05,
    essentialExpenseRatio: [0.4, 0.5],
    billOnTimeRate: [0.88, 0.97],
    debt: { name: "None", monthlyEmi: 0 },
    transactionCountRange: [4, 9],
    transactionCountVolatility: 0.1,
    platformTenureRange: [48, 96],
    customerRatingRange: [4.6, 5.0],
    cancellationRateRange: [0.0, 0.02],
    verifiedMonthsRange: [6, 9],
    seasonality: { 5: 0.88, 4: 0.92 },
    seasonalityNote: "Small dip when employer households travel over summer (Apr–May).",
  },
};

export interface ManualProfileInputs {
  occupation: Occupation;
  monthlyIncome: number;
  incomeConsistency: number; // 0-1, how steady month to month
  digitalTransactionShare: number; // 0-1, share of the year with verifiable digital transactions
  billOnTimeRate: number; // 0-1
  platformTenureMonths: number;
  customerRating: number;
  cancellationRate: number;
  savingsRate: number; // 0-1
  debtToIncome: number; // 0-3
}

/** Builds a one-off generation profile centered on manually-entered
 * aggregates, reusing the chosen occupation's income-source mix, seasonal
 * pattern, and transaction cadence as the shape — so "enter your own"
 * flows through the exact same transaction -> cashflow -> underwriting
 * pipeline as the demo personas, just re-centered on the user's numbers. */
export function buildCustomOccupationProfile(inputs: ManualProfileInputs): OccupationProfile {
  const base = OCCUPATION_PROFILES[inputs.occupation];
  const monthlyEmi = Math.round(inputs.debtToIncome * inputs.monthlyIncome);
  const verifiedMonths = Math.round(clamp(inputs.digitalTransactionShare, 0, 1) * 12);

  return {
    ...base,
    baseMonthlyIncome: [inputs.monthlyIncome * 0.97, inputs.monthlyIncome * 1.03],
    monthlyVolatility: clamp(0.38 * (1 - inputs.incomeConsistency), 0.03, 0.42),
    essentialExpenseRatio: [
      clamp(0.82 - inputs.savingsRate, 0.25, 0.85),
      clamp(0.9 - inputs.savingsRate, 0.3, 0.9),
    ],
    billOnTimeRate: [clamp(inputs.billOnTimeRate - 0.05, 0, 1), clamp(inputs.billOnTimeRate + 0.05, 0, 1)],
    debt: monthlyEmi > 0 ? { name: "Declared debt obligation", monthlyEmi } : null,
    platformTenureRange: [inputs.platformTenureMonths, inputs.platformTenureMonths],
    customerRatingRange: [inputs.customerRating, inputs.customerRating],
    cancellationRateRange: [inputs.cancellationRate, inputs.cancellationRate],
    verifiedMonthsRange: [verifiedMonths, verifiedMonths],
  };
}
