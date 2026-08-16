"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function LoanRequestControls({
  amount,
  tenureMonths,
  onAmountChange,
  onTenureChange,
}: {
  amount: number;
  tenureMonths: number;
  onAmountChange: (v: number) => void;
  onTenureChange: (v: number) => void;
}) {
  return (
    <div className="surface grid grid-cols-1 gap-5 rounded-xl px-5 py-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Label className="text-sm font-medium">Requested loan amount</Label>
          <span className="font-mono text-sm font-semibold tabular-nums text-primary">
            ₹{amount.toLocaleString("en-IN")}
          </span>
        </div>
        <Slider
          min={2000}
          max={150000}
          step={1000}
          value={[amount]}
          onValueChange={(next) => onAmountChange(Array.isArray(next) ? next[0] : next)}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Label className="text-sm font-medium">Repayment tenure</Label>
          <span className="font-mono text-sm font-semibold tabular-nums text-primary">
            {tenureMonths} months
          </span>
        </div>
        <Slider
          min={1}
          max={24}
          step={1}
          value={[tenureMonths]}
          onValueChange={(next) => onTenureChange(Array.isArray(next) ? next[0] : next)}
        />
      </div>
    </div>
  );
}
