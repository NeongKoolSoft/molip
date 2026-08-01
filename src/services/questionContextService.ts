import type { AIInsight } from "@/services/aiInsightService";

import type { DailyLog } from "@/types/dailyLog";

import type {
  ReflectionLoopContext,
} from "@/types/reflectionLoop";

import type {
  ReflectionMainThread,
  ReflectionQuestionContextV2,
} from "@/types/reflectionContext";

import type {
  ReflectionContextAnalysis,
} from "@/types/reflectionContextAnalysis";

const MAX_RECENT_EVIDENCE = 3;
const MAX_THREAD_EVIDENCE = 3;

const EMPTY_THOUGHT_PATTERN = {
  expectation: null,
  concern: null,
  tension: null,
  evidence: [],
};

const normalizeText = (
  value: string
): string => {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const normalizeOptionalText = (
  value: string | null | undefined
): string | null => {
  if (!value) {
    return null;
  }

  const normalized = normalizeText(value);

  return normalized || null;
};

const splitSentences = (
  value: string
): string[] => {
  const normalized =
    normalizeText(value);

  if (!normalized) {
    return [];
  }

  return normalized
    .split(
      /(?<=[.!?。！？])\s+|\n+/
    )
    .map((sentence) =>
      sentence.trim()
    )
    .filter(Boolean);
};

const selectLatestLog = (
  logs: DailyLog[]
): DailyLog | null => {
  if (logs.length === 0) {
    return null;
  }

  return [...logs].sort(
    (a, b) =>
      b.log_date.localeCompare(
        a.log_date
      )
  )[0];
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
  return (
    recentEvidence.at(-1) ??
    null
  );
};

const uniqueTexts = (
  values: Array<
    string | null | undefined
  >
): string[] => {
  return Array.from(
    new Set(
      values
        .map((value) =>
          normalizeOptionalText(value)
        )
        .filter(
          (
            value
          ): value is string =>
            Boolean(value)
        )
    )
  );
};

const validateEvidence = ({
  evidence,
  latestRecord,
}: {
  evidence: string[];
  latestRecord: string;
}): string[] => {
  const normalizedRecord =
    normalizeText(latestRecord);

  if (!normalizedRecord) {
    return [];
  }

  return uniqueTexts(evidence)
    .filter((item) => {
      return (
        normalizedRecord.includes(
          item
        ) ||
        item.includes(
          normalizedRecord
        )
      );
    })
    .slice(
      0,
      MAX_THREAD_EVIDENCE
    );
};

const findEvidenceForTarget = ({
  target,
  latestRecord,
}: {
  target: string;
  latestRecord: string;
}): string[] => {
  const normalizedTarget =
    normalizeText(target);

  if (!normalizedTarget) {
    return [];
  }

  return splitSentences(
    latestRecord
  )
    .filter((sentence) =>
      sentence.includes(
        normalizedTarget
      )
    )
    .slice(
      -MAX_THREAD_EVIDENCE
    );
};

const createThoughtPattern = (
  reflectionAnalysis:
    | ReflectionContextAnalysis
    | null
    | undefined,
  latestRecord: string
) => {
  if (!reflectionAnalysis) {
    return {
      ...EMPTY_THOUGHT_PATTERN,
    };
  }

  const {
    expectation,
    concern,
    tension,
    evidence,
  } =
    reflectionAnalysis.thoughtPattern;

  const normalizedExpectation =
    normalizeOptionalText(
      expectation
    );

  const normalizedConcern =
    normalizeOptionalText(
      concern
    );

  const normalizedTension =
    normalizeOptionalText(
      tension
    );

  const validatedEvidence =
    validateEvidence({
      evidence,
      latestRecord,
    });

  return {
    expectation:
      normalizedExpectation,
    concern: normalizedConcern,
    tension: normalizedTension,
    evidence: validatedEvidence,
  };
};

const createMainThreadFromAnalysis =
  ({
    reflectionAnalysis,
    latestRecord,
    recentEvidence,
  }: {
    reflectionAnalysis:
      ReflectionContextAnalysis;
    latestRecord: string;
    recentEvidence: string[];
  }): ReflectionMainThread | null => {
    const analyzedMainThread =
      reflectionAnalysis.mainThread;

    if (!analyzedMainThread) {
      return null;
    }

    const target =
      normalizeOptionalText(
        analyzedMainThread.target
      );

    if (!target) {
      return null;
    }

    const reason =
      normalizeOptionalText(
        analyzedMainThread.reason
      ) ??
      "AI가 오늘 기록에서 선택한 중심 흐름입니다.";

    const mainThreadEvidence =
      validateEvidence({
        evidence:
          analyzedMainThread.evidence,
        latestRecord,
      });

    const targetEvidence =
      findEvidenceForTarget({
        target,
        latestRecord,
      });

    const evidence =
      mainThreadEvidence.length > 0
        ? mainThreadEvidence
        : targetEvidence.length > 0
          ? targetEvidence
          : recentEvidence.slice(-1);

    const analyzedFocus =
      reflectionAnalysis.focus;

    const focus =
      normalizeOptionalText(
        analyzedFocus?.text
      ) ??
      evidence.at(-1) ??
      target;

    const focusReason =
      normalizeOptionalText(
        analyzedFocus?.reason
      ) ??
      "중심 흐름과 연결된 질문 초점입니다.";

    const thoughtPattern =
      createThoughtPattern(
        reflectionAnalysis,
        latestRecord
      );

    return {
      target,
      reason,
      evidence,
      focus,
      focusReason,
      thoughtPattern,
    };
  };

const createMainThreadFromAIInsight =
  ({
    latestRecord,
    recentEvidence,
    aiInsight,
  }: {
    latestRecord: string;
    recentEvidence: string[];
    aiInsight: AIInsight | null;
  }): ReflectionMainThread | null => {
    const candidates = (
      aiInsight?.reaction_targets ??
      []
    )
      .filter((reaction) => {
        const target =
          normalizeOptionalText(
            reaction.target
          );

        const normalizedTarget =
          normalizeOptionalText(
            reaction.normalized_target
          );

        if (
          !target &&
          !normalizedTarget
        ) {
          return false;
        }

        return (
          Boolean(
            target &&
              latestRecord.includes(
                target
              )
          ) ||
          Boolean(
            normalizedTarget &&
              latestRecord.includes(
                normalizedTarget
              )
          )
        );
      })
      .sort(
        (a, b) =>
          b.weight - a.weight
      );

    const strongestCandidate =
      candidates[0];

    if (!strongestCandidate) {
      return null;
    }

    const target =
      normalizeOptionalText(
        strongestCandidate.target
      );

    const normalizedTarget =
      normalizeOptionalText(
        strongestCandidate
          .normalized_target
      );

    const threadTarget =
      normalizedTarget ??
      target;

    if (!threadTarget) {
      return null;
    }

    const targetEvidence =
      findEvidenceForTarget({
        target:
          target ?? threadTarget,
        latestRecord,
      });

    const normalizedTargetEvidence =
      findEvidenceForTarget({
        target: threadTarget,
        latestRecord,
      });

    const reactionEvidence =
      normalizeOptionalText(
        strongestCandidate.evidence
      );

    const evidence = uniqueTexts([
      ...targetEvidence,
      ...normalizedTargetEvidence,
      reactionEvidence &&
      latestRecord.includes(
        reactionEvidence
      )
        ? reactionEvidence
        : null,
    ]).slice(
      0,
      MAX_THREAD_EVIDENCE
    );

    const safeEvidence =
      evidence.length > 0
        ? evidence
        : recentEvidence.slice(-1);

    const focus =
      safeEvidence.at(-1) ??
      threadTarget;

    return {
      target: threadTarget,

      reason:
        "오늘 기록에 실제로 등장한 반응 대상 중 가장 강한 항목을 임시 중심 흐름으로 사용했습니다.",

      evidence:
        safeEvidence,

      focus,

      focusReason:
        "LLM 기반 Reflection Context 분석 결과가 없어 중심 흐름과 연결된 최근 근거를 임시 질문 초점으로 사용했습니다.",

      thoughtPattern: {
        ...EMPTY_THOUGHT_PATTERN,
      },
    };
  };

const selectMainThread = ({
  latestRecord,
  recentEvidence,
  aiInsight,
  reflectionAnalysis,
}: {
  latestRecord: string;
  recentEvidence: string[];
  aiInsight: AIInsight | null;
  reflectionAnalysis?:
    | ReflectionContextAnalysis
    | null;
}): ReflectionMainThread | null => {
  if (reflectionAnalysis) {
    const analyzedMainThread =
      createMainThreadFromAnalysis({
        reflectionAnalysis,
        latestRecord,
        recentEvidence,
      });

    if (analyzedMainThread) {
      return analyzedMainThread;
    }
  }

  return createMainThreadFromAIInsight({
    latestRecord,
    recentEvidence,
    aiInsight,
  });
};

export const createQuestionContext = ({
  logs,
  loopContext,
  aiInsight,
  reflectionAnalysis = null,
}: {
  logs: DailyLog[];
  loopContext: ReflectionLoopContext;
  aiInsight: AIInsight | null;
  reflectionAnalysis?:
    | ReflectionContextAnalysis
    | null;
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
      reflectionAnalysis,
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