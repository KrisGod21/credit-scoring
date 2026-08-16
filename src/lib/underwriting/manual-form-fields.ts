import type { ManualProfileInputs } from "./occupation-profiles";

export interface ManualFieldConfig {
  key: Exclude<keyof ManualProfileInputs, "occupation">;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  default: number;
  format: (v: number) => string;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

export const MANUAL_FIELDS: ManualFieldConfig[] = [
  {
    key: "monthlyIncome",
    label: "Average monthly income",
    hint: "Total earnings across all work in a typical month",
    min: 1000,
    max: 60000,
    step: 500,
    default: 12000,
    format: (v) => `₹${v.toLocaleString("en-IN")}`,
  },
  {
    key: "incomeConsistency",
    label: "Income consistency",
    hint: "How steady your monthly earnings are, month to month",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.6,
    format: pct,
  },
  {
    key: "digitalTransactionShare",
    label: "Digital transaction share",
    hint: "Share of the year with traceable UPI / digital payments",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
    format: pct,
  },
  {
    key: "billOnTimeRate",
    label: "Utility bill on-time rate",
    hint: "Share of electricity / mobile / rent bills paid on time",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.75,
    format: pct,
  },
  {
    key: "platformTenureMonths",
    label: "Work / platform tenure",
    hint: "Months at your current trade, platform, or employer",
    min: 0,
    max: 120,
    step: 1,
    default: 18,
    format: (v) => `${Math.round(v)} mo`,
  },
  {
    key: "customerRating",
    label: "Customer rating",
    hint: "Average rating from customers or clients, out of 5",
    min: 1,
    max: 5,
    step: 0.1,
    default: 4.2,
    format: (v) => `${v.toFixed(1)} ★`,
  },
  {
    key: "cancellationRate",
    label: "Cancellation rate",
    hint: "Share of jobs or orders cancelled or left incomplete",
    min: 0,
    max: 0.5,
    step: 0.01,
    default: 0.1,
    format: pct,
  },
  {
    key: "savingsRate",
    label: "Savings rate",
    hint: "Share of income typically kept as savings",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.2,
    format: pct,
  },
  {
    key: "debtToIncome",
    label: "Existing debt-to-income",
    hint: "Current EMI obligations relative to monthly income",
    min: 0,
    max: 3,
    step: 0.05,
    default: 0.3,
    format: (v) => `${v.toFixed(2)}×`,
  },
];

export const OCCUPATION_OPTIONS: { value: ManualProfileInputs["occupation"]; label: string }[] = [
  { value: "delivery-rider", label: "Delivery rider" },
  { value: "tailor", label: "Home-based tailor" },
  { value: "street-vendor", label: "Street vendor" },
  { value: "domestic-worker", label: "Domestic worker" },
];
