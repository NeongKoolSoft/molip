import type { ReactionTarget } from "@/services/aiInsightService";
import { getRecentAnalyses } from "@/services/aiAnalysisService";

import type {
  DatedReactionTarget,
  ImmersionSignal,
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

const positiveTypes = new Set<ReactionTarget["type"]>([
  "immersion",
  "interest",
  "joy",
  "energy",
  "desire",
]);

const getTypePriority = (
  type: ReactionTarget["type"]
): number => {
  switch (type) {
    case "immersion":
      return 1;
    case "joy":
      return 0.85;
    case "interest":
      return 0.8;
    case "energy":
      return 0.75;
    case "desire":
      return 0.7;
    default:
      return 0;
  }
};

const calculateImmersionCandidateScore = (
  item: ImmersionTargetEvidence,
  maxFrequency: number
): number => {
  const frequencyScore =
    maxFrequency > 0 ? item.frequency / maxFrequency : 0;

  const trendBonus =
    item.trend === "up"
      ? 0.08
      : item.trend === "stable"
        ? 0.03
        : 0;

  return (
    frequencyScore * 0.35 +
    item.averageWeight * 0.25 +
    item.latestWeight * 0.2 +
    getTypePriority(item.dominantType) * 0.2 +
    trendBonus
  );
};

export const buildImmersionSignal = (
  targets: ImmersionTargetEvidence[]
): ImmersionSignal => {
  const candidates = targets.filter((item) =>
    positiveTypes.has(item.dominantType)
  );

  if (candidates.length === 0) {
    return {
      status: "insufficient",
      target: null,
      title: "몰입 신호를 찾는 중입니다",
      description:
        "아직 하나의 대상으로 이어지는 몰입 신호는 뚜렷하지 않습니다. 기록이 더 쌓이면 반복성과 변화가 함께 드러날 수 있습니다.",
    };
  }

  const maxFrequency = Math.max(
    ...candidates.map((item) => item.frequency)
  );

  const orderedCandidates = [...candidates].sort(
    (a, b) =>
      calculateImmersionCandidateScore(b, maxFrequency) -
      calculateImmersionCandidateScore(a, maxFrequency)
  );

  const candidate = orderedCandidates[0];
  const score = calculateImmersionCandidateScore(
    candidate,
    maxFrequency
  );

  const isStrong =
    candidate.frequency >= 2 &&
    candidate.averageWeight >= 0.7 &&
    candidate.latestWeight >= 0.65 &&
    score >= 0.65;

  if (isStrong) {
    const trendText =
      candidate.trend === "up"
        ? "최근 반응도 더 강해지고 있습니다."
        : candidate.trend === "down"
          ? "최근 반응은 다소 낮아졌지만 반복해서 나타나고 있습니다."
          : "최근에도 비슷한 강도로 이어지고 있습니다.";

    return {
      status: "strong",
      target: candidate.target,
      title: "최근 몰입 후보",
      description: `최근 기록에서는 '${candidate.target}'이 ${candidate.frequency}회 반복해서 나타났고, 평균 반응도 ${Math.round(
        candidate.averageWeight * 100
      )}%로 높게 나타났습니다. ${trendText}`,
    };
  }

  const hasStrongSingleSignal =
    candidate.frequency === 1 &&
    candidate.dominantType === "immersion" &&
    candidate.latestWeight >= 0.8;

  if (hasStrongSingleSignal) {
    return {
      status: "emerging",
      target: candidate.target,
      title: "새롭게 나타난 몰입 후보",
      description: `'${candidate.target}'은 아직 한 번만 발견됐지만, 몰입 유형과 높은 반응 강도가 함께 나타났습니다. 앞으로도 이어지는지 조금 더 지켜볼 만한 신호입니다.`,
    };
  }

  return {
    status: "insufficient",
    target: null,
    title: "몰입 신호를 찾는 중입니다",
    description:
      "반복되는 긍정적 반응은 나타나고 있지만, 아직 하나의 몰입 후보로 보기에는 근거가 충분하지 않습니다.",
  };
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

export const loadImmersionDiscovery = async (
  userId: string,
  days = 7
): Promise<{
  targets: ImmersionTargetEvidence[];
  signal: ImmersionSignal;
}> => {
  const targets = await loadImmersionTargetEvidence(userId, days);

  return {
    targets,
    signal: buildImmersionSignal(targets),
  };
};