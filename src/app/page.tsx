import Link from "next/link";
import { PageShell } from "@/components/passbook/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { PERSONAS } from "@/lib/scoring/personas";

const STEPS = [
  {
    n: "01",
    title: "Tell us about your work",
    body: "Pick a sample worker or enter your own income, transaction, and payment habits — the data you already generate.",
  },
  {
    n: "02",
    title: "We total the ledger",
    body: "A trained, transparent model converts those habits into a 300–900 score — the same scale banks already use.",
  },
  {
    n: "03",
    title: "You see exactly why",
    body: "Every point is traced to a factor. No black box, no hidden reasons — a real, itemised statement.",
  },
];

export default function Home() {
  return (
    <PageShell>
      <section className="pt-4 pb-14 sm:pt-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-seal">
          Omni_FinTech_2 · Financial inclusion
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.08] sm:text-6xl">
          Everyone keeps a ledger.
          <br />
          <span className="italic">Now yours counts.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Gig and informal-sector workers earn steady income but get turned away
          by lenders for having no formal credit history. Passbook reads the
          record they already keep — transactions, bill payments, work
          tenure — and turns it into a fair, fully explainable credit score.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/passbook" className={buttonVariants({ size: "lg" })}>
            Open my passbook →
          </Link>
          <Link
            href="/insights"
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            How the model works
          </Link>
        </div>
        <p className="mt-8 font-mono text-[11px] text-muted-foreground">
          Trained on 10,000 synthetic worker profiles · test AUC 0.98 · fully
          explainable scorecard, not a black box.
        </p>
      </section>

      <section className="border-t border-paper-line py-12">
        <h2 className="mb-8 font-display text-2xl font-semibold">How a passbook gets stamped</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n}>
              <span className="font-mono text-sm text-seal">{step.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-paper-line py-12">
        <h2 className="mb-6 font-display text-2xl font-semibold">Four account holders</h2>
        <p className="mb-6 max-w-xl text-sm text-muted-foreground">
          None of these people would clear a traditional credit check. See what
          their passbooks actually say.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PERSONAS.map((persona) => (
            <Link
              key={persona.id}
              href="/passbook"
              className="rounded-sm border border-paper-line bg-card px-3 py-4 text-center transition-colors hover:border-primary/50"
            >
              <span className="block text-2xl">{persona.emoji}</span>
              <span className="mt-2 block font-display text-sm font-semibold">{persona.name}</span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {persona.role}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
