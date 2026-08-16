"use client";

import { motion, useReducedMotion } from "motion/react";
import type { TransactionMonth } from "@/lib/underwriting/types";

/**
 * The signature visual: twelve months of real income and expense drawn as a
 * mirrored column field. This is not decoration standing in for a product
 * shot — it is the exact series the Cashflow Intelligence Engine reads to
 * reach a decision, so the hero shows the thing the product actually does.
 */
export function CashflowField({
  months,
  className,
}: {
  months: TransactionMonth[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const peak = Math.max(...months.map((m) => Math.max(m.income, m.expenses)), 1);

  return (
    <div className={className} aria-hidden>
      <div className="flex h-full w-full items-center gap-[2.2%]">
        {months.map((month, i) => {
          const incomeH = (month.income / peak) * 100;
          const expenseH = (month.expenses / peak) * 100;
          const surplus = month.income - month.expenses;

          return (
            <div key={month.monthIndex} className="flex h-full flex-1 flex-col justify-center gap-[3px]">
              {/* income, rising up from the centre line */}
              <div className="flex flex-1 items-end">
                <motion.div
                  className="w-full rounded-t-[3px]"
                  style={{
                    background:
                      surplus >= 0
                        ? "linear-gradient(180deg, color-mix(in oklab, var(--credit) 92%, transparent), color-mix(in oklab, var(--credit) 26%, transparent))"
                        : "linear-gradient(180deg, color-mix(in oklab, var(--muted-foreground) 60%, transparent), color-mix(in oklab, var(--muted-foreground) 16%, transparent))",
                  }}
                  initial={reduced ? false : { height: 0 }}
                  animate={{ height: `${incomeH}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.045 }}
                />
              </div>
              {/* expense, falling below it */}
              <div className="flex flex-1 items-start">
                <motion.div
                  className="w-full rounded-b-[3px]"
                  style={{
                    background:
                      "linear-gradient(180deg, color-mix(in oklab, var(--debit) 34%, transparent), color-mix(in oklab, var(--debit) 8%, transparent))",
                  }}
                  initial={reduced ? false : { height: 0 }}
                  animate={{ height: `${expenseH}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.045 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
