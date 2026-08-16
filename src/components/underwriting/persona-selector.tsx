"use client";

import { cn } from "@/lib/utils";
import { OccupationIcon } from "./occupation-icons";
import type { UnderwritingPersona } from "@/lib/underwriting/personas";

export function PersonaSelector({
  personas,
  selectedId,
  onSelect,
}: {
  personas: UnderwritingPersona[];
  selectedId: string | null;
  onSelect: (persona: UnderwritingPersona) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {personas.map((persona) => {
        const selected = persona.id === selectedId;
        return (
          <button
            key={persona.id}
            type="button"
            onClick={() => onSelect(persona)}
            aria-pressed={selected}
            className={cn(
              "surface surface-interactive flex items-start gap-3.5 rounded-xl px-4 py-4 text-left",
              selected && "border-primary ring-1 ring-signal/40"
            )}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <OccupationIcon occupation={persona.occupation} className="h-7 w-7" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-base font-semibold leading-tight">
                {persona.name}
              </span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {persona.role}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">{persona.blurb}</span>
              <span className="mt-1.5 block font-mono text-[11px] text-primary">
                Typically requests ₹{persona.defaultRequestedAmount.toLocaleString("en-IN")}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
