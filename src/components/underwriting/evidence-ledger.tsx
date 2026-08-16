"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceTag } from "./source-tag";
import type { EvidenceMetric } from "@/lib/underwriting/types";

const IMPACT_STYLE: Record<EvidenceMetric["impact"], string> = {
  positive: "text-credit",
  negative: "text-debit",
  neutral: "text-muted-foreground",
};

const IMPACT_SIGN: Record<EvidenceMetric["impact"], string> = {
  positive: "+",
  negative: "−",
  neutral: "•",
};

export function EvidenceLedger({ evidence }: { evidence: EvidenceMetric[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="surface overflow-hidden rounded-xl">
      <ul>
        {evidence.map((item) => {
          const isOpen = expanded === item.key;
          return (
            <li key={item.key} className="border-b border-hairline last:border-b-0">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : item.key)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer hover:bg-accent/60"
                aria-expanded={isOpen}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={cn("font-mono text-sm font-bold", IMPACT_STYLE[item.impact])}>
                    {IMPACT_SIGN[item.impact]}
                  </span>
                  <span className="truncate text-sm">{item.label}</span>
                  <SourceTag source={item.source} className="hidden sm:inline-flex" />
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={cn("font-mono text-sm font-semibold", IMPACT_STYLE[item.impact])}>
                    {item.value}
                  </span>
                  <ChevronDown
                    className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                  />
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-dashed border-hairline bg-accent/50 px-4 py-3 text-sm text-muted-foreground">
                  <div className="mb-1.5 sm:hidden">
                    <SourceTag source={item.source} />
                  </div>
                  {item.explanation}
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground/70">
                    ({Math.round(item.confidence * 100)}% confidence)
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
