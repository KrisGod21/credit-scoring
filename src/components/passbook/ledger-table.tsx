import { cn } from "@/lib/utils";
import type { FeatureContribution } from "@/lib/scoring/types";

export function LedgerTable({ breakdown }: { breakdown: FeatureContribution[] }) {
  const credits = breakdown.filter((b) => b.direction === "positive");
  const debits = breakdown.filter((b) => b.direction === "negative");

  return (
    <div className="overflow-hidden rounded-sm border border-paper-line bg-card">
      <div className="grid grid-cols-1 divide-y divide-paper-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <LedgerColumn title="Credit" sign="+" tone="credit" rows={credits} />
        <LedgerColumn title="Debit" sign="−" tone="debit" rows={debits} />
      </div>
    </div>
  );
}

function LedgerColumn({
  title,
  sign,
  tone,
  rows,
}: {
  title: string;
  sign: string;
  tone: "credit" | "debit";
  rows: FeatureContribution[];
}) {
  return (
    <div>
      <div
        className={cn(
          "border-b border-paper-line px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em]",
          tone === "credit" ? "text-credit" : "text-debit"
        )}
      >
        {title} ({sign})
      </div>
      <ul>
        {rows.length === 0 && (
          <li className="px-4 py-3 text-xs italic text-muted-foreground">No entries</li>
        )}
        {rows.map((row) => (
          <li
            key={row.name}
            className="flex items-baseline justify-between gap-3 border-b border-paper-line/60 px-4 py-2.5 last:border-b-0"
          >
            <span className="text-sm">{row.label}</span>
            <span
              className={cn(
                "shrink-0 font-mono text-sm font-semibold tabular-nums",
                tone === "credit" ? "text-credit" : "text-debit"
              )}
            >
              {sign}
              {Math.abs(row.points)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
