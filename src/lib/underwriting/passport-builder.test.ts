import { describe, expect, it } from "vitest";
import { buildFinancialPassport } from "./passport-builder";
import { UNDERWRITING_PERSONAS, getHistoryForPersona } from "./personas";

function passportFor(personaId: string, requestedAmount = 30000, tenureMonths = 8) {
  const persona = UNDERWRITING_PERSONAS.find((p) => p.id === personaId)!;
  const history = getHistoryForPersona(persona);
  return buildFinancialPassport({
    applicantLabel: persona.name,
    history,
    requestedAmount,
    tenureMonths,
  });
}

describe("buildFinancialPassport", () => {
  it("produces a complete passport for every demo persona", () => {
    for (const persona of UNDERWRITING_PERSONAS) {
      const passport = passportFor(persona.id);
      expect(passport.transactionHistory.months).toHaveLength(12);
      expect(passport.evidence.length).toBeGreaterThan(0);
      expect(passport.stressTests).toHaveLength(4);
      expect(passport.underwriting.probabilityGood).toBeGreaterThanOrEqual(0);
      expect(passport.underwriting.probabilityGood).toBeLessThanOrEqual(1);
      expect(passport.underwriting.dataConfidence).toBeGreaterThanOrEqual(0);
      expect(passport.underwriting.dataConfidence).toBeLessThanOrEqual(1);
    }
  });

  it("is deterministic for the same persona", () => {
    const a = passportFor("delivery-rider");
    const b = passportFor("delivery-rider");
    expect(a.underwriting.recommendedCreditMax).toBe(b.underwriting.recommendedCreditMax);
    expect(a.transactionHistory.months[0].income).toBe(b.transactionHistory.months[0].income);
  });

  it("gives the disciplined, low-debt domestic worker more capacity than the cash-heavy street vendor", () => {
    const domestic = passportFor("domestic-worker");
    const vendor = passportFor("street-vendor");
    expect(domestic.underwriting.recommendedCreditMax).toBeGreaterThan(vendor.underwriting.recommendedCreditMax);
  });

  it("gives the street vendor lower data confidence due to low verified/digital footprint", () => {
    const domestic = passportFor("domestic-worker");
    const vendor = passportFor("street-vendor");
    expect(vendor.underwriting.dataConfidence).toBeLessThan(domestic.underwriting.dataConfidence);
  });

  it("marks a small, affordable loan as APPROVED for the strongest persona", () => {
    const domestic = passportFor("domestic-worker", 5000, 12);
    expect(domestic.underwriting.verdict).toBe("APPROVED");
  });

  it("marks a large loan as NOT_READY or PARTIAL for the weakest persona", () => {
    const vendor = passportFor("street-vendor", 200000, 6);
    expect(["PARTIAL", "NOT_READY"]).toContain(vendor.underwriting.verdict);
  });

  it("every stress scenario stays at or below the base capacity", () => {
    const passport = passportFor("tailor");
    for (const test of passport.stressTests) {
      expect(test.stressedCapacity).toBeLessThanOrEqual(test.baseCapacity + 1);
    }
  });

  it("produces a credit plan whose target is not below the current max", () => {
    const passport = passportFor("street-vendor", 60000, 6);
    expect(passport.creditPlan.targetMax).toBeGreaterThanOrEqual(passport.creditPlan.currentMax);
  });
});
