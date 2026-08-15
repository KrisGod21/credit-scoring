"use client";

import { cn } from "@/lib/utils";
import type { Persona } from "@/lib/scoring/personas";

export function PersonaPicker({
  personas,
  selectedId,
  onSelect,
}: {
  personas: Persona[];
  selectedId: string | null;
  onSelect: (persona: Persona) => void;
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
              "flex items-start gap-3 rounded-sm border bg-card px-4 py-3.5 text-left transition-all cursor-pointer",
              selected
                ? "border-primary shadow-[3px_3px_0_var(--primary)]"
                : "border-paper-line hover:border-primary/50"
            )}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-dashed border-paper-line bg-paper text-xl">
              {persona.emoji}
            </span>
            <span className="min-w-0">
              <span className="block font-display text-base font-semibold leading-tight">
                {persona.name}
              </span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {persona.role}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">{persona.blurb}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
