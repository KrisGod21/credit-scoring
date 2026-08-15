"""
Alternative credit scorecard for informal/gig workers — training pipeline.

Generates a synthetic dataset of informal-sector worker profiles (no public
dataset exists at this granularity; synthetic-with-domain-rules is standard
practice in this research area), trains a Logistic Regression scorecard
model (deployed) plus a Random Forest benchmark (reported for rigor only),
and exports the trained scorecard as a JSON artifact consumed directly by
the Next.js app (no Python runtime needed in production).

Run: python ml/train_model.py
"""

import json
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, confusion_matrix
from sklearn.preprocessing import StandardScaler

RNG = np.random.default_rng(42)
N = 10_000

# ---------------------------------------------------------------------------
# 1. Synthetic feature generation
#
# Each feature is drawn from a distribution chosen to look like a plausible
# informal/gig-worker population (delivery riders, home-based tailors, street
# vendors, domestic workers). Features are intentionally independent draws;
# realism comes from tying the *label* to a domain-weighted combination of
# them (see step 2), not from artificial inter-feature correlation.
# ---------------------------------------------------------------------------

avg_monthly_income = RNG.gamma(shape=3.0, scale=4500, size=N).clip(2000, 60000)
income_consistency = RNG.beta(a=5, b=2.5, size=N)  # 0-1, higher = steadier income
avg_monthly_txn_count = RNG.gamma(shape=4.0, scale=12, size=N).clip(2, 300)
txn_consistency = RNG.beta(a=4, b=2.5, size=N)
utility_ontime_rate = RNG.beta(a=6, b=2, size=N)
platform_tenure_months = RNG.gamma(shape=2.2, scale=9, size=N).clip(0, 180)
customer_rating = RNG.beta(a=8, b=2, size=N) * 4 + 1  # skewed toward 3.5-5
cancellation_rate = RNG.beta(a=1.5, b=8, size=N)  # skewed low, long tail
savings_rate = RNG.beta(a=2, b=6, size=N)  # 0-1
debt_to_income = RNG.gamma(shape=1.8, scale=0.35, size=N).clip(0, 3)

df = pd.DataFrame({
    "avg_monthly_income": avg_monthly_income,
    "income_consistency": income_consistency,
    "avg_monthly_txn_count": avg_monthly_txn_count,
    "txn_consistency": txn_consistency,
    "utility_ontime_rate": utility_ontime_rate,
    "platform_tenure_months": platform_tenure_months,
    "customer_rating": customer_rating,
    "cancellation_rate": cancellation_rate,
    "savings_rate": savings_rate,
    "debt_to_income": debt_to_income,
})

FEATURE_ORDER = list(df.columns)
FEATURE_META = {
    "avg_monthly_income": {"label": "Average monthly income", "higherIsBetter": True, "unit": "INR"},
    "income_consistency": {"label": "Income consistency", "higherIsBetter": True, "unit": "ratio"},
    "avg_monthly_txn_count": {"label": "Monthly digital transactions", "higherIsBetter": True, "unit": "count"},
    "txn_consistency": {"label": "Transaction consistency", "higherIsBetter": True, "unit": "ratio"},
    "utility_ontime_rate": {"label": "Utility bill on-time rate", "higherIsBetter": True, "unit": "ratio"},
    "platform_tenure_months": {"label": "Work/platform tenure", "higherIsBetter": True, "unit": "months"},
    "customer_rating": {"label": "Customer rating", "higherIsBetter": True, "unit": "stars"},
    "cancellation_rate": {"label": "Cancellation rate", "higherIsBetter": False, "unit": "ratio"},
    "savings_rate": {"label": "Savings rate", "higherIsBetter": True, "unit": "ratio"},
    "debt_to_income": {"label": "Existing debt-to-income", "higherIsBetter": False, "unit": "ratio"},
}

# ---------------------------------------------------------------------------
# 2. Domain-informed latent creditworthiness -> binary label
#
# Weights reflect informal-credit-scoring literature: income stability and
# bill-payment discipline matter more than raw income level; existing debt
# burden and cancellation rate are the strongest negative signals.
# ---------------------------------------------------------------------------

def zscore(s: pd.Series) -> pd.Series:
    return (s - s.mean()) / s.std()

latent = (
    0.9 * zscore(df.avg_monthly_income)
    + 1.6 * zscore(df.income_consistency)
    + 0.7 * zscore(df.avg_monthly_txn_count)
    + 1.3 * zscore(df.txn_consistency)
    + 1.5 * zscore(df.utility_ontime_rate)
    + 0.8 * zscore(df.platform_tenure_months)
    + 1.0 * zscore(df.customer_rating)
    - 1.4 * zscore(df.cancellation_rate)
    + 0.9 * zscore(df.savings_rate)
    - 1.7 * zscore(df.debt_to_income)
)

noise = RNG.normal(0, 1.35, size=N)  # keeps the problem non-trivial for the model
latent_noisy = latent + noise

# Calibrate threshold so ~20% of the population is "bad" (default), a
# realistic base rate for a thin-file/informal population.
threshold = np.quantile(latent_noisy, 0.20)
is_good = (latent_noisy > threshold).astype(int)  # 1 = good/creditworthy, 0 = bad
df["is_good"] = is_good

print(f"Synthetic dataset: {N} rows, default rate = {(1 - is_good.mean()):.1%}")

# ---------------------------------------------------------------------------
# 3. Train/test split + standardization
# ---------------------------------------------------------------------------

X = df[FEATURE_ORDER].values
y = df["is_good"].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler().fit(X_train)
X_train_s = scaler.transform(X_train)
X_test_s = scaler.transform(X_test)

# ---------------------------------------------------------------------------
# 4. Deployed model: Logistic Regression scorecard
# ---------------------------------------------------------------------------

logreg = LogisticRegression(max_iter=1000)
logreg.fit(X_train_s, y_train)

logreg_proba = logreg.predict_proba(X_test_s)[:, 1]
logreg_pred = (logreg_proba >= 0.5).astype(int)
logreg_auc = roc_auc_score(y_test, logreg_proba)
logreg_acc = accuracy_score(y_test, logreg_pred)
logreg_cm = confusion_matrix(y_test, logreg_pred).tolist()

print(f"Logistic Regression  AUC={logreg_auc:.4f}  Accuracy={logreg_acc:.4f}")
print(f"Confusion matrix (rows=actual, cols=pred) [bad, good]: {logreg_cm}")

# ---------------------------------------------------------------------------
# 5. Benchmark model: Random Forest (reported only, not deployed)
# ---------------------------------------------------------------------------

rf = RandomForestClassifier(n_estimators=300, max_depth=8, random_state=42)
rf.fit(X_train_s, y_train)
rf_proba = rf.predict_proba(X_test_s)[:, 1]
rf_auc = roc_auc_score(y_test, rf_proba)
rf_acc = accuracy_score(y_test, (rf_proba >= 0.5).astype(int))

print(f"Random Forest (benchmark)  AUC={rf_auc:.4f}  Accuracy={rf_acc:.4f}")

# ---------------------------------------------------------------------------
# 6. Points-scaling: map log-odds of "good" to a 300-900 scorecard range
# ---------------------------------------------------------------------------

log_odds_train = logreg.decision_function(X_train_s)
log_odds_min = float(np.percentile(log_odds_train, 0.5))
log_odds_max = float(np.percentile(log_odds_train, 99.5))

SCORE_MIN, SCORE_MAX = 300, 900

# ---------------------------------------------------------------------------
# 7. Export scorecard artifact for the Next.js app
# ---------------------------------------------------------------------------

artifact = {
    "version": 1,
    "trainedAt": pd.Timestamp.now("UTC").isoformat(),
    "scoreRange": {"min": SCORE_MIN, "max": SCORE_MAX},
    "logOddsRange": {"min": log_odds_min, "max": log_odds_max},
    "intercept": float(logreg.intercept_[0]),
    "features": [
        {
            "name": name,
            "label": FEATURE_META[name]["label"],
            "unit": FEATURE_META[name]["unit"],
            "higherIsBetter": FEATURE_META[name]["higherIsBetter"],
            "coefficient": float(logreg.coef_[0][i]),
            "mean": float(scaler.mean_[i]),
            "scale": float(scaler.scale_[i]),
            "trainMin": float(X_train[:, i].min()),
            "trainMax": float(X_train[:, i].max()),
        }
        for i, name in enumerate(FEATURE_ORDER)
    ],
    "metrics": {
        "datasetSize": N,
        "defaultRate": float(1 - is_good.mean()),
        "logisticRegression": {"auc": float(logreg_auc), "accuracy": float(logreg_acc), "confusionMatrix": logreg_cm},
        "randomForestBenchmark": {"auc": float(rf_auc), "accuracy": float(rf_acc)},
    },
}

out_path = Path(__file__).parent.parent / "src" / "lib" / "scoring" / "model-coefficients.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(artifact, indent=2))
print(f"\nWrote scorecard artifact to {out_path}")

# Also drop a copy of the synthetic dataset sample for the notebook/pitch deck
sample_path = Path(__file__).parent / "synthetic_sample.csv"
df.sample(500, random_state=1).to_csv(sample_path, index=False)
print(f"Wrote 500-row sample dataset to {sample_path}")
