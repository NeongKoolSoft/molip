import type {
  AIInsight,
  ReactionTarget,
} from "@/services/aiInsightService";

import type { GrowthSignal } from "@/types/growthSignal";
import type { MeaningGrowth } from "@/types/meaningGrowth";
import type { ImmersionTargetEvidence } from "@/types/immersionDiscovery";

import type {
  ReflectionEvidence,
  ReflectionTheme,
  ReflectionThemeReason,
  ReflectionTone,
  StoryFlowStep,
  TodaysReflectionContext,
} from "@/types/todaysReflection";

type ComposeTodaysReflectionContextParams = {
  dailyLogId: string | null;
  logDate: string;
  latestRevisionNumber: number | null;

  aiInsight: AIInsight | null;
  growthSignal: GrowthSignal | null;
  meaningGrowth: MeaningGrowth | null;
  immersionTargets: ImmersionTargetEvidence[];
};

type ThemeCandidate = {
  target: string;
  reactionType: ReactionTarget["type"];
  reactionWeight: number;
  frequency: number;
  meaningBonus: number;
};

const clamp = (value: number, min = 0, max = 1) => {
  return Math.min(max, Math.max(min, value));
};

const round = (value: number, digits = 2) => {
  const multiplier = 10 ** digits;

  return Math.round(value * multiplier) / multiplier;
};

/**
 * 최근 7일 출현 빈도를 0~1 범위로 보정한다.
 *
 * 1회: 약한 보정
 * 3회 이상: 반복 신호
 * 7회 이상: 최대값
 */
const normalizeFrequency = (frequency: number) => {
  return clamp(frequency / 7);
};

const getThemeReason = ({
  reactionWeight,
  frequency,
  meaningBonus,
}: {
  reactionWeight: number;
  frequency: number;
  meaningBonus: number;
}): ReflectionThemeReason => {
  const weightScore = reactionWeight;
  const frequencyScore = normalizeFrequency(frequency);
  const meaningScore = meaningBonus;

  const highestScore = Math.max(
    weightScore,
    frequencyScore,
    meaningScore
  );

  if (highestScore === meaningScore && meaningScore > 0) {
    return "meaning_growth";
  }

  if (highestScore === frequencyScore && frequency > 1) {
    return "frequency";
  }

  return "weight";
};

/**
 * V2의 초기 중요도 가설이다.
 *
 * 오늘 반응 강도       50%
 * 최근 반복 빈도       35%
 * Meaning Growth 보정  15%
 *
 * 아직 Meaning Growth가 특정 Reaction Target과 직접 연결되지 않으므로,
 * 의미 확장이 있는 경우 오늘의 가장 강한 Reaction에만 bonus를 적용한다.
 */
const calculateImportance = ({
  reactionWeight,
  frequency,
  meaningBonus,
}: ThemeCandidate) => {
  const weightScore = clamp(reactionWeight) * 0.5;
  const frequencyScore = normalizeFrequency(frequency) * 0.35;
  const meaningScore = clamp(meaningBonus) * 0.15;

  return round(
    weightScore + frequencyScore + meaningScore,
    3
  );
};

const findImmersionTarget = (
  target: string,
  immersionTargets: ImmersionTargetEvidence[]
) => {
  return immersionTargets.find(
    (item) => item.target === target
  );
};

const createThemeCandidates = (
  aiInsight: AIInsight | null,
  meaningGrowth: MeaningGrowth | null,
  immersionTargets: ImmersionTargetEvidence[]
): ThemeCandidate[] => {
  const reactions = aiInsight?.reaction_targets ?? [];

  if (reactions.length === 0) {
    return immersionTargets.map((item) => ({
      target: item.target,
      reactionType: item.dominantType,
      reactionWeight: item.latestWeight,
      frequency: item.frequency,
      meaningBonus: 0,
    }));
  }

  const strongestReaction = [...reactions].sort(
    (a, b) => b.weight - a.weight
  )[0];

  const hasMeaningGrowth =
    meaningGrowth?.hasMeaningGrowth === true;

  const candidateMap = new Map<string, ThemeCandidate>();

  for (const reaction of reactions) {
    const target = reaction.normalized_target.trim();

    if (!target) {
      continue;
    }

    const immersionTarget = findImmersionTarget(
      target,
      immersionTargets
    );

    const existing = candidateMap.get(target);

    const candidate: ThemeCandidate = {
      target,
      reactionType: reaction.type,
      reactionWeight: Math.max(
        reaction.weight,
        existing?.reactionWeight ?? 0
      ),
      frequency:
        immersionTarget?.frequency ??
        existing?.frequency ??
        1,

      // V2에서는 Meaning Growth의 대상 연결 정보가 없으므로
      // 오늘 가장 강한 반응 대상에만 제한적으로 적용한다.
      meaningBonus:
        hasMeaningGrowth &&
        target === strongestReaction.normalized_target
          ? 1
          : existing?.meaningBonus ?? 0,
    };

    candidateMap.set(target, candidate);
  }

  /**
   * 오늘 기록에는 없지만 최근 7일 동안 반복된 대상도
   * Supporting Theme 후보로 포함한다.
   */
  for (const immersionTarget of immersionTargets) {
    if (candidateMap.has(immersionTarget.target)) {
      continue;
    }

    candidateMap.set(immersionTarget.target, {
      target: immersionTarget.target,
      reactionType: immersionTarget.dominantType,
      reactionWeight: immersionTarget.latestWeight,
      frequency: immersionTarget.frequency,
      meaningBonus: 0,
    });
  }

  return [...candidateMap.values()];
};

const createReflectionThemes = (
  candidates: ThemeCandidate[]
): ReflectionTheme[] => {
  return candidates
    .map((candidate) => ({
      target: candidate.target,
      importance: calculateImportance(candidate),
      reason: getThemeReason({
        reactionWeight: candidate.reactionWeight,
        frequency: candidate.frequency,
        meaningBonus: candidate.meaningBonus,
      }),
      reactionType: candidate.reactionType,
    }))
    .sort((a, b) => b.importance - a.importance);
};

const determineTone = (
  primaryTheme: ReflectionTheme | null,
  aiInsight: AIInsight | null
): ReflectionTone => {
  const reactionType = primaryTheme?.reactionType;

  if (
    reactionType === "burden" ||
    reactionType === "concern" ||
    reactionType === "avoidance"
  ) {
    return "careful";
  }

  if (reactionType === "energy") {
    return "energetic";
  }

  if (
    reactionType === "joy" ||
    reactionType === "desire" ||
    reactionType === "immersion"
  ) {
    return "hopeful";
  }

  if (aiInsight?.overall_energy === "높음") {
    return "energetic";
  }

  return "calm";
};

const createStoryFlow = ({
  growthSignal,
  meaningGrowth,
  supportingThemes,
}: {
  growthSignal: GrowthSignal | null;
  meaningGrowth: MeaningGrowth | null;
  supportingThemes: ReflectionTheme[];
}): StoryFlowStep[] => {
  const storyFlow: StoryFlowStep[] = ["main_theme"];

  if (
    growthSignal &&
    growthSignal.revisionCount > 1
  ) {
    storyFlow.push("growth");
  }

  if (meaningGrowth?.hasMeaningGrowth) {
    storyFlow.push("meaning");
  }

  if (supportingThemes.length > 0) {
    storyFlow.push("supporting");
  }

  storyFlow.push("closing");

  return storyFlow;
};

const selectMainReactionEvidence = (
  primaryTheme: ReflectionTheme | null,
  aiInsight: AIInsight | null
): ReflectionEvidence["reaction"] => {
  if (!primaryTheme || !aiInsight) {
    return null;
  }

  const matchedReaction = aiInsight.reaction_targets
    .filter(
      (item) =>
        item.normalized_target === primaryTheme.target
    )
    .sort((a, b) => b.weight - a.weight)[0];

  if (!matchedReaction) {
    return null;
  }

  return {
    target: matchedReaction.normalized_target,
    type: matchedReaction.type,
    weight: matchedReaction.weight,
    evidence: matchedReaction.evidence,
  };
};

const selectImmersionEvidence = (
  primaryTheme: ReflectionTheme | null,
  immersionTargets: ImmersionTargetEvidence[]
): ReflectionEvidence["immersion"] => {
  if (!primaryTheme || immersionTargets.length === 0) {
    return null;
  }

  const matchedTarget = immersionTargets.find(
    (item) => item.target === primaryTheme.target
  );

  if (!matchedTarget) {
    return null;
  }

  return {
    target: matchedTarget.target,
    frequency: matchedTarget.frequency,
    averageWeight: matchedTarget.averageWeight,
    latestWeight: matchedTarget.latestWeight,
    trend: matchedTarget.trend,
    dominantType: matchedTarget.dominantType,
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
  const candidates = createThemeCandidates(
    aiInsight,
    meaningGrowth,
    immersionTargets
  );

  const themes = createReflectionThemes(candidates);

  const primaryTheme = themes[0] ?? null;

  /**
   * Supporting Theme은 이야기 중심이 흐려지지 않도록
   * 최대 2개만 전달한다.
   */
  const supportingThemes = themes.slice(1, 3);

  const tone = determineTone(
    primaryTheme,
    aiInsight
  );

  const storyFlow = createStoryFlow({
    growthSignal,
    meaningGrowth,
    supportingThemes,
  });

  const evidence: ReflectionEvidence = {
    reaction: selectMainReactionEvidence(
      primaryTheme,
      aiInsight
    ),

    growth: growthSignal
      ? {
          revisionCount: growthSignal.revisionCount,
          editCount: growthSignal.editCount,
          lengthChange: growthSignal.lengthChange,
          sentenceChange: growthSignal.sentenceChange,
          summary: growthSignal.summary,
        }
      : null,

    meaning: meaningGrowth
      ? {
          hasMeaningGrowth:
            meaningGrowth.hasMeaningGrowth,
          fromStage: meaningGrowth.fromStage,
          toStage: meaningGrowth.toStage,
          addedMeanings: meaningGrowth.addedMeanings,
          evidence: meaningGrowth.evidence,
          summary: meaningGrowth.summary,
        }
      : null,

    immersion: selectImmersionEvidence(
      primaryTheme,
      immersionTargets
    ),
  };

  return {
    dailyLogId,
    logDate,
    latestRevisionNumber,

    primaryTheme,
    supportingThemes,

    tone,
    storyFlow,

    evidence,
  };
};