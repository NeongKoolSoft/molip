import type { ReactionTarget } from "@/services/aiInsightService";

export type ImmersionTrend = "up" | "down" | "stable";

export type DatedReactionTarget = ReactionTarget & {
  logDate: string;
};

export type ImmersionTargetEvidence = {
  target: string;
  frequency: number;

  averageWeight: number;
  firstWeight: number;
  latestWeight: number;

  trend: ImmersionTrend;
  dominantType: ReactionTarget["type"];

  firstSeenAt: string;
  latestSeenAt: string;
};

export type ImmersionSignalStatus =
  | "strong"
  | "emerging"
  | "insufficient";

export type ImmersionSignal = {
  status: ImmersionSignalStatus;
  target: string | null;
  title: string;
  description: string;
};