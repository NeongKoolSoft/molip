import type { ReactionTarget } from "@/services/aiInsightService";
import type { MeaningGrowth } from "@/types/meaningGrowth";
import type { GrowthSignal } from "@/types/growthSignal";
import type { ImmersionTargetEvidence } from "@/types/immersionDiscovery";

export type TodaysReflectionContext = {
  dailyLogId: string | null;
  logDate: string;
  latestRevisionNumber: number | null;  

  mainReaction: {
    target: string;
    type: ReactionTarget["type"];
    weight: number;
    evidence: string;
  } | null;

  growth: {
    revisionCount: number;
    editCount: number;
    lengthChange: number;
    sentenceChange: number;
    summary: string;
  } | null;

  meaningGrowth: {
    hasMeaningGrowth: boolean;
    fromStage: MeaningGrowth["fromStage"];
    toStage: MeaningGrowth["toStage"];
    addedMeanings: string[];
    evidence: string[];
    summary: string;
  } | null;

  immersionEvidence: {
    target: string;
    frequency: number;
    averageWeight: number;
    latestWeight: number;
    trend: ImmersionTargetEvidence["trend"];
    dominantType: ImmersionTargetEvidence["dominantType"];
  } | null;
};

export type TodaysReflection = {
  reflection: string;
};