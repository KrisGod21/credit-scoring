import { PageShell } from "@/components/passbook/page-shell";
import { FeatureImportanceChart } from "@/components/passbook/feature-importance-chart";
import { getModelInfo } from "@/lib/scoring/scoring-engine";

export default function InsightsPage() {
  const model = getModelInfo();
  const { logisticRegression, randomForestBenchmark, datasetSize, defaultRate } = model.metrics;

  return (
    <PageShell>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-seal">Audit certificate</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">How the model works</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
        We chose an explainable model on purpose. A credit decision that
        cannot be explained to the person it affects is not a fair one — so
        every score on this site is exact, traceable arithmetic, not a
        black-box guess.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Training profiles" value={datasetSize.toLocaleString("en-IN")} />
        <Stat label="Test AUC (deployed)" value={logisticRegression.auc.toFixed(3)} accent="credit" />
        <Stat label="Test AUC (RF benchmark)" value={randomForestBenchmark.auc.toFixed(3)} />
        <Stat label="Default rate in data" value={`${Math.round(defaultRate * 100)}%`} />
      </div>

      <div className="mt-10 rounded-sm border border-dashed border-paper-line bg-card px-5 py-4 text-sm text-muted-foreground">
        The deployed <strong className="text-foreground">Logistic Regression</strong> scorecard
        scores <strong className="text-credit">{logisticRegression.auc.toFixed(3)} AUC</strong> on
        held-out data — matching or beating a black-box{" "}
        <strong className="text-foreground">Random Forest</strong> benchmark trained on the same
        data ({randomForestBenchmark.auc.toFixed(3)} AUC). Choosing transparency here costs
        nothing in accuracy.
      </div>

      <section className="mt-12">
        <h2 className="mb-1 font-display text-2xl font-semibold">Factor weights</h2>
        <p className="mb-6 max-w-xl text-sm text-muted-foreground">
          Standardized coefficients from the trained model. Positive weights
          push a score up; negative weights pull it down. This is the same
          math behind every ledger entry you see on a scored passbook.
        </p>
        <FeatureImportanceChart rows={model.features.map((f) => ({ label: f.label, coefficient: f.coefficient }))} />
      </section>

      <section className="mt-12 border-t border-paper-line pt-8">
        <h2 className="mb-3 font-display text-2xl font-semibold">Data &amp; methodology</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            No public dataset captures alt-data signals for informal workers
            at this granularity, so training data is synthetic: {" "}
            {datasetSize.toLocaleString("en-IN")} profiles generated from
            realistic feature distributions, with a default-risk label
            derived from a domain-weighted combination of those features plus
            noise — the same approach used in published gig-economy credit
            scoring research.
          </p>
          <p>
            Features are standardized and fit with L2-regularized logistic
            regression, then mapped from log-odds onto a familiar 300–900
            point scale. Each feature&rsquo;s contribution to a given score is
            the literal product of its coefficient and standardized value —
            not an approximation.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "credit";
}) {
  return (
    <div className="rounded-sm border border-paper-line bg-card px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${accent === "credit" ? "text-credit" : ""}`}>
        {value}
      </p>
    </div>
  );
}
