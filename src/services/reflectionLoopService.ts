import type { AIInsight } from "@/services/aiInsightService";
import type { DailyLog } from "@/types/dailyLog";

import type {
  ReflectionLoopContext,
  ReflectionQuestionIntent,
  ReflectionRevisionSignal,
  ReflectionState,
  ReflectionTransition,
} from "@/types/reflectionLoop";

type ReflectionSignals = {
  hasDescription: boolean;
  hasConnection: boolean;
  hasDiscovery: boolean;
  hasIntegration: boolean;
};

type CreateReflectionLoopContextParams = {
  logs: DailyLog[];
  aiInsight: AIInsight | null;

  previousQuestion?: string | null;
  revision?: ReflectionRevisionSignal | null;
  transition?: ReflectionTransition | null;
};

const descriptionKeywords = [
  "느꼈",
  "기분",
  "생각",
  "기억",
  "장면",
  "이유",
  "때문",
  "즐거",
  "불안",
  "부담",
  "아쉽",
  "기대",
];

const connectionKeywords = [
  "그리고",
  "하지만",
  "반면",
  "때문에",
  "연결",
  "영향",
  "비교",
  "다르게",
  "함께",
  "균형",
  "하면",
];

const discoveryKeywords = [
  "알게 됐",
  "깨달",
  "발견",
  "중요하",
  "원하",
  "하고 싶",
  "나에게",
  "의미",
  "기준",
  "결국",
  "보니",
  "것 같다",
];

const integrationKeywords = [
  "삶",
  "방향",
  "선택",
  "앞으로",
  "지속",
  "정체성",
  "내가 원하는",
  "살아가",
  "인생",
  "균형",
  "변화",
];

const normalizeText = (logs: DailyLog[]): string => {
  return logs
    .map((log) => log.content ?? "")
    .join("\n")
    .trim();
};

const includesAny = (
  text: string,
  keywords: string[]
): boolean => {
  return keywords.some((keyword) => text.includes(keyword));
};

const countSentences = (text: string): number => {
  return text
    .split(/[.!?。\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
};

const detectSignals = (
  text: string,
  aiInsight: AIInsight | null
): ReflectionSignals => {
  const sentenceCount = countSentences(text);

  const hasDescription =
    sentenceCount >= 2 ||
    includesAny(text, descriptionKeywords);

  const hasConnection =
    includesAny(text, connectionKeywords) ||
    (aiInsight?.reaction_targets.length ?? 0) >= 2;

  const hasDiscovery =
    includesAny(text, discoveryKeywords) ||
    Boolean(aiInsight?.reflection_gap);

  const hasIntegration =
    includesAny(text, integrationKeywords) &&
    hasDiscovery;

  return {
    hasDescription,
    hasConnection,
    hasDiscovery,
    hasIntegration,
  };
};

const determineCurrentState = (
  signals: ReflectionSignals
): ReflectionState => {
  if (signals.hasIntegration) {
    return "integration";
  }

  if (signals.hasDiscovery) {
    return "discovery";
  }

  if (signals.hasConnection) {
    return "connection";
  }

  if (signals.hasDescription) {
    return "description";
  }

  return "observation";
};

const determineTargetState = (
  currentState: ReflectionState
): ReflectionState => {
  switch (currentState) {
    case "observation":
      return "description";

    case "description":
      return "connection";

    case "connection":
      return "discovery";

    case "discovery":
      return "integration";

    case "integration":
      return "integration";
  }
};

const determineQuestionIntent = (
  targetState: ReflectionState
): ReflectionQuestionIntent => {
  switch (targetState) {
    case "observation":
    case "description":
      return "describe";

    case "connection":
      return "connect";

    case "discovery":
      return "discover";

    case "integration":
      return "integrate";
  }
};

const selectPrimaryTarget = (
  aiInsight: AIInsight | null
): string | null => {
  const strongestReaction = [
    ...(aiInsight?.reaction_targets ?? []),
  ].sort((a, b) => b.weight - a.weight)[0];

  return strongestReaction?.normalized_target ?? null;
};

const buildReason = (
  currentState: ReflectionState,
  signals: ReflectionSignals
): string => {
  switch (currentState) {
    case "observation":
      return "기록에 사건이나 행동은 나타나지만, 장면이나 감정의 설명은 아직 제한적입니다.";

    case "description":
      return "경험과 반응이 구체화되었지만, 다른 경험이나 반복 흐름과의 연결은 아직 충분히 드러나지 않았습니다.";

    case "connection":
      return "둘 이상의 경험이나 반응 사이의 관계가 나타났지만, 그 관계가 사용자에게 어떤 의미인지 아직 충분히 표현되지 않았습니다.";

    case "discovery":
      return "사용자가 새로운 기준이나 의미를 발견했지만, 그것이 삶의 방향이나 선택과 어떻게 이어지는지는 더 살펴볼 수 있습니다.";

    case "integration":
      return signals.hasIntegration
        ? "기록 속 발견이 삶의 선택이나 방향과 연결되어 있습니다."
        : "기록 속 의미가 비교적 넓은 삶의 맥락과 연결되어 있습니다.";
  }
};

const selectEvidence = (
  logs: DailyLog[],
  limit = 3
): string[] => {
  return logs
    .flatMap((log) =>
      (log.content ?? "")
        .split(/[.!?。\n]+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
    )
    .slice(-limit);
};

const selectLatestFocus = (
  logs: DailyLog[]
): string | null => {
  const latestSentences = logs
    .flatMap((log) =>
      (log.content ?? "")
        .split(/[.!?。\n]+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
    );

  return latestSentences.at(-1) ?? null;
};

export const createReflectionLoopContext = ({
  logs,
  aiInsight,
  previousQuestion = null,
  revision = null,
  transition = null,
}: CreateReflectionLoopContextParams): ReflectionLoopContext => {
  const text = normalizeText(logs);
  const signals = detectSignals(text, aiInsight);

  const detectedState = determineCurrentState(signals);

  /**
   * 질문 이후 실제 수정 결과가 있다면
   * 키워드 기반 판정보다 Transition 결과를 우선한다.
   */
  const currentState =
    transition?.toState ?? detectedState;

  const targetState = determineTargetState(currentState);

  const transitionEvidence =
    transition?.evidence ?? [];

  const detectedEvidence = selectEvidence(logs);

  const evidence =
    transitionEvidence.length > 0
      ? transitionEvidence
      : detectedEvidence;

  const reason =
    transition?.reason ??
    buildReason(currentState, signals);

    return {
        currentState,
        targetState,

        primaryTarget: selectPrimaryTarget(aiInsight),
        latestFocus: selectLatestFocus(logs),

        reason,
        evidence,

        questionIntent:
            determineQuestionIntent(targetState),

        previousQuestion,

        revision,
        transition,
    };
};