"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/passbook/page-shell";
import { PersonaPicker } from "@/components/passbook/persona-picker";
import { ProfileForm } from "@/components/passbook/profile-form";
import { StampSeal } from "@/components/passbook/stamp-seal";
import { LedgerTable } from "@/components/passbook/ledger-table";
import { TipsCard } from "@/components/passbook/tips-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PERSONAS } from "@/lib/scoring/personas";
import type { Persona } from "@/lib/scoring/personas";
import type { ProfileInput, ScoreResult } from "@/lib/scoring/types";

export default function PassbookPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [applicantLabel, setApplicantLabel] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function runScore(profile: ProfileInput, label: string) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not calculate a score.");
      }
      const data: ScoreResult = await res.json();
      setApplicantLabel(label);
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handlePersonaSelect(persona: Persona) {
    setSelectedPersona(persona);
    void runScore(persona.profile, `${persona.name} · ${persona.role}`);
  }

  return (
    <PageShell>
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-seal">Account opening</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          Open a passbook
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          Pick a sample worker to see an instant score, or enter your own numbers.
          Nothing you enter here is stored.
        </p>
      </div>

      <Tabs defaultValue="personas">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="personas">Sample profiles</TabsTrigger>
          <TabsTrigger value="manual">Enter your own</TabsTrigger>
        </TabsList>

        <TabsContent value="personas">
          <PersonaPicker
            personas={PERSONAS}
            selectedId={selectedPersona?.id ?? null}
            onSelect={handlePersonaSelect}
          />
        </TabsContent>

        <TabsContent value="manual">
          <div className="max-w-lg">
            <ProfileForm
              key="manual"
              onSubmit={(values) => void runScore(values, "Your profile")}
              submitting={loading}
            />
          </div>
        </TabsContent>
      </Tabs>

      {(loading || result) && (
        <>
          <Separator className="my-10 bg-paper-line" />
          <section aria-live="polite">
            {loading && (
              <p className="font-mono text-sm text-muted-foreground">Stamping your passbook…</p>
            )}
            {result && !loading && (
              <div className="space-y-8">
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                  <StampSeal score={result.score} tier={result.tier} />
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Account statement · {applicantLabel}
                    </p>
                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                      Modelled probability of being a reliable borrower:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {Math.round(result.probabilityGood * 100)}%
                      </span>
                      . Score range {result.scoreRange.min}–{result.scoreRange.max}.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 font-display text-lg font-semibold">
                    Ledger of contributing factors
                  </h2>
                  <LedgerTable breakdown={result.breakdown} />
                </div>

                <TipsCard tips={result.tips} />
              </div>
            )}
          </section>
        </>
      )}
    </PageShell>
  );
}
