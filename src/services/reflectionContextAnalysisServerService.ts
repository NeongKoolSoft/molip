import { generateAIText } from "@/providers";

import type {
  AIInsight,
  ReactionTarget,
} from "@/services/aiInsightService";

import type {
  ReflectionContextAnalysis,
} from "@/types/reflectionContextAnalysis";

const MAX_EVIDENCE = 3;

const EMPTY_ANALYSIS: ReflectionContextAnalysis = {
  mainThread: null,

  focus: null,

  thoughtPattern: {
    expectation: null,
    concern: null,
    tension: null,
    evidence: [],
  },
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

const toOptionalText = (
  value: unknown
): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    normalizeText(value);

  return normalized || null;
};

const toStringArray = (
  value: unknown
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map(toOptionalText)
        .filter(
          (
            item
          ): item is string =>
            Boolean(item)
        )
    )
  ).slice(0, MAX_EVIDENCE);
};

const isRecord = (
  value: unknown
): value is Record<
  string,
  unknown
> => {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value)
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

  return evidence
    .filter((item) => {
      const normalizedItem =
        normalizeText(item);

      return (
        normalizedItem.length > 0 &&
        normalizedRecord.includes(
          normalizedItem
        )
      );
    })
    .slice(0, MAX_EVIDENCE);
};

const createReactionTargetInput = (
  reactionTargets: ReactionTarget[]
) => {
  return reactionTargets
    .slice(0, 5)
    .map((reaction) => ({
      target: reaction.target,
      normalized_target:
        reaction.normalized_target,
      type: reaction.type,
      weight: reaction.weight,
      evidence: reaction.evidence,
    }));
};

const parseAnalysisResult = ({
  parsed,
  latestRecord,
}: {
  parsed: unknown;
  latestRecord: string;
}): ReflectionContextAnalysis => {
  if (!isRecord(parsed)) {
    throw new Error(
      "Reflection Context 분석 결과가 올바른 JSON 객체가 아닙니다."
    );
  }

  const rawMainThread =
    isRecord(parsed.mainThread)
      ? parsed.mainThread
      : null;

  const mainThreadTarget =
    toOptionalText(
      rawMainThread?.target
    );

  const mainThreadReason =
    toOptionalText(
      rawMainThread?.reason
    );

  const mainThreadEvidence =
    validateEvidence({
      evidence: toStringArray(
        rawMainThread?.evidence
      ),
      latestRecord,
    });

  const mainThread =
    mainThreadTarget
      ? {
          target:
            mainThreadTarget,

          reason:
            mainThreadReason ??
            "오늘 기록에서 가장 중심적으로 이어지는 흐름입니다.",

          evidence:
            mainThreadEvidence,
        }
      : null;

  const rawFocus =
    isRecord(parsed.focus)
      ? parsed.focus
      : null;

  const focusText =
    toOptionalText(
      rawFocus?.text
    );

  const focusReason =
    toOptionalText(
      rawFocus?.reason
    );

  const focusEvidence =
    validateEvidence({
      evidence: toStringArray(
        rawFocus?.evidence
      ),
      latestRecord,
    });

  const focus =
    focusText
      ? {
          text: focusText,

          reason:
            focusReason ??
            "중심 흐름에서 한 단계 더 생각해 볼 지점입니다.",

          evidence:
            focusEvidence,
        }
      : null;

  const rawThoughtPattern =
    isRecord(
      parsed.thoughtPattern
    )
      ? parsed.thoughtPattern
      : null;

  const thoughtPattern = {
    expectation:
      toOptionalText(
        rawThoughtPattern?.expectation
      ),

    concern:
      toOptionalText(
        rawThoughtPattern?.concern
      ),

    tension:
      toOptionalText(
        rawThoughtPattern?.tension
      ),

    evidence:
      validateEvidence({
        evidence: toStringArray(
          rawThoughtPattern?.evidence
        ),
        latestRecord,
      }),
  };

  return {
    mainThread,
    focus,
    thoughtPattern,
  };
};

export const analyzeReflectionContextOnServer =
  async ({
    latestRecord,
    aiInsight,
  }: {
    latestRecord: string;
    aiInsight: AIInsight | null;
  }): Promise<ReflectionContextAnalysis> => {
    const normalizedRecord =
      normalizeText(latestRecord);

    if (!normalizedRecord) {
      return EMPTY_ANALYSIS;
    }

    const reactionTargets =
      createReactionTargetInput(
        aiInsight?.reaction_targets ??
          []
      );

    const prompt = `
너는 Molip Reflection Loop V3의
Reflection Context Analyzer다.

Molip는 사용자가 자신의 기록 속 반응을 다시 바라보고,
아직 충분히 말하지 않은 생각을 이어가도록 돕는다.

너의 역할은 질문을 직접 만드는 것이 아니다.

오늘 기록을 이해하여
Question Engine V3가 사용할 다음 세 가지 Context를 추출한다.

1. mainThread
2. focus
3. thoughtPattern

반드시 올바른 JSON 객체 하나만 반환하라.
마크다운 코드 블록을 사용하지 마라.
JSON 앞뒤에 설명을 작성하지 마라.

────────────────────────────
1. 분석 우선순위
────────────────────────────

분석할 때 다음 우선순위를 따른다.

1. 오늘 기록 원문
2. Reaction Target의 evidence
3. Reaction Target의 target과 normalized_target
4. 기존 AI 요약

Reaction Target과 AI 요약은 보조 자료다.

오늘 기록 원문과 충돌할 경우
반드시 원문을 우선한다.

────────────────────────────
2. Main Thread
────────────────────────────

mainThread는 오늘 기록에서
가장 중심적으로 이어지는 대상, 사건, 생각 또는 고민이다.

단순히 마지막 문장을 선택하지 않는다.

다음 신호를 종합적으로 판단한다.

- 여러 문장에서 반복되는 대상
- 사용자가 설명을 많이 붙인 대상
- 감정이나 에너지 변화가 연결된 대상
- 선택이나 판단이 필요한 대상
- 아직 결론이 충분히 나지 않은 흐름
- 다른 기록 내용들을 연결하는 중심 주제

target 규칙:

1. 짧고 구체적인 표현으로 작성한다.
2. 사용자의 기록에서 멀어진 심리 용어를 사용하지 않는다.
3. 사용자를 성격이나 유형으로 정의하지 않는다.
4. 단순한 키워드보다 현재 기록의 맥락이 드러나게 작성한다.
5. 중심 흐름이 분명하지 않으면 mainThread는 null로 반환한다.

reason 규칙:

1. 왜 이 흐름을 중심으로 선택했는지 설명한다.
2. 사용자를 평가하거나 단정하지 않는다.
3. 기록에서 관찰되는 근거만 설명한다.

evidence 규칙:

1. 반드시 오늘 기록 원문에 실제로 존재하는 문장을 사용한다.
2. 문장을 새로 만들거나 요약하지 않는다.
3. 최대 3개까지만 반환한다.
4. 중심 흐름과 직접 연결된 문장만 선택한다.

────────────────────────────
3. Focus
────────────────────────────

focus는 mainThread 전체를 다시 설명하는 것이 아니다.

질문이 실제로 한 단계 더 파고들어야 할
구체적인 생각의 지점이다.

좋은 focus는 다음 중 하나다.

- 사용자가 판단하려 하지만 아직 결론 내리지 않은 부분
- 기대와 현실이 갈리는 부분
- 중요하다고 느끼지만 이유를 충분히 쓰지 않은 부분
- 결과보다 과정에서 마음이 움직인 순간
- 서로 다른 반응이 동시에 나타나는 지점
- 기록 속에서 의미가 암시됐지만 설명되지 않은 연결점

focus.text 규칙:

1. 질문 문장으로 작성하지 않는다.
2. 기록을 그대로 반복하지 않는다.
3. 질문이 탐색할 생각의 방향을 짧게 표현한다.
4. 조언이나 행동 지시를 포함하지 않는다.
5. 적절한 focus를 찾지 못하면 null로 반환한다.

focus.evidence 역시
오늘 기록 원문에 실제로 존재하는 문장만 사용한다.

────────────────────────────
4. Thought Pattern
────────────────────────────

thoughtPattern은 사용자의 성격이나 심리 유형이 아니다.

오늘 기록 안에서 현재 나타난 생각의 구조만 표현한다.

expectation:

- 사용자가 기대하거나 바라는 변화
- 이루어지기를 원하는 상태
- 더 좋아질 수 있다고 보는 가능성

concern:

- 사용자가 확인하고 싶어 하는 불확실성
- 잘되지 않을 가능성에 대한 우려
- 현재 방식의 한계나 부담

tension:

- 두 방향이 동시에 존재하는 긴장
- 하고 싶음과 해야 함의 차이
- 기대와 우려가 함께 나타나는 상태
- 빠르게 진행하고 싶지만 신중해야 하는 상황
- 서로 다른 가치나 선택지가 충돌하는 지점

규칙:

1. expectation, concern, tension은 원문 복사가 아니라
   기록에서 해석한 의미를 짧게 표현한다.
2. 기록에서 확인되지 않는 내용은 만들지 않는다.
3. 해당 신호가 없으면 null을 반환한다.
4. 사용자를 진단하거나 성격으로 정의하지 않는다.
5. evidence는 반드시 오늘 기록 원문 문장만 사용한다.
6. 단순히 특정 단어가 있다는 이유만으로 판단하지 않는다.
7. 부정 표현과 문맥을 함께 판단한다.

예:

원문:
"걱정 없이 잘 끝냈다."

잘못된 분석:
concern = "작업에 대한 걱정"

올바른 분석:
concern = null

────────────────────────────
5. 출력 형식
────────────────────────────

반드시 아래 구조의 JSON 객체 하나만 반환한다.

{
  "mainThread": {
    "target": "Reflection Loop V3의 하드코딩을 줄이는 작업",
    "reason": "사용자가 현재 질문 생성 구조의 한계를 검토하고 LLM 중심 구조로 변경하려고 하고 있습니다.",
    "evidence": [
      "V3 질문 적용은 하드코딩 부분 개선되면 하는 게 어때?"
    ]
  },
  "focus": {
    "text": "규칙 기반 분석을 어느 범위까지 LLM 분석으로 대체할지에 대한 판단",
    "reason": "현재 구현 방법뿐 아니라 질문 엔진의 방향을 결정하는 지점이기 때문입니다.",
    "evidence": [
      "좋은 질문의 기준이나 사례는 오히려 LLM을 통하는 것이 제일 나은 거 아닌가?"
    ]
  },
  "thoughtPattern": {
    "expectation": "LLM을 사용하면 다양한 기록에서도 더 자연스러운 질문 Context를 만들 수 있을 것이라는 기대",
    "concern": "정규식 기반 하드코딩이 표현이 달라질 때 제대로 작동하지 않을 수 있다는 우려",
    "tension": "V3를 빠르게 적용하고 싶지만 질문 구조를 먼저 안정시켜야 한다는 긴장",
    "evidence": [
      "V3 질문 적용은 하드코딩 부분 개선되면 하는 게 어때?"
    ]
  }
}

mainThread가 없다면 다음처럼 반환한다.

{
  "mainThread": null,
  "focus": null,
  "thoughtPattern": {
    "expectation": null,
    "concern": null,
    "tension": null,
    "evidence": []
  }
}

오늘 기록:

${normalizedRecord}

Reaction Targets:

${JSON.stringify(
  reactionTargets,
  null,
  2
)}

기존 AI 요약:

${aiInsight?.summary ?? "없음"}
`;

    const text =
      await generateAIText(prompt);

    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed: unknown;

    try {
      parsed =
        JSON.parse(cleaned);
    } catch {
      throw new Error(
        `Reflection Context 분석 결과를 JSON으로 해석할 수 없습니다. 응답: ${cleaned.slice(
          0,
          300
        )}`
      );
    }

    return parseAnalysisResult({
      parsed,
      latestRecord:
        normalizedRecord,
    });
  };