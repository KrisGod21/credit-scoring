"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { OccupationIcon } from "./occupation-icons";
import { CountUp } from "./count-up";
import { CashflowField } from "./cashflow-field";
import { SPRING } from "@/components/motion/primitives";
import type { FinancialPassport } from "@/lib/underwriting/types";
import type { UnderwritingPersona } from "@/lib/underwriting/personas";

export interface PreviewEntry {
  persona: UnderwritingPersona;
  passport: FinancialPassport;
}

const ROTATE_MS = 6500;

const VERDICT = {
  APPROVED: { label: "Approved", tone: "text-credit", dot: "bg-credit" },
  PARTIAL: { label: "Partial", tone: "text-signal", dot: "bg-signal" },
  NOT_READY: { label: "Not ready", tone: "text-debit", dot: "bg-debit" },
} as const;

export function HeroPassportPreview({ entries }: { entries: PreviewEntry[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % entries.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, entries.length]);

  const { persona, passport } = entries[index];
  const { underwriting, cashflow } = passport;
  const verdict = VERDICT[underwriting.verdict];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Twelve months of real cashflow, bleeding off the right edge. */}
      <div className="relative h-[300px] w-full sm:h-[380px] lg:h-[440px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={persona.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CashflowField months={passport.transactionHistory.months} className="h-full w-full" />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{passport.transactionHistory.months[0].label}</span>
          <span>{passport.transactionHistory.months.at(-1)!.label}</span>
        </div>
      </div>

      {/* The decision, sitting over its own evidence. */}
      <motion.div
        className="surface-raised relative -mt-16 ml-0 w-full rounded-xl p-5 sm:-mt-20 sm:ml-8 sm:w-[26rem] sm:p-6"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-credit opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-credit" />
            </span>
            Live decision
          </span>
          <span className={cn("flex items-center gap-1.5 font-mono text-[11px] font-medium", verdict.tone)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", verdict.dot)} />
            {verdict.label}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-signal">
                <OccupationIcon occupation={persona.occupation} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[15px] font-semibold leading-tight">{persona.name}</p>
                <p className="truncate text-[12px] text-muted-foreground">{persona.role}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Median</p>
                <p className="tabular font-mono text-[13px] text-foreground">
                  ₹{cashflow.medianMonthlyIncome.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-hairline pt-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Safe to lend
                </p>
                <p className="tabular mt-0.5 font-display text-2xl font-semibold text-signal">
                  <CountUp value={underwriting.recommendedCreditMax} prefix="₹" />
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Data confidence
                </p>
                <p className="tabular mt-0.5 font-display text-2xl font-semibold text-foreground">
                  {Math.round(underwriting.dataConfidence * 100)}%
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex items-center gap-1.5">
          {entries.map((e, i) => (
            <button
              key={e.persona.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${e.persona.name}`}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-signal" : "w-3 bg-hairline hover:bg-muted-foreground"
              )}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
