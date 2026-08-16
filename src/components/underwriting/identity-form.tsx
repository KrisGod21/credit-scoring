"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MANUAL_FIELDS, OCCUPATION_OPTIONS } from "@/lib/underwriting/manual-form-fields";
import type { ManualProfileInputs } from "@/lib/underwriting/occupation-profiles";

type Values = Omit<ManualProfileInputs, "occupation">;

function defaultValues(): Values {
  const base = {} as Values;
  for (const field of MANUAL_FIELDS) {
    (base as Record<string, number>)[field.key] = field.default;
  }
  return base;
}

export function IdentityForm({
  submitting,
  onSubmit,
}: {
  submitting?: boolean;
  onSubmit: (values: ManualProfileInputs) => void;
}) {
  const [occupation, setOccupation] = useState<ManualProfileInputs["occupation"]>("delivery-rider");
  const [values, setValues] = useState<Values>(defaultValues);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ occupation, ...values });
      }}
    >
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Occupation</Label>
        <Select value={occupation} onValueChange={(v) => setOccupation(v as ManualProfileInputs["occupation"])}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: ManualProfileInputs["occupation"]) =>
                OCCUPATION_OPTIONS.find((opt) => opt.value === value)?.label ?? value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {OCCUPATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Sets the income-source mix and seasonal pattern used to shape your synthetic history.
        </p>
      </div>

      {MANUAL_FIELDS.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <Label className="text-sm font-medium">{field.label}</Label>
            <span className="font-mono text-sm tabular-nums text-primary">{field.format(values[field.key])}</span>
          </div>
          <Slider
            min={field.min}
            max={field.max}
            step={field.step}
            value={[values[field.key]]}
            onValueChange={(next) => {
              const v = Array.isArray(next) ? next[0] : next;
              setValues((prev) => ({ ...prev, [field.key]: v }));
            }}
          />
          <p className="text-xs text-muted-foreground">{field.hint}</p>
        </div>
      ))}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Building your passport…" : "Build my Financial Passport"}
      </Button>
    </form>
  );
}
