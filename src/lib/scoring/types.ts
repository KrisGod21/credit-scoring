export interface FeatureCoefficient {
  name: string;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  coefficient: number;
  mean: number;
  scale: number;
  trainMin: number;
  trainMax: number;
}

export interface ModelMetrics {
  datasetSize: number;
  defaultRate: number;
  logisticRegression: { auc: number; accuracy: number; confusionMatrix?: number[][] };
  randomForestBenchmark: { auc: number; accuracy?: number };
}

export interface ModelArtifact {
  version: number;
  trainedAt: string;
  scoreRange: { min: number; max: number };
  logOddsRange: { min: number; max: number };
  intercept: number;
  features: FeatureCoefficient[];
  metrics: ModelMetrics;
}

/** Raw feature values keyed by feature name, in the model's native units. */
export type ProfileInput = Record<string, number>;

export type RiskTier = "Poor" | "Fair" | "Good" | "Very Good" | "Excellent";

export interface FeatureContribution {
  name: string;
  label: string;
  unit: string;
  value: number;
  points: number;
  direction: "positive" | "negative";
}

export interface ImprovementTip {
  feature: string;
  label: string;
  message: string;
  potentialPointGain: number;
}

export interface ScoreResult {
  score: number;
  scoreRange: { min: number; max: number };
  tier: RiskTier;
  probabilityGood: number;
  breakdown: FeatureContribution[];
  tips: ImprovementTip[];
}
