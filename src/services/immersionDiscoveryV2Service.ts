import type { ReactionTarget } from "@/services/aiInsightService";
import { getRecentAnalyses } from "@/services/aiAnalysisService";

import type {
  ImmersionDiscoveryV2,
  ImmersionGrowthDirection,
  ImmersionRepeatedSignal,
} from "@/types/immersionDiscoveryV2";

type DatedReactionTarget = ReactionTarget & {
  logDate: string;
};

const round = (value: number, digits = 2) => {
  const multiplier = 10 ** digits;

  return Math.round(value * multiplier) / multiplier;
};

const getGrowthDirection = (
  firstWeight: number,
  latestWeight: number
): ImmersionGrowthDirection => {
  const difference = latestWeight - firstWeight;

  if (Math.abs(difference) < 0.05) {
    return "stable";
  }

  return difference > 0 ? "up" : "down";
};

const getDominantType = (
  targets: DatedReactionTarget[]
): ReactionTarget["type"] => {
  const counts = new Map<ReactionTarget["type"], number>();

  for (const item of targets) {
    counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
  }

  let dominantType: ReactionTarget["type"] = targets[0].type;
  let highestCount = 0;

  for (const [type, count] of counts.entries()) {
    if (count > highestCount) {
      dominantType = type;
      highestCount = count;
    }
  }

  return dominantType;
};

const aggregateRepeatedSignals = (
  reactions: DatedReactionTarget[]
): ImmersionRepeatedSignal[] => {
  const validReactions = reactions.filter(
    (item) =>
      item.normalized_target.trim() &&
      Number.isFinite(item.weight) &&
      item.weight >= 0 &&
      item.weight <= 1
  );

  const grouped = new Map<string, DatedReactionTarget[]>();

  for (const reaction of validReactions) {
    const key = reaction.normalized_target.trim();
    const current = grouped.get(key) ?? [];

    current.push(reaction);
    grouped.set(key, current);
  }

  const results: ImmersionRepeatedSignal[] = [];

  for (const [target, items] of grouped.entries()) {
    const ordered = [...items].sort((a, b) =>
      a.logDate.localeCompare(b.logDate)
    );

    const first = ordered[0];
    const latest = ordered[ordered.length - 1];

    const totalWeight = ordered.reduce(
      (sum, item) => sum + item.weight,
      0
    );

    results.push({
      target,
      frequency: ordered.length,
      averageWeight: round(totalWeight / ordered.length),
      latestWeight: round(latest.weight),
      dominantType: getDominantType(ordered),
      growthDirection: getGrowthDirection(
        first.weight,
        latest.weight
      ),
      firstSeenAt: first.logDate,
      latestSeenAt: latest.logDate,
    });
  }

  return results.sort((a, b) => {
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency;
    }

    return b.averageWeight - a.averageWeight;
  });
};

const positiveTypes = new Set<ReactionTarget["type"]>([
  "immersion",
  "interest",
  "joy",
  "energy",
  "desire",
]);

const buildSummary = (
  signal: ImmersionRepeatedSignal
): string => {
  if (signal.growthDirection === "up") {
    return "최근 기록에서 가장 꾸준하게 에너지가 모이고 있는 활동입니다.";
  }

  if (signal.growthDirection === "stable") {
    return "비슷한 강도의 반응이 꾸준히 이어지고 있는 활동입니다.";
  }

  return "최근 반응은 다소 낮아졌지만 계속 반복해서 나타나는 활동입니다.";
};

const buildWhy = (
  signal: ImmersionRepeatedSignal,
  periodDays: number
): string[] => {
  const reasons = [
    `최근 ${periodDays}일 동안 가장 자주 반복된 반응입니다.`,
    `평균 반응 강도가 ${Math.round(
      signal.averageWeight * 100
    )}%로 높게 나타났습니다.`,
    "몰입으로 이어질 가능성이 있는 긍정적 반응이 반복해서 나타났습니다.",
  ];

  if (signal.growthDirection === "up") {
    reasons.push("최근으로 갈수록 반응이 조금 더 강해지고 있습니다.");
  } else if (signal.growthDirection === "stable") {
    reasons.push("비슷한 강도의 반응이 꾸준히 이어지고 있습니다.");
  } else {
    reasons.push(
      "최근 반응 강도는 낮아졌지만, 계속 반복해서 나타나고 있습니다."
    );
  }

  return reasons;
};

export const loadImmersionDiscoveryV2 = async (
  userId: string,
  periodDays = 30
): Promise<ImmersionDiscoveryV2> => {
  const analyses = await getRecentAnalyses(userId, periodDays);

  const reactions: DatedReactionTarget[] = analyses.flatMap(
    (analysis) =>
      (analysis.result.reaction_targets ?? []).map((reaction) => ({
        ...reaction,
        logDate: analysis.logDate,
      }))
  );

  const repeatedSignals = aggregateRepeatedSignals(reactions);

  if (repeatedSignals.length === 0) {
    return {
      status: "not_found",
      periodDays,
      primarySignal: null,
      repeatedSignals: [],
      summary: null,
      why: [],
    };
  }

  const primarySignal =
    repeatedSignals.find((item) =>
      positiveTypes.has(item.dominantType)
    ) ?? null;

  if (!primarySignal) {
    return {
      status: "not_found",
      periodDays,
      primarySignal: null,
      repeatedSignals,
      summary: null,
      why: [],
    };
  }

  const status =
    primarySignal.frequency >= 2 &&
    primarySignal.averageWeight >= 0.7
      ? "discovered"
      : "candidate";

  return {
    status,
    periodDays,
    primarySignal,
    repeatedSignals,
    summary: buildSummary(primarySignal),
    why: buildWhy(primarySignal, periodDays),
  };
};