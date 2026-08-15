import { describe, expect, it } from "vitest";
import { scoreProfile, getModelInfo } from "./scoring-engine";
import { PERSONAS } from "./personas";
import type { ProfileInput } from "./types";

describe("scoreProfile", () => {
  it("always returns a score within the configured range", () => {
    for (const persona of PERSONAS) {
      const result = scoreProfile(persona.profile);
      expect(result.score).toBeGreaterThanOrEqual(300);
      expect(result.score).toBeLessThanOrEqual(900);
    }
  });

  it("is deterministic for the same input", () => {
    const a = scoreProfile(PERSONAS[0].profile);
    const b = scoreProfile(PERSONAS[0].profile);
    expect(a.score).toBe(b.score);
    expect(a.breakdown).toEqual(b.breakdown);
  });

  it("ranks a stable, low-debt, high-consistency profile above a low-consistency, high-debt one", () => {
    const domesticWorker = PERSONAS.find((p) => p.id === "domestic-worker")!;
    const streetVendor = PERSONAS.find((p) => p.id === "street-vendor")!;

    const stable = scoreProfile(domesticWorker.profile);
    const volatile = scoreProfile(streetVendor.profile);

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
    const result = scoreProfile(PERSONAS[0].profile);
    expect(result.breakdown).toHaveLength(getModelInfo().features.length);
    for (let i = 1; i < result.breakdown.length; i++) {
      expect(result.breakdown[i - 1].points).toBeGreaterThanOrEqual(result.breakdown[i].points);
    }
  });

  it("produces at most 3 improvement tips, each with a positive potential gain", () => {
    const streetVendor = PERSONAS.find((p) => p.id === "street-vendor")!;
    const result = scoreProfile(streetVendor.profile);
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
