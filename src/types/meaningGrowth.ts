export type MeaningStage =
  | "action"
  | "reason"
  | "value"
  | "life_direction"
  | "unknown";

export type MeaningGrowth = {
  hasMeaningGrowth: boolean;

  fromStage: MeaningStage;
  toStage: MeaningStage;

  addedMeanings: string[];
  evidence: string[];

  summary: string;
  confidence: number;
};