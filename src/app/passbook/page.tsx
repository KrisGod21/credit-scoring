"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/passbook/page-shell";
import { PersonaSelector } from "@/components/underwriting/persona-selector";
import { IdentityForm } from "@/components/underwriting/identity-form";
import { LoanRequestControls } from "@/components/underwriting/loan-request-controls";
import { TransactionTimeline } from "@/components/underwriting/transaction-timeline";
import { CashflowStatsGrid } from "@/components/underwriting/cashflow-stats-grid";
import { PassportRadar } from "@/components/underwriting/passport-radar";
import { VerdictCard } from "@/components/underwriting/verdict-card";
import { EvidenceLedger } from "@/components/underwriting/evidence-ledger";
import { StressTestPanel } from "@/components/underwriting/stress-test-panel";
import { WhatIfSimulator } from "@/components/underwriting/what-if-simulator";
import { CreditPlanPanel } from "@/components/underwriting/credit-plan-panel";
import { Enter as FadeIn } from "@/components/motion/primitives";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { UNDERWRITING_PERSONAS, type UnderwritingPersona } from "@/lib/underwriting/personas";
import { cashflowToModelFeatures } from "@/lib/underwriting/cashflow-engine";
import type { ManualProfileInputs } from "@/lib/underwriting/occupation-profiles";
import type { FinancialPassport } from "@/lib/underwriting/types";
import type { WhatIfInputs } from "@/lib/underwriting/what-if";

export default function PassbookPage() {
  const [selectedPersona, setSelectedPersona] = useState<UnderwritingPersona | null>(null);
  const [lastManualInput, setLastManualInput] = useState<ManualProfileInputs | null>(null);
  const [requestedAmount, setRequestedAmount] = useState(40000);
  const [tenureMonths, setTenureMonths] = useState(6);
  const [passport, setPassport] = useState<FinancialPassport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");

  async function runUnderwrite(
    body: { personaId?: string; manual?: ManualProfileInputs },
    amount: number = requestedAmount,
    tenure: number = tenureMonths
  ) {
    setLoading(true);
    try {
      const res = await fetch("/api/underwrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, requestedAmount: amount, tenureMonths: tenure }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? "Could not build a Financial Passport.");
      }
      const data: FinancialPassport = await res.json();
      setPassport(data);
      setActiveTab("cashflow");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handlePersonaSelect(persona: UnderwritingPersona) {
    setSelectedPersona(persona);
    setLastManualInput(null);
    setRequestedAmount(persona.defaultRequestedAmount);
    setTenureMonths(persona.defaultTenureMonths);
    void runUnderwrite({ personaId: persona.id }, persona.defaultRequestedAmount, persona.defaultTenureMonths);
  }

  function handleManualSubmit(manual: ManualProfileInputs) {
    setSelectedPersona(null);
    setLastManualInput(manual);
    void runUnderwrite({ manual });
  }

  const whatIfBaseline: WhatIfInputs | null = useMemo(() => {
    if (!passport) return null;
    const f = cashflowToModelFeatures(passport.cashflow, passport.transactionHistory);
    return {
      avg_monthly_income: f.avg_monthly_income,
      income_consistency: f.income_consistency,
      avg_monthly_txn_count: f.avg_monthly_txn_count,
      txn_consistency: f.txn_consistency,
      utility_ontime_rate: f.utility_ontime_rate,
      platform_tenure_months: f.platform_tenure_months,
      customer_rating: f.customer_rating,
      cancellation_rate: f.cancellation_rate,
      savings_rate: f.savings_rate,
      debt_to_income: f.debt_to_income,
      monthlySurplus: passport.cashflow.monthlySurplus,
      tenureMonths: passport.underwriting.tenureMonths,
      dataConfidence: passport.underwriting.dataConfidence,
    };
  }, [passport]);

  return (
    <PageShell className="max-w-[1280px]">
      <div className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">Financial Passport</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
          Build a passport
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-muted-foreground">
          Pick a worker, or enter your own numbers.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="mb-8 flex-wrap">
          <TabsTrigger value="identity">Evidence</TabsTrigger>
          <TabsTrigger value="cashflow" disabled={!passport}>
            Cashflow
          </TabsTrigger>
          <TabsTrigger value="underwriting" disabled={!passport}>
            Decision
          </TabsTrigger>
          <TabsTrigger value="stress" disabled={!passport}>
            Stress test
          </TabsTrigger>
          <TabsTrigger value="plan" disabled={!passport}>
            Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-6">
          <LoanRequestControls
            amount={requestedAmount}
            tenureMonths={tenureMonths}
            onAmountChange={setRequestedAmount}
            onTenureChange={setTenureMonths}
          />

          {passport &&
            (requestedAmount !== passport.underwriting.requestedAmount ||
              tenureMonths !== passport.underwriting.tenureMonths) && (
              <div className="flex items-center justify-between gap-3 rounded-sm border border-dashed border-signal/50 bg-signal/5 px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">
                  Loan request changed — recalculate to update the underwriting decision.
                </span>
                <button
                  type="button"
                  onClick={() =>
                    void runUnderwrite(
                      selectedPersona ? { personaId: selectedPersona.id } : { manual: lastManualInput! },
                      requestedAmount,
                      tenureMonths
                    )
                  }
                  disabled={loading || (!selectedPersona && !lastManualInput)}
                  className="shrink-0 font-mono text-xs font-semibold uppercase tracking-wider text-primary underline underline-offset-4 disabled:opacity-40"
                >
                  Recalculate
                </button>
              </div>
            )}

          <Tabs defaultValue="personas">
            <TabsList variant="line" className="mb-4">
              <TabsTrigger value="personas">Sample profiles</TabsTrigger>
              <TabsTrigger value="manual">Enter your own</TabsTrigger>
            </TabsList>
            <TabsContent value="personas">
              <PersonaSelector
                personas={UNDERWRITING_PERSONAS}
                selectedId={selectedPersona?.id ?? null}
                onSelect={handlePersonaSelect}
              />
              {loading && <p className="mt-4 font-mono text-sm text-muted-foreground">Building your passport…</p>}
            </TabsContent>
            <TabsContent value="manual">
              <div className="max-w-lg">
                <IdentityForm submitting={loading} onSubmit={handleManualSubmit} />
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {passport && (
          <>
            <TabsContent value="cashflow" className="space-y-8">
              <FadeIn className="space-y-8">
                <SectionHeading
                  title="Cashflow Intelligence"
                  subtitle={`12 months of transaction history for ${passport.applicantLabel}, derived — not hand-entered.`}
                />
                <TransactionTimeline months={passport.transactionHistory.months} />
                <CashflowStatsGrid cashflow={passport.cashflow} />
              </FadeIn>
            </TabsContent>

            <TabsContent value="underwriting" className="space-y-8">
              <FadeIn className="space-y-8">
                <SectionHeading
                  title="Underwriting Decision"
                  subtitle="Can this applicant safely repay the requested amount — and why?"
                />
                <VerdictCard result={passport.underwriting} />
                <Separator className="bg-hairline" />
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-display text-lg font-semibold">Financial Passport</h3>
                    <PassportRadar dimensions={passport.dimensions} />
                  </div>
                  <div>
                    <h3 className="mb-3 font-display text-lg font-semibold">Evidence ledger</h3>
                    <EvidenceLedger evidence={passport.evidence} />
                  </div>
                </div>
              </FadeIn>
            </TabsContent>

            <TabsContent value="stress" className="space-y-8">
              <FadeIn className="space-y-8">
                <SectionHeading
                  title="Stress Test &amp; What-If Simulator"
                  subtitle="Does the recommendation hold up when things go wrong — and what would change it?"
                />
                <StressTestPanel results={passport.stressTests} />
                <Separator className="bg-hairline" />
                {whatIfBaseline && <WhatIfSimulator baseline={whatIfBaseline} />}
              </FadeIn>
            </TabsContent>

            <TabsContent value="plan" className="space-y-8">
              <FadeIn className="space-y-8">
                <SectionHeading
                  title="Credit-Building Plan"
                  subtitle="Not eligible for the full amount yet? Here's the concrete path, not a rejection."
                />
                <CreditPlanPanel plan={passport.creditPlan} />
              </FadeIn>
            </TabsContent>
          </>
        )}
      </Tabs>
    </PageShell>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
