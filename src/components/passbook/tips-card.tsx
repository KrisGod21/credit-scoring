import type { ImprovementTip } from "@/lib/scoring/types";

export function TipsCard({ tips }: { tips: ImprovementTip[] }) {
  if (tips.length === 0) return null;

  return (
    <div className="relative rounded-sm border border-dashed border-paper-line bg-card px-5 py-4">
      <span className="absolute -top-3 left-4 bg-card px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Manager&rsquo;s note
      </span>
      <p className="mb-2 text-sm text-muted-foreground">Ways to raise your score:</p>
      <ul className="space-y-1.5">
        {tips.map((tip) => (
          <li key={tip.feature} className="flex items-baseline justify-between gap-3 text-sm">
            <span>{tip.message}</span>
            <span className="shrink-0 font-mono text-xs font-semibold text-credit">
              +{tip.potentialPointGain} pts
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
