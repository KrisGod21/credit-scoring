"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { simulateUnderwriting, type WhatIfInputs } from "@/lib/underwriting/what-if";

interface Lever {
  key: keyof WhatIfInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

const LEVERS: Lever[] = [
  {
    key: "avg_monthly_income",
    label: "Monthly income",
    min: 2000,
    max: 60000,
    step: 500,
    format: (v) => `₹${v.toLocaleString("en-IN")}`,
  },
  {
    key: "debt_to_income",
    label: "Debt-to-income",
    min: 0,
    max: 2,
    step: 0.05,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  {
    key: "savings_rate",
    label: "Savings rate",
    min: 0,
    max: 1,
    step: 0.01,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  {
    key: "income_consistency",
    label: "Income consistency",
    min: 0,
    max: 1,
    step: 0.01,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  {
    key: "utility_ontime_rate",
    label: "Bill payment discipline",
    min: 0,
    max: 1,
    step: 0.01,
    format: (v) => `${Math.round(v * 100)}%`,
  },
];

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function WhatIfSimulator({ baseline }: { baseline: WhatIfInputs }) {
  const [values, setValues] = useState<WhatIfInputs>(baseline);

  const baseResult = useMemo(() => simulateUnderwriting(baseline), [baseline]);
  const liveResult = useMemo(() => simulateUnderwriting(values), [values]);

  const delta = liveResult.recommendedCreditMax - baseResult.recommendedCreditMax;
  const isDirty = JSON.stringify(values) !== JSON.stringify(baseline);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr]">
      <div className="space-y-4">
        {LEVERS.map((lever) => (
          <div key={lever.key} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <Label className="text-sm font-medium">{lever.label}</Label>
              <span className="font-mono text-sm tabular-nums text-primary">{lever.format(values[lever.key])}</span>
            </div>
            <Slider
              min={lever.min}
              max={lever.max}
              step={lever.step}
              value={[values[lever.key]]}
              onValueChange={(next) => {
                const v = Array.isArray(next) ? next[0] : next;
                setValues((prev) => ({ ...prev, [lever.key]: v }));
              }}
            />
          </div>
        ))}
        {isDirty && (
          <Button type="button" variant="outline" size="sm" onClick={() => setValues(baseline)}>
            Reset to current profile
          </Button>
        )}
      </div>

      <div className="hidden w-px bg-hairline lg:block" />

      <div className="surface space-y-3 self-start rounded-xl px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Simulated outcome</p>
        <div>
          <p className="text-xs text-muted-foreground">Recommended credit range</p>
          <p className="font-display text-2xl font-semibold text-primary">
            {inr(liveResult.recommendedCreditMin)}–{inr(liveResult.recommendedCreditMax)}
          </p>
          {delta !== 0 && (
            <p className={`mt-0.5 font-mono text-xs ${delta > 0 ? "text-credit" : "text-debit"}`}>
              {delta > 0 ? "+" : ""}
              {inr(delta)} vs. current profile
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Risk tier</p>
            <p className="font-mono text-sm font-semibold">{liveResult.riskTier}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Repayment capacity</p>
            <p className="font-mono text-sm font-semibold">{inr(liveResult.repaymentCapacityMonthly)}/mo</p>
          </div>
        </div>
        <p className="text-[11px] italic text-muted-foreground">
          A simulation, not a guaranteed future score — real approval depends on actual sustained behaviour.
        </p>
      </div>
    </div>
  );
}
