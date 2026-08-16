import Link from "next/link";
import { PageShell } from "@/components/passbook/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { OccupationIcon } from "@/components/underwriting/occupation-icons";
import { AnimatedHeadline, Reveal, RevealGroup, RevealItem } from "@/components/motion/primitives";
import { HeroPassportPreview, type PreviewEntry } from "@/components/underwriting/hero-passport-preview";
import { UNDERWRITING_PERSONAS, getHistoryForPersona } from "@/lib/underwriting/personas";
import { buildFinancialPassport } from "@/lib/underwriting/passport-builder";

const STAGES = [
  { k: "Evidence", v: "12 months of transactions, tagged by source." },
  { k: "Cashflow", v: "Income, volatility and discipline, computed." },
  { k: "Decision", v: "Risk, capacity, and a lending range." },
  { k: "Stress test", v: "Four shocks. Does it still hold?" },
  { k: "Plan", v: "If not yet — exactly what closes the gap." },
];

export default function Home() {
  const entries: PreviewEntry[] = UNDERWRITING_PERSONAS.map((persona) => {
    const history = getHistoryForPersona(persona);
    return {
      persona,
      passport: buildFinancialPassport({
        applicantLabel: `${persona.name} · ${persona.role}`,
        history,
        requestedAmount: persona.defaultRequestedAmount,
        tenureMonths: persona.defaultTenureMonths,
      }),
    };
  });

  const ramesh = entries.find((e) => e.persona.id === "street-vendor")!;

  return (
    <PageShell bleed>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="ambient-warm" aria-hidden />
        <div className="mx-auto grid w-full max-w-[1560px] grid-cols-1 items-center gap-14 px-6 pt-16 pb-24 sm:px-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-10 lg:px-14 lg:pt-24 lg:pb-32">
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
              <span className="h-px w-8 bg-signal/50" />
              Omni_FinTech_2
            </div>

            <AnimatedHeadline
              text="Steady income. No credit history."
              className="mt-6 max-w-[13ch] font-display text-[clamp(2.75rem,6.2vw,5.25rem)] font-bold leading-[0.98] tracking-[-0.035em] text-balance"
            />

            <p className="mt-7 max-w-md text-[17px] leading-relaxed text-muted-foreground text-pretty">
              India&rsquo;s riders, tailors, vendors and domestic workers earn every month and still get refused.
              Passbook reads the money they actually move and tells a lender what&rsquo;s safe to lend.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/passbook" className={buttonVariants({ size: "lg" })}>
                Score a worker
              </Link>
              <Link
                href="/lender"
                className="group inline-flex items-center gap-1.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Open lender view
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
              </Link>
            </div>

            <dl className="mt-14 flex flex-wrap gap-x-10 gap-y-5">
              {[
                ["0.97", "test AUC"],
                ["10", "cashflow signals"],
                ["0", "protected attributes used"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="tabular font-display text-2xl font-semibold text-foreground">{n}</dt>
                  <dd className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative z-10 lg:-mr-14 xl:-mr-24">
            <HeroPassportPreview entries={entries} />
          </div>
        </div>
      </section>

      <hr className="rule-fade" />

      {/* ── The pipeline, as a typed list rather than a card row ──────── */}
      <section className="mx-auto w-full max-w-[1560px] px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
          <Reveal>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-balance">
              A score is an opinion. This is a decision.
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Five stages, each one auditable. Nothing here is a number the applicant can&rsquo;t question.
            </p>
          </Reveal>

          <RevealGroup className="divide-y divide-hairline border-t border-hairline">
            {STAGES.map((s, i) => (
              <RevealItem key={s.k}>
                <div className="group grid grid-cols-[2.5rem_minmax(0,10rem)_1fr] items-baseline gap-4 py-5 transition-colors hover:bg-surface/40">
                  <span className="tabular font-mono text-[11px] text-signal/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[15px] font-semibold">{s.k}</span>
                  <span className="text-[14px] text-muted-foreground">{s.v}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <hr className="rule-fade" />

      {/* ── One worker, in full ──────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1560px] px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
        <Reveal className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">Worked example</p>
            <h2 className="mt-5 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-balance">
              Ramesh isn&rsquo;t rejected. He&rsquo;s told what to fix.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Years at the same spot, real daily sales — but supplier debt eats his surplus. Passbook names
              that as the blocker, prices what clearing it unlocks, and shows the lender the same evidence.
            </p>
            <Link
              href="/passbook"
              className="group mt-7 inline-flex items-center gap-1.5 text-[14px] text-signal transition-colors hover:text-foreground"
            >
              Walk through his passport
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
            </Link>
          </div>

          <div className="surface rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent text-signal">
                <OccupationIcon occupation={ramesh.persona.occupation} className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-[15px] font-semibold leading-tight">{ramesh.persona.name}</p>
                <p className="text-[12px] text-muted-foreground">{ramesh.persona.role}</p>
              </div>
            </div>

            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-hairline pt-6 sm:grid-cols-3">
              {[
                ["Median income", `₹${ramesh.passport.cashflow.medianMonthlyIncome.toLocaleString("en-IN")}`, ""],
                [
                  "Monthly surplus",
                  `₹${ramesh.passport.cashflow.monthlySurplus.toLocaleString("en-IN")}`,
                  ramesh.passport.cashflow.monthlySurplus < 0 ? "text-debit" : "text-credit",
                ],
                [
                  "Debt burden",
                  `${Math.round(ramesh.passport.cashflow.debtToIncomeRatio * 100)}%`,
                  "text-debit",
                ],
                ["Bills on time", `${Math.round(ramesh.passport.cashflow.recurringPaymentDiscipline * 100)}%`, ""],
                ["Years trading", `${Math.round(ramesh.passport.transactionHistory.platformTenureMonths / 12)}`, ""],
                [
                  "Data confidence",
                  `${Math.round(ramesh.passport.underwriting.dataConfidence * 100)}%`,
                  "",
                ],
              ].map(([label, value, tone]) => (
                <div key={label}>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {label}
                  </dt>
                  <dd className={`tabular mt-1 font-display text-lg font-semibold ${tone || "text-foreground"}`}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </section>

      <hr className="rule-fade" />

      {/* ── The four ─────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1560px] px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
        <Reveal>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
            Four people no bureau can see
          </h2>
        </Reveal>

        <RevealGroup className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {entries.map(({ persona, passport }) => (
            <RevealItem key={persona.id}>
              <Link
                href="/passbook"
                className="group flex h-full flex-col justify-between bg-surface p-6 transition-colors duration-300 hover:bg-surface-raised"
              >
                <div>
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-signal transition-transform duration-300 group-hover:-translate-y-0.5">
                    <OccupationIcon occupation={persona.occupation} className="h-5 w-5" />
                  </span>
                  <p className="mt-4 font-display text-[15px] font-semibold">{persona.name}</p>
                  <p className="text-[12px] text-muted-foreground">{persona.role}</p>
                </div>
                <div className="mt-8 border-t border-hairline pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Safe to lend
                  </p>
                  <p className="tabular mt-1 font-display text-xl font-semibold text-signal">
                    ₹{passport.underwriting.recommendedCreditMax.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </PageShell>
  );
}
