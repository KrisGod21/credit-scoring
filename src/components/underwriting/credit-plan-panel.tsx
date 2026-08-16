import type { CreditPlan } from "@/lib/underwriting/types";

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function CreditPlanPanel({ plan }: { plan: CreditPlan }) {
  if (plan.steps.length === 0) {
    return (
      <div className="surface rounded-xl px-5 py-4 text-sm text-muted-foreground">
        No further gains found from the levers we model — this profile is already close to its natural ceiling
        given current income.
      </div>
    );
  }

  const isPrerequisiteOnly = plan.steps.every((s) => s.capacityGain === 0);
  const progressPct = plan.targetMax > 0 ? Math.min(100, (plan.currentMax / plan.targetMax) * 100) : 0;

  return (
    <div className="space-y-5">
      {isPrerequisiteOnly ? (
        <div className="rounded-sm border border-dashed border-debit/40 bg-debit/5 px-4 py-3 text-sm">
          <span className="font-semibold text-debit">Not yet eligible for any amount.</span>{" "}
          <span className="text-muted-foreground">
            Monthly expenses and debt currently exceed income — the step below is the prerequisite to fix that,
            not a guarantee of credit on its own.
          </span>
        </div>
      ) : (
        <div>
          <div className="flex items-baseline justify-between font-mono text-sm">
            <span>
              Currently eligible for <strong className="text-primary">{inr(plan.currentMax)}</strong>
            </span>
            <span>
              Path to <strong className="text-credit">{inr(plan.targetMax)}</strong>
            </span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      <ol className="space-y-2">
        {plan.steps.map((step, i) => (
          <li
            key={step.action}
            className="surface flex items-start gap-3 rounded-xl px-4 py-3"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 font-mono text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{step.action}</span>
              <span className="block text-xs text-muted-foreground">{step.detail}</span>
            </span>
            {step.capacityGain > 0 && (
              <span className="shrink-0 font-mono text-sm font-semibold text-credit">
                +{inr(step.capacityGain)}
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="text-[11px] italic text-muted-foreground">
        {isPrerequisiteOnly
          ? "Once cashflow turns positive, a full step-by-step credit-building path will be available."
          : "Combined gains are diminished to account for overlap between levers — this is an estimate, not a promise."}
      </p>
    </div>
  );
}
