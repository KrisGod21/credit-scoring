import type { ProfileInput } from "./types";

export interface Persona {
  id: string;
  name: string;
  role: string;
  emoji: string;
  blurb: string;
  profile: ProfileInput;
}

export const PERSONAS: Persona[] = [
  {
    id: "delivery-rider",
    name: "Arjun",
    role: "Food Delivery Rider",
    emoji: "🛵",
    blurb: "3 platforms, mostly cash tips, steady weekday earnings.",
    profile: {
      avg_monthly_income: 16000,
      income_consistency: 0.62,
      avg_monthly_txn_count: 85,
      txn_consistency: 0.7,
      utility_ontime_rate: 0.8,
      platform_tenure_months: 14,
      customer_rating: 4.6,
      cancellation_rate: 0.08,
      savings_rate: 0.15,
      debt_to_income: 0.4,
    },
  },
  {
    id: "tailor",
    name: "Meena",
    role: "Home-Based Tailor",
    emoji: "🧵",
    blurb: "Seasonal orders around festivals, loyal repeat customers.",
    profile: {
      avg_monthly_income: 9500,
      income_consistency: 0.4,
      avg_monthly_txn_count: 20,
      txn_consistency: 0.45,
      utility_ontime_rate: 0.7,
      platform_tenure_months: 36,
      customer_rating: 4.3,
      cancellation_rate: 0.05,
      savings_rate: 0.2,
      debt_to_income: 0.6,
    },
  },
  {
    id: "street-vendor",
    name: "Ramesh",
    role: "Street Food Vendor",
    emoji: "🍲",
    blurb: "Mostly cash sales, no formal bank relationship, 5 years at the same spot.",
    profile: {
      avg_monthly_income: 7000,
      income_consistency: 0.35,
      avg_monthly_txn_count: 8,
      txn_consistency: 0.3,
      utility_ontime_rate: 0.5,
      platform_tenure_months: 60,
      customer_rating: 4.0,
      cancellation_rate: 0.02,
      savings_rate: 0.08,
      debt_to_income: 1.1,
    },
  },
  {
    id: "domestic-worker",
    name: "Lakshmi",
    role: "Domestic Worker",
    emoji: "🏠",
    blurb: "6 years with the same three households, disciplined saver.",
    profile: {
      avg_monthly_income: 12000,
      income_consistency: 0.85,
      avg_monthly_txn_count: 30,
      txn_consistency: 0.8,
      utility_ontime_rate: 0.95,
      platform_tenure_months: 72,
      customer_rating: 4.8,
      cancellation_rate: 0.01,
      savings_rate: 0.35,
      debt_to_income: 0.2,
    },
  },
];
