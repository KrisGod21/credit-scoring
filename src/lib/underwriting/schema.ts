import { z } from "zod";

export const occupationSchema = z.enum([
  "delivery-rider",
  "tailor",
  "street-vendor",
  "domestic-worker",
]);

export const manualProfileSchema = z.object({
  occupation: occupationSchema,
  monthlyIncome: z.number().min(1000).max(200_000),
  incomeConsistency: z.number().min(0).max(1),
  digitalTransactionShare: z.number().min(0).max(1),
  billOnTimeRate: z.number().min(0).max(1),
  platformTenureMonths: z.number().min(0).max(600),
  customerRating: z.number().min(1).max(5),
  cancellationRate: z.number().min(0).max(1),
  savingsRate: z.number().min(0).max(1),
  debtToIncome: z.number().min(0).max(10),
});

export const underwriteRequestSchema = z
  .object({
    personaId: z.string().optional(),
    manual: manualProfileSchema.optional(),
    requestedAmount: z.number().min(1000).max(2_000_000),
    tenureMonths: z.number().min(1).max(60),
  })
  .refine((d) => Boolean(d.personaId) || Boolean(d.manual), {
    message: "Provide either personaId or manual profile inputs.",
  });

export const whatIfSchema = z.object({
  avg_monthly_income: z.number(),
  income_consistency: z.number(),
  avg_monthly_txn_count: z.number(),
  txn_consistency: z.number(),
  utility_ontime_rate: z.number(),
  platform_tenure_months: z.number(),
  customer_rating: z.number(),
  cancellation_rate: z.number(),
  savings_rate: z.number(),
  debt_to_income: z.number(),
  monthlySurplus: z.number(),
  tenureMonths: z.number().min(1).max(60),
  dataConfidence: z.number().min(0).max(1),
});
