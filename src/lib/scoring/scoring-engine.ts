import modelData from "./model-coefficients.json";
import type {
  ModelArtifact,
  ProfileInput,
  ScoreResult,
  FeatureContribution,
  ImprovementTip,
  RiskTier,
} from "./types";

const model = modelData as ModelArtifact;

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function tierForScore(score: number): RiskTier {
  if (score < 550) return "Poor";
  if (score < 650) return "Fair";
  if (score < 730) return "Good";
  if (score < 800) return "Very Good";
  return "Excellent";
}

const { min: scoreMin, max: scoreMax } = model.scoreRange;
const { min: logOddsMin, max: logOddsMax } = model.logOddsRange;
const pointsPerLogOdd = (scoreMax - scoreMin) / (logOddsMax - logOddsMin);

/**
 * Computes a 300-900 alternative credit score from raw alt-data feature
 * values. Every step is exact linear algebra on the trained logistic
 * regression scorecard — the per-feature point breakdown is not an
 * approximation, it is the literal decomposition of the model's math.
 */
export function scoreProfile(input: ProfileInput): ScoreResult {
  let logOdds = model.intercept;
  const breakdown: FeatureContribution[] = [];

  for (const feature of model.features) {
    const rawValue = input[feature.name];
    const value = Number.isFinite(rawValue) ? rawValue : feature.mean;
    const standardized = (value - feature.mean) / feature.scale;
    const logOddsContribution = feature.coefficient * standardized;
    logOdds += logOddsContribution;

    const points = logOddsContribution * pointsPerLogOdd;
    breakdown.push({
      name: feature.name,
      label: feature.label,
      unit: feature.unit,
      value,
      points: Math.round(points),
      direction: points >= 0 ? "positive" : "negative",
    });
  }

  const rawScore = scoreMin + (logOdds - logOddsMin) * pointsPerLogOdd;
  const score = Math.round(Math.min(scoreMax, Math.max(scoreMin, rawScore)));
  const probabilityGood = sigmoid(logOdds);

  breakdown.sort((a, b) => b.points - a.points);

  const tips = computeTips(input);

  return {
    score,
    scoreRange: { min: scoreMin, max: scoreMax },
    tier: tierForScore(score),
    probabilityGood,
    breakdown,
    tips,
  };
}

/**
 * Marginal-analysis tips: for each feature not already near its "good"
 * extreme, estimate the point gain from moving 25% of the remaining
 * distance toward that extreme (within the training data's observed
 * range), then surface the top 3 by potential gain.
 */
function computeTips(input: ProfileInput): ImprovementTip[] {
  const baseline = rawScoreFor(input);

  const candidates: ImprovementTip[] = [];

  for (const feature of model.features) {
    const currentValue = Number.isFinite(input[feature.name])
      ? input[feature.name]
      : feature.mean;

    const goodExtreme = feature.higherIsBetter ? feature.trainMax : feature.trainMin;
    const nudgedValue = currentValue + (goodExtreme - currentValue) * 0.25;

    if (Math.abs(nudgedValue - currentValue) < 1e-9) continue;

    const nudgedInput = { ...input, [feature.name]: nudgedValue };
    const nudgedScore = rawScoreFor(nudgedInput);
    const gain = nudgedScore - baseline;

    if (gain > 2) {
      candidates.push({
        feature: feature.name,
        label: feature.label,
        message: describeTip(feature.label, feature.higherIsBetter),
        potentialPointGain: Math.round(gain),
      });
    }
  }

  return candidates.sort((a, b) => b.potentialPointGain - a.potentialPointGain).slice(0, 3);
}

function describeTip(label: string, higherIsBetter: boolean): string {
  const verb = higherIsBetter ? "Improve" : "Reduce";
  return `${verb} your ${label.toLowerCase()}`;
}

function rawScoreFor(input: ProfileInput): number {
  let logOdds = model.intercept;
  for (const feature of model.features) {
    const rawValue = input[feature.name];
    const value = Number.isFinite(rawValue) ? rawValue : feature.mean;
    const standardized = (value - feature.mean) / feature.scale;
    logOdds += feature.coefficient * standardized;
  }
  const raw = scoreMin + (logOdds - logOddsMin) * pointsPerLogOdd;
  return Math.min(scoreMax, Math.max(scoreMin, raw));
}

export function getModelInfo() {
  return {
    version: model.version,
    trainedAt: model.trainedAt,
    metrics: model.metrics,
    features: model.features.map((f) => ({
      name: f.name,
      label: f.label,
      unit: f.unit,
      higherIsBetter: f.higherIsBetter,
      coefficient: f.coefficient,
    })),
  };
}
