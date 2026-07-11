import type { ReactionTarget } from "@/services/aiInsightService";
import { getRecentAnalyses } from "@/services/aiAnalysisService";

import type {
  DatedReactionTarget,
  ImmersionTargetEvidence,
  ImmersionTrend,
} from "@/types/immersionDiscovery";

const round = (value: number, digits = 2) => {
  const multiplier = 10 ** digits;

  return Math.round(value * multiplier) / multiplier;
};

const getTrend = (
  firstWeight: number,
  latestWeight: number
): ImmersionTrend => {
  const difference = latestWeight - firstWeight;

  // 작은 차이는 모델 추정 오차로 보고 유지 처리한다.
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

export const aggregateImmersionTargets = (
  reactions: DatedReactionTarget[]
): ImmersionTargetEvidence[] => {
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

  const results: ImmersionTargetEvidence[] = [];

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

    const averageWeight = totalWeight / ordered.length;

    results.push({
      target,
      frequency: ordered.length,

      averageWeight: round(averageWeight),
      firstWeight: round(first.weight),
      latestWeight: round(latest.weight),

      trend: getTrend(first.weight, latest.weight),
      dominantType: getDominantType(ordered),

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

export const loadImmersionTargetEvidence = async (
  userId: string,
  days = 7
): Promise<ImmersionTargetEvidence[]> => {
  const analyses = await getRecentAnalyses(userId, days);

  const reactions: DatedReactionTarget[] = analyses.flatMap(
    (analysis) =>
      (analysis.result.reaction_targets ?? []).map((reaction) => ({
        ...reaction,
        logDate: analysis.logDate,
      }))
  );

  return aggregateImmersionTargets(reactions);
};