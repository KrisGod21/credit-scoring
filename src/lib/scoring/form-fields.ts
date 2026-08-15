export interface FormFieldConfig {
  name: string;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  default: number;
  format: (value: number) => string;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

export const FORM_FIELDS: FormFieldConfig[] = [
  {
    name: "avg_monthly_income",
    label: "Average monthly income",
    hint: "Total earnings across all work in a typical month",
    min: 1000,
    max: 60000,
    step: 500,
    default: 12000,
    format: (v) => `₹${v.toLocaleString("en-IN")}`,
  },
  {
    name: "income_consistency",
    label: "Income consistency",
    hint: "How steady your monthly earnings are, month to month",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.6,
    format: pct,
  },
  {
    name: "avg_monthly_txn_count",
    label: "Monthly digital transactions",
    hint: "UPI / mobile-wallet payments received or sent per month",
    min: 0,
    max: 200,
    step: 1,
    default: 40,
    format: (v) => `${Math.round(v)}`,
  },
  {
    name: "txn_consistency",
    label: "Transaction consistency",
    hint: "How regularly those digital transactions occur",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.6,
    format: pct,
  },
  {
    name: "utility_ontime_rate",
    label: "Utility bill on-time rate",
    hint: "Share of electricity / mobile / rent bills paid on time",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.75,
    format: pct,
  },
  {
    name: "platform_tenure_months",
    label: "Work / platform tenure",
    hint: "Months at your current trade, platform, or employer",
    min: 0,
    max: 120,
    step: 1,
    default: 18,
    format: (v) => `${Math.round(v)} mo`,
  },
  {
    name: "customer_rating",
    label: "Customer rating",
    hint: "Average rating from customers or clients, out of 5",
    min: 1,
    max: 5,
    step: 0.1,
    default: 4.2,
    format: (v) => `${v.toFixed(1)} ★`,
  },
  {
    name: "cancellation_rate",
    label: "Cancellation rate",
    hint: "Share of jobs or orders cancelled or left incomplete",
    min: 0,
    max: 0.5,
    step: 0.01,
    default: 0.1,
    format: pct,
  },
  {
    name: "savings_rate",
    label: "Savings rate",
    hint: "Share of income typically kept as savings",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.2,
    format: pct,
  },
  {
    name: "debt_to_income",
    label: "Existing debt-to-income",
    hint: "Current debt obligations relative to monthly income",
    min: 0,
    max: 3,
    step: 0.05,
    default: 0.5,
    format: (v) => `${v.toFixed(2)}×`,
  },
];
