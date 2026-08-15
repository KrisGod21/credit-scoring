# Alternative Credit Scoring for Informal Workers — Design Spec

**Problem statement:** Omni_FinTech_2 — Gig and informal-sector workers are often denied
credit due to lack of traditional credit history despite steady income. Build a fair,
explainable alternative credit scoring solution.

**Constraint:** solo build (Claude Code), ~24 hours to a deployable demo.

## Architecture

Single Next.js 14 (App Router, TypeScript) application — one deployable unit, Vercel-ready,
no separate backend service and no database for the MVP.

```
┌─────────────────────────────────────────────┐
│              Next.js App (Vercel)            │
│                                               │
│  UI (React/Tailwind/shadcn)                  │
│    ├─ Landing page                           │
│    ├─ Profile input (form + demo personas)   │
│    ├─ Score result (breakdown + tips)         │
│    └─ Model insights (trust/methodology page) │
│                                               │
│  API route: /api/score                       │
│    └─ scoring-engine.ts (pure function)      │
│         reads model-coefficients.json        │
└─────────────────────────────────────────────┘
              ▲
              │ (offline, one-time)
┌─────────────────────────────────────────────┐
│  ml/ — Python training pipeline (local)      │
│    ├─ generate_synthetic_data.py             │
│    ├─ train_model.py (LogReg + RF/XGB bench) │
│    └─ exports model-coefficients.json        │
│  ml/notebook.ipynb — Colab-ready copy         │
│    for the pitch deck ("real trained model")  │
└─────────────────────────────────────────────┘
```

## ML methodology

- **Data:** synthetic dataset (~8–10k rows) of informal/gig-worker profiles. Features
  and default-risk label generated from domain-informed rules + noise (standard practice
  for this exact problem space — no real dataset of this granularity is public).
- **Features (8):** avg monthly gig income, income consistency (CV of last 6 months),
  avg monthly digital-transaction count, transaction consistency, utility bill on-time
  rate, platform tenure (months), customer rating, cancellation rate, savings rate,
  existing debt-to-income ratio. (Final feature list may drop 1-2 for signal quality —
  confirmed at training time.)
- **Deployed model:** Logistic Regression trained as a true FICO-style scorecard
  (log-odds → points scaling, 300–900 range). Chosen over a black-box model *specifically*
  because it gives exact, non-approximated per-feature point contributions — this is the
  product's main differentiator.
- **Benchmark model:** Random Forest (or XGBoost if available) trained on the same data
  to report a comparative AUC in the pitch material, demonstrating rigor without being
  the deployed model.
- **Artifact:** `model-coefficients.json` — feature names, coefficients, intercept,
  per-feature normalization (min/max), and points-scaling constants. This is the only
  ML output the web app consumes; no Python runtime in production.

## Data flow

1. User selects a demo persona (delivery rider / tailor / street vendor / domestic
   worker) or fills the manual entry form.
2. Client POSTs normalized feature values to `/api/score`.
3. `scoring-engine.ts` loads `model-coefficients.json`, computes the linear combination,
   applies sigmoid → probability of good/bad credit, maps to a 300–900 score via the
   points-scaling constants, and computes each feature's exact point contribution
   (coefficient × normalized value × scaling factor).
4. Response: `{ score, tier, breakdown: [{feature, points, direction}], tips: [...] }`.
5. UI renders score, risk tier badge, a breakdown chart (recharts), and 2-3 actionable
   "how to improve" tips derived from marginal analysis on the same linear formula.

## Error handling

- Form validation (client + server) rejects out-of-range values before scoring.
- `/api/score` returns 400 with field-level errors on invalid input; never throws to a
  blank screen.
- If `model-coefficients.json` fails to load, API returns 503 with a clear message
  (should not happen in practice since it's a static bundled asset).

## Testing

- `scoring-engine.test.ts` (Vitest): deterministic unit tests — fixed coefficients +
  known input → expected score/breakdown. Edge cases: min/max feature values, missing
  optional fields.
- Model validation lives in the training pipeline itself (train/test split, AUC,
  confusion matrix reported in the notebook) — this is ML validation evidence, not
  application test coverage.

## Deliverables (mapped to hackathon judging criteria)

- Deployable Next.js repo (Vercel-ready; user deploys).
- Trained model artifact + Colab notebook (pitch evidence of real ML: AUC, methodology).
- README: problem framing, architecture, model methodology, run/deploy instructions.
- Live demo flow: pick persona → see score → see *why* (exact breakdown) → see
  improvement tips. This "why" screen is the core differentiator to lead the pitch with.

## Explicit scope cuts (to protect the 24hr deadline)

- No database / persistence in the MVP. No auth. No lender-side multi-profile dashboard
  (stretch only, added last if time remains, session-only via local state).
- No smartphone-behavioral or social-media data signals (real platforms use these, but
  they add non-obvious UX/privacy scope for no benefit to a scoring-quality demo).
- No live third-party data integrations (UPI/bank APIs) — inputs are self-reported /
  demo-persona values, clearly labeled as such in the UI.
