"use client";

import { cn } from "@/lib/utils";
import type { RiskTier } from "@/lib/scoring/types";

const TIER_STYLES: Record<RiskTier, { ring: string; text: string; bloom: string }> = {
  Poor: { ring: "border-seal", text: "text-seal", bloom: "bg-seal" },
  Fair: { ring: "border-gold", text: "text-gold", bloom: "bg-gold" },
  Good: { ring: "border-primary", text: "text-primary", bloom: "bg-primary" },
  "Very Good": { ring: "border-primary", text: "text-primary", bloom: "bg-primary" },
  Excellent: { ring: "border-credit", text: "text-credit", bloom: "bg-credit" },
};

export function StampSeal({
  score,
  tier,
  animate = true,
}: {
  score: number;
  tier: RiskTier;
  animate?: boolean;
}) {
  const style = TIER_STYLES[tier];

  return (
    <div className="relative inline-flex h-40 w-40 shrink-0 items-center justify-center sm:h-48 sm:w-48">
      {animate && (
        <span
          aria-hidden
          className={cn("absolute inset-0 rounded-full animate-ink-bloom", style.bloom)}
        />
      )}
      <div
        className={cn(
          "relative flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-full border-[3px] bg-paper/40 text-center",
          style.ring,
          style.text,
          animate && "animate-stamp-down"
        )}
        style={!animate ? { transform: "rotate(-5deg)" } : undefined}
      >
        <div className={cn("absolute inset-[7px] rounded-full border opacity-50", style.ring)} aria-hidden />
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] opacity-80 sm:text-[10px]">
          Alt. Credit Score
        </span>
        <span className="font-display text-4xl font-bold sm:text-5xl">{score}</span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] sm:text-xs">
          {tier}
        </span>
      </div>
    </div>
  );
}
