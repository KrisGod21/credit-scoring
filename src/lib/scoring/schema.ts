import { z } from "zod";

/**
 * Realistic bounds for each alt-data feature. Wider than the training
 * distribution's min/max so legitimate edge-case profiles aren't rejected,
 * but tight enough to catch garbage/malicious input.
 */
export const profileSchema = z.object({
  avg_monthly_income: z.number().min(500).max(200_000),
  income_consistency: z.number().min(0).max(1),
  avg_monthly_txn_count: z.number().min(0).max(1000),
  txn_consistency: z.number().min(0).max(1),
  utility_ontime_rate: z.number().min(0).max(1),
  platform_tenure_months: z.number().min(0).max(600),
  customer_rating: z.number().min(1).max(5),
  cancellation_rate: z.number().min(0).max(1),
  savings_rate: z.number().min(0).max(1),
  debt_to_income: z.number().min(0).max(10),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
