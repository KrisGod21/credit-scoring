import { computeRepaymentCapacity } from "./underwriting-engine";
import type { CashflowProfile, StressScenarioId, StressTestResult, StressVerdict } from "./types";

interface ScenarioDef {
  id: StressScenarioId;
  label: string;
  description: string;
  perturb: (cashflow: CashflowProfile) => number; // returns stressed monthly surplus
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: "income-drop-20",
    label: "20% income drop",
    description: "A broad slowdown cuts monthly income by a fifth.",
    perturb: (c) => {
      const stressedIncome = c.medianMonthlyIncome * 0.8;
      const expenses = c.medianMonthlyIncome - c.monthlySurplus;
      return stressedIncome - expenses;
    },
  },
  {
    id: "lose-top-source",
    label: "Loses largest income source",
    description: "The single biggest income stream disappears for a month.",
    perturb: (c) => c.monthlySurplus - c.medianMonthlyIncome * c.incomeConcentration,
  },
  {
    id: "one-bad-month",
    label: "One month of reduced work",
    description: "Illness, weather, or a slow patch halves one month's work.",
    // A one-off event, not a permanent hit — its cost is amortized across a
    // ~6-month recovery window when judging ongoing monthly capacity.
    perturb: (c) => c.monthlySurplus - (c.medianMonthlyIncome * 0.5) / 6,
  },
  {
    id: "shock-expense-10k",
    label: "Surprise expense",
    description: "A medical bill, repair, or family emergency hits without warning.",
    perturb: (c) => {
      const shock = Math.min(10000, c.medianMonthlyIncome * 0.8);
      return c.monthlySurplus - shock / 6;
    },
  },
];

export function runStressTests(params: {
  cashflow: CashflowProfile;
  probabilityGood: number;
  dataConfidence: number;
  impliedEmi: number;
}): StressTestResult[] {
  const { cashflow, probabilityGood, dataConfidence, impliedEmi } = params;
  const baseCapacity = computeRepaymentCapacity(cashflow.monthlySurplus, probabilityGood, dataConfidence);

  return SCENARIOS.map((scenario) => {
    const stressedSurplus = scenario.perturb(cashflow);
    const stressedCapacity = computeRepaymentCapacity(stressedSurplus, probabilityGood, dataConfidence);
    const coverageRatio = impliedEmi > 0 ? stressedCapacity / impliedEmi : stressedCapacity > 0 ? 2 : 0;

    let verdict: StressVerdict;
    if (coverageRatio >= 1) verdict = "SAFE";
    else if (coverageRatio >= 0.6) verdict = "WARNING";
    else verdict = "UNSAFE";

    return {
      scenario: scenario.id,
      label: scenario.label,
      description: scenario.description,
      baseCapacity: Math.round(baseCapacity),
      stressedCapacity: Math.round(Math.max(0, stressedCapacity)),
      coverageRatio,
      verdict,
    };
  });
}
