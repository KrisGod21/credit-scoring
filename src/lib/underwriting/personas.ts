import { OCCUPATION_PROFILES } from "./occupation-profiles";
import { generateTransactionHistory } from "./transaction-generator";
import type { Occupation, TransactionHistory } from "./types";

export interface UnderwritingPersona {
  id: string;
  name: string;
  role: string;
  occupation: Occupation;
  blurb: string;
  defaultRequestedAmount: number;
  defaultTenureMonths: number;
}

export const UNDERWRITING_PERSONAS: UnderwritingPersona[] = [
  {
    id: "delivery-rider",
    name: "Arjun",
    role: "Food Delivery Rider",
    occupation: "delivery-rider",
    blurb: "Two platforms, mostly weekday shifts, festive-season earnings spike.",
    defaultRequestedAmount: 4000,
    defaultTenureMonths: 6,
  },
  {
    id: "tailor",
    name: "Meena",
    role: "Home-Based Tailor",
    occupation: "tailor",
    blurb: "Loyal repeat customers, big wedding-season orders, lean monsoon months.",
    defaultRequestedAmount: 1200,
    defaultTenureMonths: 8,
  },
  {
    id: "street-vendor",
    name: "Ramesh",
    role: "Street Food Vendor",
    occupation: "street-vendor",
    blurb: "Mostly cash sales, no formal bank relationship, long-established pitch.",
    defaultRequestedAmount: 5000,
    defaultTenureMonths: 6,
  },
  {
    id: "domestic-worker",
    name: "Lakshmi",
    role: "Domestic Worker",
    occupation: "domestic-worker",
    blurb: "Same three households for years, disciplined saver.",
    defaultRequestedAmount: 12000,
    defaultTenureMonths: 10,
  },
];

export function getHistoryForPersona(persona: UnderwritingPersona, referenceDate?: Date): TransactionHistory {
  return generateTransactionHistory(
    persona.id,
    persona.occupation,
    OCCUPATION_PROFILES[persona.occupation],
    referenceDate
  );
}
