import { cn } from "@/lib/utils";
import type { DataSource } from "@/lib/underwriting/types";

const LABEL: Record<DataSource, string> = {
  verified: "Verified",
  "self-declared": "Self-declared",
  derived: "Derived",
};

const STYLE: Record<DataSource, string> = {
  verified: "border-credit/40 bg-credit/10 text-credit",
  "self-declared": "border-signal/40 bg-signal/10 text-signal",
  derived: "border-primary/30 bg-primary/5 text-primary",
};

export function SourceTag({ source, className }: { source: DataSource; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
        STYLE[source],
        className
      )}
    >
      {LABEL[source]}
    </span>
  );
}
