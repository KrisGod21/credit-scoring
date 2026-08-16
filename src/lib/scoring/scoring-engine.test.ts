import { describe, expect, it } from "vitest";
import { scoreProfile, getModelInfo } from "./scoring-engine";
import type { ProfileInput } from "./types";

// Local fixtures — scoreProfile is a low-level pure function reused inside
// the underwriting pipeline; its own tests don't need the demo personas
// (see src/lib/underwriting/passport-builder.test.ts for pipeline-level
// persona behaviour).
const disciplinedProfile: ProfileInput = {
  avg_monthly_income: 13000,
  income_consistency: 0.85,
  avg_monthly_txn_count: 20,
  txn_consistency: 0.85,
  utility_ontime_rate: 0.95,
  platform_tenure_months: 60,
  customer_rating: 4.8,
  cancellation_rate: 0.01,
  savings_rate: 0.3,
  debt_to_income: 0,
};

const strugglingProfile: ProfileInput = {
  avg_monthly_income: 7000,
  income_consistency: 0.4,
  avg_monthly_txn_count: 8,
  txn_consistency: 0.4,
  utility_ontime_rate: 0.45,
  platform_tenure_months: 12,
  customer_rating: 3.9,
  cancellation_rate: 0.2,
  savings_rate: 0.02,
  debt_to_income: 0.9,
};

describe("scoreProfile", () => {
  it("always returns a score within the configured range", () => {
    for (const profile of [disciplinedProfile, strugglingProfile]) {
      const result = scoreProfile(profile);
      expect(result.score).toBeGreaterThanOrEqual(300);
      expect(result.score).toBeLessThanOrEqual(900);
    }
  });

  it("is deterministic for the same input", () => {
    const a = scoreProfile(disciplinedProfile);
    const b = scoreProfile(disciplinedProfile);
    expect(a.score).toBe(b.score);
    expect(a.breakdown).toEqual(b.breakdown);
  });

  it("ranks a stable, low-debt, high-consistency profile above a low-consistency, high-debt one", () => {
    const stable = scoreProfile(disciplinedProfile);
    const volatile = scoreProfile(strugglingProfile);
    expect(stable.score).toBeGreaterThan(volatile.score);
  });

  it("falls back to the training mean for missing features without throwing", () => {
    const partial: ProfileInput = { avg_monthly_income: 20000 };
    expect(() => scoreProfile(partial)).not.toThrow();
    const result = scoreProfile(partial);
    expect(result.score).toBeGreaterThanOrEqual(300);
    expect(result.score).toBeLessThanOrEqual(900);
  });

  it("returns one breakdown entry per model feature, sorted by point contribution descending", () => {
    const result = scoreProfile(disciplinedProfile);
    expect(result.breakdown).toHaveLength(getModelInfo().features.length);
    for (let i = 1; i < result.breakdown.length; i++) {
      expect(result.breakdown[i - 1].points).toBeGreaterThanOrEqual(result.breakdown[i].points);
    }
  });

  it("produces at most 3 improvement tips, each with a positive potential gain", () => {
    const result = scoreProfile(strugglingProfile);
    expect(result.tips.length).toBeLessThanOrEqual(3);
    for (const tip of result.tips) {
      expect(tip.potentialPointGain).toBeGreaterThan(0);
    }
  });

  it("clamps extreme values instead of producing an out-of-range score", () => {
    const extremeGood: ProfileInput = {
      avg_monthly_income: 1_000_000,
      income_consistency: 1,
      avg_monthly_txn_count: 1000,
      txn_consistency: 1,
      utility_ontime_rate: 1,
      platform_tenure_months: 600,
      customer_rating: 5,
      cancellation_rate: 0,
      savings_rate: 1,
      debt_to_income: 0,
    };
    const result = scoreProfile(extremeGood);
    expect(result.score).toBe(900);
    expect(result.tier).toBe("Excellent");
  });

  it("assigns a profile with no data (falls back to training means) a Fair/Good tier", () => {
    // scoreProfile falls back to each feature's training mean when a key is
    // absent, so an empty input IS the "average worker" profile.
    const result = scoreProfile({});
    expect(["Fair", "Good"]).toContain(result.tier);
  });
});
