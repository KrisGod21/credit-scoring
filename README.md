# Passbook — Portable Financial Identity for Informal Workers
Live link : credit-scoring-seven.vercel.app

**Omnikon Hackathon 2026 · Omni_FinTech_2**

Gig and informal-sector workers (delivery riders, home-based tailors, street
vendors, domestic workers) are routinely denied credit because they lack a
formal salary slip or credit-bureau history — despite often having steady
income and disciplined payment behaviour.

**Passbook** is not a single credit score. It's a portable financial
identity and underwriting platform: it builds a 12-month transaction
history from the alternative data these workers already generate, derives
real cashflow statistics from it, and answers the question a lender
actually needs answered — *can this person safely repay this specific
amount* — with every factor traced to evidence, a stress test against
real-world shocks, and a concrete path forward if the answer is "not yet."

## The five-stage pipeline

1. **Identity & Evidence** — a 12-month synthetic transaction history
   (occupation-flavored: a rider's income looks like daily gig payouts, a
   tailor's looks like lumpy seasonal orders), or your own numbers via a
   manual form. Every metric is tagged `verified`, `self-declared`, or
   `derived`.
2. **Cashflow Intelligence Engine** — derives median income, volatility,
   trend, seasonality (distinguished from ordinary noise), surplus,
   expense ratio, income concentration/diversification, active months,
   and payment discipline from the transaction history.
3. **Underwriting Decision** — the derived cashflow features feed a
   **trained Logistic Regression risk model** (see below), and a separate,
   fully deterministic affordability layer turns that into: risk tier,
   repayment capacity, recommended credit range, and data confidence.
4. **Stress Test & What-If Simulator** — re-runs the same pipeline under
   four shock scenarios (20% income drop, loses largest income source, one
   bad month, a surprise expense) to check whether the recommendation
   actually holds up, plus a live simulator for "what if my debt were
   lower."
5. **Credit-Building Plan** — if not yet eligible, a ranked, evidence-based
   list of the levers that would close the gap — not a rejection.

Two more views sit on top of the same pipeline: **Lender Mode** (`/lender`,
a dense multi-applicant queue readable in ~30 seconds) and **Model &
Fairness** (`/insights`, methodology + an explicit fairness section).

## Why this approach

- **The risk model is a Logistic Regression scorecard**, not the fanciest
  model available — a decision that can't be explained to the person it
  affects isn't a fair one. It's benchmarked against a Random Forest to
  prove that choosing explainability doesn't cost accuracy (**0.97 AUC**
  vs. 0.95 for the black-box benchmark).
- **The model trains on its own pipeline's output.** `scripts/generate-training-data.ts`
  runs the same transaction-generator → Cashflow Intelligence Engine code
  the live app uses, across thousands of randomized synthetic applicants,
  so the model is fit on the actual feature distribution it sees in
  production — not a separately hand-authored one.
- **Affordability math is deterministic, not another model.** Repayment
  capacity is `surplus × a risk- and confidence-adjusted safety factor` —
  arithmetic a lender (or the applicant) can actually check, not a second
  opaque prediction.
- **No protected characteristics are used or collected** — see the
  Fairness section on `/insights` for the full feature list, data-
  confidence methodology, and stated limitations (synthetic training data,
  no real disparate-impact audit performed).

## Tech stack

- **Next.js 16** (App Router, TypeScript), Tailwind CSS v4, shadcn/ui,
  Recharts (transaction timeline, Financial Passport radar, feature
  importance).
- **Underwriting pipeline** (`src/lib/underwriting/`): transaction
  generator, Cashflow Intelligence Engine, underwriting engine, stress-test
  engine, what-if simulator, credit-plan generator — all pure TypeScript,
  running server-side in API routes with zero extra infrastructure.
- **Risk model** (`src/lib/scoring/`): the trained scorecard, reused inside
  the underwriting pipeline via `cashflowToModelFeatures()`.
- **ML training** (`ml/train_model.py` + `scripts/generate-training-data.ts`,
  offline/local only): trains Logistic Regression + a Random Forest
  benchmark, exports `src/lib/scoring/model-coefficients.json`. A mirrored
  Colab notebook (`ml/credit_scoring_notebook.ipynb`) is included as a
  presentation artifact.
- **Tests**: Vitest unit tests for both the scoring engine and the full
  underwriting pipeline (deterministic, persona-level sanity checks —
  e.g. the disciplined low-debt persona always gets more credit than the
  cash-heavy high-debt one).

## Project structure

```
ml/                             Python training pipeline + Colab notebook (offline)
scripts/generate-training-data.ts  Generates the model's training CSV from the live pipeline
src/
  app/
    page.tsx                    Landing page
    passbook/page.tsx           Guided 5-stage Financial Passport flow
    lender/page.tsx             Lender Mode — applicant queue
    insights/page.tsx           Model methodology + Fairness section
    api/underwrite/route.ts     POST → runs the full pipeline for a persona or manual profile
    api/simulate/route.ts       POST → live what-if recompute
    api/score/, api/model-info/ Lower-level scoring endpoints (used internally / standalone)
  components/underwriting/      Financial Passport UI: transaction timeline, radar,
                                 evidence ledger, stress-test panel, what-if simulator, etc.
  components/passbook/          Shared chrome: header, page shell
  lib/underwriting/
    types.ts                    Data model: TransactionHistory, EvidenceMetric, CashflowProfile, etc.
    transaction-generator.ts    Seeded, occupation-aware synthetic history generator
    cashflow-engine.ts          Derives cashflow stats; maps them onto the trained model's features
    underwriting-engine.ts      Risk tier + deterministic affordability math
    stress-test-engine.ts       Four shock scenarios, SAFE/WARNING/UNSAFE verdicts
    what-if.ts / credit-plan.ts Live simulator + marginal-analysis credit-building plan
    personas.ts                 4 demo personas spanning the risk/capacity range
  lib/scoring/
    scoring-engine.ts           Trained risk model (pure function)
    model-coefficients.json     Trained model artifact (generated by ml/train_model.py)
docs/superpowers/specs/         Design specs for this build
```

## Running locally

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # scoring engine + underwriting pipeline unit tests
npm run build     # production build (Vercel-compatible)
```

To retrain the model (optional — a trained artifact is already committed):

```bash
npx tsx scripts/generate-training-data.ts   # regenerate ml/derived_training_data.csv
pip install scikit-learn pandas numpy
python ml/train_model.py                    # regenerates model-coefficients.json
```

## Deploying

The app is a standard Next.js project with no database and no environment
variables required — deploy as-is:

```bash
vercel deploy
```

## Scope notes

Built solo for the hackathon deadline. Deliberately out of scope: real
auth/persistence (Lender Mode and the applicant flow are stateless/demo
data), and live third-party data integrations (UPI/bank/Account Aggregator)
— inputs are synthetic-persona or self-reported values, clearly labelled as
such throughout the UI. See `docs/superpowers/specs/` for the full design
rationale and explicit scope cuts at each stage of the build.
