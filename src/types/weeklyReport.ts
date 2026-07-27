import type { ReactionTarget } from "@/services/aiInsightService";

export type WeeklyReportStatus =
  | "not_ready"
  | "ready";

export type WeeklyGrowthDirection =
  | "up"
  | "down"
  | "stable";

export type WeeklyPrimarySignal = {
  target: string;
  frequency: number;
  averageWeight: number;
  latestWeight: number;
  dominantType: ReactionTarget["type"];
  growthDirection: WeeklyGrowthDirection;
};

export type WeeklyMeaningChange = {
  hasChange: boolean;
  summary: string;
  addedMeanings: string[];
};

export type WeeklyReport = {
  status: WeeklyReportStatus;

  periodStart: string;
  periodEnd: string;
  recordedDays: number;

  summary: string;

  primarySignal: WeeklyPrimarySignal | null;

  meaningChange: WeeklyMeaningChange | null;

  reflection: string;

  nextQuestion: string;
};