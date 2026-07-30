import type {
  ReflectionLoopContext,
  ReflectionQuestionContext,
} from "@/types/reflectionLoop";

const MAX_EVIDENCE_COUNT = 3;

const normalizeEvidence = (
  evidence: string[]
): string[] => {
  const uniqueEvidence = new Set<string>();

  for (const item of evidence) {
    const normalized = item.trim();

    if (!normalized) {
      continue;
    }

    uniqueEvidence.add(normalized);

    if (uniqueEvidence.size >= MAX_EVIDENCE_COUNT) {
      break;
    }
  }

  return [...uniqueEvidence];
};

export const createReflectionQuestionContext = (
  loopContext: ReflectionLoopContext
): ReflectionQuestionContext => {
  return {
    currentState: loopContext.currentState,
    targetState: loopContext.targetState,

    questionIntent: loopContext.questionIntent,

    primaryTarget: loopContext.primaryTarget,
    latestFocus: loopContext.latestFocus,

    previousQuestion: loopContext.previousQuestion,

    evidence: normalizeEvidence(
      loopContext.evidence
    ),

    revisionDirection:
      loopContext.revision?.direction ?? null,

    transitionType:
      loopContext.transition?.transitionType ?? null,
  };
};

export const getReflectionQuestionInstruction = (
  context: ReflectionQuestionContext
): string => {
  switch (context.questionIntent) {
    case "describe":
      return [
        "기록 속 대상이나 순간을 더 구체적으로 표현하도록 돕는다.",
        "의미나 삶의 방향으로 너무 빨리 확장하지 않는다.",
        "장면, 반응, 느낌 중 하나만 묻는다.",
      ].join(" ");

    case "connect":
      return [
        "현재 기록과 이미 드러난 다른 경험 또는 반응 사이의 관계를 바라보게 한다.",
        "기록에 없는 대상을 새로 끌어오지 않는다.",
        "두 화제를 억지로 비교하지 않는다.",
      ].join(" ");

    case "discover":
      return [
        "사용자가 아직 직접 표현하지 않은 기준이나 의미를 발견하도록 돕는다.",
        "AI가 의미를 먼저 단정하지 않는다.",
        "사용자가 자신의 언어로 발견할 여지를 남긴다.",
      ].join(" ");

    case "integrate":
      return [
        "이미 발견된 의미가 사용자의 선택이나 삶의 흐름과 어떻게 이어지는지 바라보게 한다.",
        "행동 계획이나 조언을 요구하지 않는다.",
        "정체성을 단정하지 않는다.",
      ].join(" ");
  }
};