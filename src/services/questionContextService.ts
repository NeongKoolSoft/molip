import type { AIInsight } from "@/services/aiInsightService";

import type { DailyLog } from "@/types/dailyLog";

import type {
  ReflectionLoopContext,
} from "@/types/reflectionLoop";

import type {
  ReflectionMainThread,
  ReflectionQuestionContextV2,
} from "@/types/reflectionContext";

const MAX_RECENT_EVIDENCE = 3;

const normalizeText = (value: string): string => {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const splitSentences = (
  value: string
): string[] => {
  const normalized = normalizeText(value);

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
};

const selectLatestLog = (
  logs: DailyLog[]
): DailyLog | null => {
  if (logs.length === 0) {
    return null;
  }

  return [...logs].sort((a, b) => {
    return b.log_date.localeCompare(a.log_date);
  })[0];
};

const selectRecentEvidence = (
  latestRecord: string
): string[] => {
  const sentences =
    splitSentences(latestRecord);

  return sentences.slice(
    -MAX_RECENT_EVIDENCE
  );
};

const selectLatestFocus = (
  recentEvidence: string[]
): string | null => {
  return recentEvidence.at(-1) ?? null;
};

const selectThreadFocus = ({
  evidence,
  fallback,
}: {
  evidence: string[];
  fallback: string;
}): {
  focus: string;
  focusReason: string;
} => {
  const thoughtSentence = [...evidence]
    .reverse()
    .find((sentence) =>
      /생각|느낌|기대|걱정|고민|필요|확인|만족|자연스럽|한계|어려움/.test(
        sentence
      )
    );

  if (thoughtSentence) {
    return {
      focus: thoughtSentence,
      focusReason:
        "중심 흐름의 근거 중 현재의 생각이나 고민이 가장 직접적으로 표현된 문장입니다.",
    };
  }

  const latestEvidence =
    evidence.at(-1);

  if (latestEvidence) {
    return {
      focus: latestEvidence,
      focusReason:
        "중심 흐름과 연결된 근거 중 가장 최근에 이어진 문장입니다.",
    };
  }

  return {
    focus: fallback,
    focusReason:
      "별도의 생각 문장을 찾지 못해 중심 대상을 질문 초점으로 사용했습니다.",
  };
};

const selectThoughtPattern = ({
  latestRecord,
  evidence,
}: {
  latestRecord: string;
  evidence: string[];
}) => {
  const sourceSentences =
    evidence.length > 0
      ? evidence
      : splitSentences(latestRecord);

  const expectation =
    [...sourceSentences]
      .reverse()
      .find((sentence) =>
        /기대|바라|원하|높이|좋아지|개선|만족|완성|자연스럽게 작동/.test(
          sentence
        )
      ) ?? null;

  const concern =
    [...sourceSentences]
      .reverse()
      .find((sentence) =>
        /걱정|고민|한계|어렵|불안|확인 필요|문제|많이 들어가|하드코딩|통할지|적용할 수 있을지/.test(
          sentence
        )
      ) ?? null;

  const tension =
    [...sourceSentences]
      .reverse()
      .find((sentence) =>
        /하지만|다만|반면|그렇지만|동시에|해야 하는데|하고 싶지만/.test(
          sentence
        )
      ) ?? null;

  const thoughtEvidence = Array.from(
    new Set(
      [expectation, concern, tension].filter(
        (item): item is string => Boolean(item)
      )
    )
  );

  return {
    expectation,
    concern,
    tension,
    evidence: thoughtEvidence,
  };
};

const selectMainThread = ({
  latestRecord,
  recentEvidence,
  aiInsight,
}: {
  latestRecord: string;
  recentEvidence: string[];
  aiInsight: AIInsight | null;
}): ReflectionMainThread | null => {
  const candidates = (
    aiInsight?.reaction_targets ?? []
  )
    .filter((reaction) => {
      const target =
        reaction.target.trim();

      const normalizedTarget =
        reaction.normalized_target.trim();

      if (!target && !normalizedTarget) {
        return false;
      }

      return (
        (
          target.length > 0 &&
          latestRecord.includes(target)
        ) ||
        (
          normalizedTarget.length > 0 &&
          latestRecord.includes(
            normalizedTarget
          )
        )
      );
    })
    .sort(
      (a, b) => b.weight - a.weight
    );

  const strongestCandidate =
    candidates[0];

  if (strongestCandidate) {
    const target =
      strongestCandidate.target.trim();

    const normalizedTarget =
      strongestCandidate.normalized_target.trim();

    const matchingEvidence =
      recentEvidence.filter(
        (sentence) =>
          (
            target.length > 0 &&
            sentence.includes(target)
          ) ||
          (
            normalizedTarget.length > 0 &&
            sentence.includes(
              normalizedTarget
            )
          )
      );

    const evidence =
      matchingEvidence.length > 0
        ? matchingEvidence
        : strongestCandidate.evidence.trim()
          ? [
              strongestCandidate.evidence.trim(),
            ]
          : [];

    const threadTarget =
      normalizedTarget || target;

    const {
      focus,
      focusReason,
    } = selectThreadFocus({
      evidence,
      fallback: threadTarget,
    });

    const thoughtPattern =
      selectThoughtPattern({
        latestRecord,
        evidence,
    });

    return {
        target: threadTarget,

        reason:
            "오늘 기록 안에서 실제로 등장했고, 가장 강한 반응으로 분석된 중심 흐름입니다.",

        evidence,

        focus,
        focusReason,

        thoughtPattern,
    };
  }

  /**
   * Reaction Target과 오늘 기록의 표현이 정확히 일치하지 않을 때
   * 생각, 기대, 집중 또는 작업 흐름이 드러난 문장을 보조 후보로 삼는다.
   */
  const fallbackSentence =
    recentEvidence.find((sentence) =>
      /기대|집중|하고 싶|중요|만족|몰입|작업|개발|시작/.test(
        sentence
      )
    );

  if (!fallbackSentence) {
    return null;
  }

  const {
    focus,
    focusReason,
  } = selectThreadFocus({
    evidence: [fallbackSentence],
    fallback: fallbackSentence,
  });

  const fallbackEvidence = [
    fallbackSentence,
  ];

  const thoughtPattern =
    selectThoughtPattern({
        latestRecord,
        evidence: fallbackEvidence,
  });

  return {
    target: fallbackSentence,

    reason:
        "최근 기록에서 단순한 완료 사실보다 생각이나 기대가 함께 표현된 문장을 중심 흐름으로 선택했습니다.",

    evidence: fallbackEvidence,

    focus,
    focusReason,

    thoughtPattern,
  };
};

export const createQuestionContext = ({
  logs,
  loopContext,
  aiInsight,
}: {
  logs: DailyLog[];
  loopContext: ReflectionLoopContext;
  aiInsight: AIInsight | null;
}): ReflectionQuestionContextV2 => {
  const latestLog =
    selectLatestLog(logs);

  const latestRecord =
    normalizeText(
      latestLog?.content ?? ""
    );

  const recentEvidence =
    selectRecentEvidence(
      latestRecord
    );

  const latestFocus =
    selectLatestFocus(
      recentEvidence
    );

  const mainThread =
    selectMainThread({
      latestRecord,
      recentEvidence,
      aiInsight,
    });

  return {
    local: {
      latestRecord,
      mainThread,
      latestFocus,
      recentEvidence,

      currentState:
        loopContext.currentState,

      targetState:
        loopContext.targetState,
    },

    global: {
      primaryTarget:
        loopContext.primaryTarget,

      immersionTarget: null,

      weeklySummary: null,
    },
  };
};