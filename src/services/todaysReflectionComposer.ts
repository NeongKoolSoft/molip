import type { AIInsight } from "@/services/aiInsightService";
import type { GrowthSignal } from "@/types/growthSignal";
import type { MeaningGrowth } from "@/types/meaningGrowth";
import type { ImmersionTargetEvidence } from "@/types/immersionDiscovery";
import type { TodaysReflectionContext } from "@/types/todaysReflection";

type ComposeTodaysReflectionContextParams = {
  dailyLogId: string | null;
  logDate: string;
  latestRevisionNumber: number | null;

  aiInsight: AIInsight | null;
  growthSignal: GrowthSignal | null;
  meaningGrowth: MeaningGrowth | null;
  immersionTargets: ImmersionTargetEvidence[];  

};

const selectMainReaction = (aiInsight: AIInsight | null) => {
  if (!aiInsight || aiInsight.reaction_targets.length === 0) {
    return null;
  }

  const orderedTargets = [...aiInsight.reaction_targets].sort(
    (a, b) => b.weight - a.weight
  );

  const main = orderedTargets[0];

  return {
    target: main.normalized_target,
    type: main.type,
    weight: main.weight,
    evidence: main.evidence,
  };
};

const selectImmersionEvidence = (
  mainTarget: string | null,
  immersionTargets: ImmersionTargetEvidence[]
) => {
  if (immersionTargets.length === 0) {
    return null;
  }

  const matchedTarget = mainTarget
    ? immersionTargets.find((item) => item.target === mainTarget)
    : null;

  const selected = matchedTarget ?? immersionTargets[0];

  return {
    target: selected.target,
    frequency: selected.frequency,
    averageWeight: selected.averageWeight,
    latestWeight: selected.latestWeight,
    trend: selected.trend,
    dominantType: selected.dominantType,
  };
};

export const composeTodaysReflectionContext = ({
  dailyLogId,
  logDate,
  latestRevisionNumber,
  aiInsight,
  growthSignal,
  meaningGrowth,
  immersionTargets,

}: ComposeTodaysReflectionContextParams): TodaysReflectionContext => {
  const mainReaction = selectMainReaction(aiInsight);

  const immersionEvidence = selectImmersionEvidence(
    mainReaction?.target ?? null,
    immersionTargets
  );

  return {
    dailyLogId,
    logDate,
    latestRevisionNumber,

    mainReaction,

    growth: growthSignal
      ? {
          revisionCount: growthSignal.revisionCount,
          editCount: growthSignal.editCount,
          lengthChange: growthSignal.lengthChange,
          sentenceChange: growthSignal.sentenceChange,
          summary: growthSignal.summary,
        }
      : null,

    meaningGrowth: meaningGrowth
      ? {
          hasMeaningGrowth: meaningGrowth.hasMeaningGrowth,
          fromStage: meaningGrowth.fromStage,
          toStage: meaningGrowth.toStage,
          addedMeanings: meaningGrowth.addedMeanings,
          evidence: meaningGrowth.evidence,
          summary: meaningGrowth.summary,
        }
      : null,

    immersionEvidence,
  };
};