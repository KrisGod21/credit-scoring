import Link from "next/link";
import { PageShell } from "@/components/passbook/page-shell";
import { LenderApplicantCard } from "@/components/underwriting/lender-applicant-card";
import { RevealGroup, RevealItem } from "@/components/motion/primitives";
import { UNDERWRITING_PERSONAS, getHistoryForPersona } from "@/lib/underwriting/personas";
import { buildFinancialPassport } from "@/lib/underwriting/passport-builder";

export default function LenderPage() {
  const applicants = UNDERWRITING_PERSONAS.map((persona) => {
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

  const totalSafe = applicants.reduce((sum, a) => sum + a.passport.underwriting.recommendedCreditMax, 0);
  const readyCount = applicants.filter((a) => a.passport.underwriting.verdict !== "NOT_READY").length;

  return (
    <PageShell className="max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">Lender mode</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
            Applicant queue
          </h1>
          <p className="mt-3 max-w-md text-[15px] text-muted-foreground">
            Four thin-file applicants. Read each in under thirty seconds.
          </p>
        </div>

        <dl className="flex gap-10">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Lendable</dt>
            <dd className="tabular mt-1 font-display text-2xl font-semibold text-signal">
              ₹{totalSafe.toLocaleString("en-IN")}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ready</dt>
            <dd className="tabular mt-1 font-display text-2xl font-semibold text-foreground">
              {readyCount}
              <span className="text-muted-foreground">/{applicants.length}</span>
            </dd>
          </div>
        </dl>
      </div>

      <RevealGroup className="mt-12 space-y-4">
        {applicants.map(({ persona, passport }) => (
          <RevealItem key={persona.id}>
            <LenderApplicantCard persona={persona} passport={passport} />
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="mt-10 text-[13px] text-muted-foreground">
        Synthetic applicants, not real borrowers.{" "}
        <Link href="/insights" className="text-signal underline underline-offset-4 hover:text-foreground">
          Read the methodology
        </Link>
        .
      </p>
    </PageShell>
  );
}
