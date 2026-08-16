import { cn } from "@/lib/utils";
import type { StressTestResult, StressVerdict } from "@/lib/underwriting/types";

const VERDICT_STYLE: Record<StressVerdict, { badge: string; bar: string }> = {
  SAFE: { badge: "bg-credit/10 text-credit border-credit/40", bar: "bg-credit" },
  WARNING: { badge: "bg-signal/10 text-signal border-signal/40", bar: "bg-signal" },
  UNSAFE: { badge: "bg-debit/10 text-debit border-debit/40", bar: "bg-debit" },
};

export function StressTestPanel({ results }: { results: StressTestResult[] }) {
  const maxCapacity = Math.max(1, ...results.map((r) => r.baseCapacity));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {results.map((result) => {
        const style = VERDICT_STYLE[result.verdict];
        const baseWidth = Math.min(100, (result.baseCapacity / maxCapacity) * 100);
        const stressedWidth = Math.min(100, (Math.max(0, result.stressedCapacity) / maxCapacity) * 100);

        return (
          <div key={result.scenario} className="surface rounded-xl px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-sm font-semibold">{result.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{result.description}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                  style.badge
                )}
              >
                {result.verdict}
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary/30" style={{ width: `${baseWidth}%` }} />
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", style.bar)} style={{ width: `${stressedWidth}%` }} />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
              <span>Base ₹{result.baseCapacity.toLocaleString("en-IN")}/mo</span>
              <span>Stressed ₹{Math.max(0, result.stressedCapacity).toLocaleString("en-IN")}/mo</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
