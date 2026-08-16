/**
 * Generates a training set for the credit-scorecard model using the SAME
 * transaction-generator -> Cashflow Intelligence Engine pipeline the live
 * app uses — so the model is trained on the actual feature distribution it
 * will see in production, not a separately hand-authored one. Writes a CSV
 * consumed by ml/train_model.py.
 *
 * Run: npx tsx scripts/generate-training-data.ts
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { clamp, gaussian, mulberry32 } from "../src/lib/underwriting/random";
import { buildCustomOccupationProfile, type ManualProfileInputs } from "../src/lib/underwriting/occupation-profiles";
import { generateTransactionHistory } from "../src/lib/underwriting/transaction-generator";
import { cashflowToModelFeatures, deriveCashflowProfile } from "../src/lib/underwriting/cashflow-engine";
import { mean, stdDev } from "../src/lib/underwriting/stats";
import type { Occupation } from "../src/lib/underwriting/types";

const N = 8000;
const OCCUPATIONS: Occupation[] = ["delivery-rider", "tailor", "street-vendor", "domestic-worker"];
const FEATURE_ORDER = [
  "avg_monthly_income",
  "income_consistency",
  "avg_monthly_txn_count",
  "txn_consistency",
  "utility_ontime_rate",
  "platform_tenure_months",
  "customer_rating",
  "cancellation_rate",
  "savings_rate",
  "debt_to_income",
] as const;

// Same domain-informed weights as the original model design: income
// stability and payment discipline matter more than raw income level; debt
// burden and cancellations are the strongest negative signals.
const WEIGHTS: Record<(typeof FEATURE_ORDER)[number], number> = {
  avg_monthly_income: 0.9,
  income_consistency: 1.6,
  avg_monthly_txn_count: 0.7,
  txn_consistency: 1.3,
  utility_ontime_rate: 1.5,
  platform_tenure_months: 0.8,
  customer_rating: 1.0,
  cancellation_rate: -1.4,
  savings_rate: 0.9,
  debt_to_income: -1.7,
};

const rng = mulberry32(20260815);
const uniform = (min: number, max: number) => min + rng() * (max - min);
const bell = (m: number, sd: number, min: number, max: number) => clamp(gaussian(rng, m, sd), min, max);

// Realistic population, not a uniform spread: most applicants cluster
// around plausible values (moderate debt, decent-but-imperfect discipline)
// with a minority of outliers in either direction — a uniform distribution
// here would make even ordinary debt/savings levels look artificially
// extreme relative to the population, saturating the risk model.
function randomManualInput(occupation: Occupation): ManualProfileInputs {
  return {
    occupation,
    monthlyIncome: bell(14000, 8000, 2000, 50000),
    incomeConsistency: bell(0.55, 0.2, 0.05, 0.98),
    digitalTransactionShare: uniform(0, 1),
    billOnTimeRate: bell(0.7, 0.18, 0.1, 1),
    platformTenureMonths: Math.round(bell(30, 25, 1, 150)),
    customerRating: bell(4.0, 0.5, 2.5, 5),
    cancellationRate: bell(0.12, 0.09, 0, 0.5),
    savingsRate: bell(0.18, 0.14, 0, 0.7),
    debtToIncome: bell(0.45, 0.35, 0, 2),
  };
}

const rows: Record<(typeof FEATURE_ORDER)[number], number>[] = [];

for (let i = 0; i < N; i++) {
  const occupation = OCCUPATIONS[Math.floor(rng() * OCCUPATIONS.length)];
  const manual = randomManualInput(occupation);
  const profile = buildCustomOccupationProfile(manual);
  const history = generateTransactionHistory(`train-${i}`, occupation, profile);
  const cashflow = deriveCashflowProfile(history);
  const features = cashflowToModelFeatures(cashflow, history);
  rows.push(features as Record<(typeof FEATURE_ORDER)[number], number>);
}

// z-score each column across the generated population, then combine with
// domain weights + noise to produce a latent creditworthiness score.
const columnStats = Object.fromEntries(
  FEATURE_ORDER.map((key) => {
    const values = rows.map((r) => r[key]);
    return [key, { mean: mean(values), stdDev: stdDev(values) || 1 }];
  })
) as Record<(typeof FEATURE_ORDER)[number], { mean: number; stdDev: number }>;

const latentScores = rows.map((row) => {
  let z = 0;
  for (const key of FEATURE_ORDER) {
    const { mean: m, stdDev: s } = columnStats[key];
    z += WEIGHTS[key] * ((row[key] - m) / s);
  }
  return z + gaussian(rng, 0, 1.35);
});

const sorted = [...latentScores].sort((a, b) => a - b);
const threshold = sorted[Math.floor(sorted.length * 0.2)];
const isGood = latentScores.map((s) => (s > threshold ? 1 : 0));

const defaultRate = 1 - mean(isGood);
console.log(`Generated ${N} rows. Default rate: ${(defaultRate * 100).toFixed(1)}%`);

const header = [...FEATURE_ORDER, "is_good"].join(",");
const csvRows = rows.map((row, i) => [...FEATURE_ORDER.map((k) => row[k]), isGood[i]].join(","));
const csv = [header, ...csvRows].join("\n");

const outPath = path.resolve(__dirname, "../ml/derived_training_data.csv");
writeFileSync(outPath, csv);
console.log(`Wrote ${outPath}`);
