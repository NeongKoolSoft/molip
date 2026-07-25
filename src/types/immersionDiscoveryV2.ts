import type { ReactionTarget } from "@/services/aiInsightService";

export type ImmersionGrowthDirection =
  | "up"
  | "down"
  | "stable";

export type ImmersionDiscoveryStatus =
  | "not_found"
  | "candidate"
  | "discovered";

export type ImmersionRepeatedSignal = {
  target: string;
  frequency: number;
  averageWeight: number;
  latestWeight: number;
  dominantType: ReactionTarget["type"];
  growthDirection: ImmersionGrowthDirection;
  firstSeenAt: string;
  latestSeenAt: string;
};

export type ImmersionDiscoveryV2 = {
  status: ImmersionDiscoveryStatus;
  periodDays: number;

  primarySignal: ImmersionRepeatedSignal | null;
  repeatedSignals: ImmersionRepeatedSignal[];

  summary: string | null;
  why: string[];
};