"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { RiskTier } from "@/lib/underwriting/types";

const TIER_COLOR: Record<RiskTier, string> = {
  LOW: "var(--credit)",
  MODERATE: "var(--signal)",
  HIGH: "var(--debit)",
};

export function RiskGauge({
  value,
  tier,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  className,
}: {
  value: number; // 0-100
  tier: RiskTier;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const color = TIER_COLOR[tier];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduced ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <span className="font-display text-lg font-semibold leading-none">{label}</span>}
        {sublabel && (
          <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
