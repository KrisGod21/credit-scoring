"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FORM_FIELDS } from "@/lib/scoring/form-fields";
import type { ProfileInput } from "@/lib/scoring/types";

export function ProfileForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: ProfileInput;
  onSubmit: (values: ProfileInput) => void;
  submitting?: boolean;
}) {
  const [values, setValues] = useState<ProfileInput>(() => {
    const base: ProfileInput = {};
    for (const field of FORM_FIELDS) {
      base[field.name] = initial?.[field.name] ?? field.default;
    }
    return base;
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      {FORM_FIELDS.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
            </Label>
            <span className="font-mono text-sm tabular-nums text-primary">
              {field.format(values[field.name])}
            </span>
          </div>
          <Slider
            id={field.name}
            min={field.min}
            max={field.max}
            step={field.step}
            value={[values[field.name]]}
            onValueChange={(next) => {
              const v = Array.isArray(next) ? next[0] : next;
              setValues((prev) => ({ ...prev, [field.name]: v }));
            }}
          />
          <p className="text-xs text-muted-foreground">{field.hint}</p>
        </div>
      ))}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Stamping your passbook…" : "Calculate my score"}
      </Button>
    </form>
  );
}
