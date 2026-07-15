import type { ReactionTarget } from "@/services/aiInsightService";
import type { MeaningGrowth } from "@/types/meaningGrowth";
import type { GrowthSignal } from "@/types/growthSignal";
import type { ImmersionTargetEvidence } from "@/types/immersionDiscovery";

export type ReflectionThemeReason =
  | "weight"
  | "frequency"
  | "meaning_growth";

export type ReflectionTheme = {
  target: string;
  importance: number;
  reason: ReflectionThemeReason;
  reactionType: ReactionTarget["type"];
};

export type ReflectionTone =
  | "calm"
  | "hopeful"
  | "careful"
  | "energetic";

export type StoryFlowStep =
  | "main_theme"
  | "growth"
  | "meaning"
  | "supporting"
  | "closing";

export type ReflectionEvidence = {
  reaction: {
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

  meaning: {
    hasMeaningGrowth: boolean;
    fromStage: MeaningGrowth["fromStage"];
    toStage: MeaningGrowth["toStage"];
    addedMeanings: string[];
    evidence: string[];
    summary: string;
  } | null;

  immersion: {
    target: string;
    frequency: number;
    averageWeight: number;
    latestWeight: number;
    trend: ImmersionTargetEvidence["trend"];
    dominantType: ImmersionTargetEvidence["dominantType"];
  } | null;
};

export type TodaysReflectionContext = {
  dailyLogId: string | null;
  logDate: string;
  latestRevisionNumber: number | null;

  primaryTheme: ReflectionTheme | null;
  supportingThemes: ReflectionTheme[];

  tone: ReflectionTone;
  storyFlow: StoryFlowStep[];

  evidence: ReflectionEvidence;
};

export type TodaysReflection = {
  reflection: string;
};