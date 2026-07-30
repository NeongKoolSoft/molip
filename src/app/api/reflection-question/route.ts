import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { generateAIText } from "@/providers";

import type {
  ReflectionQuestionResult,
  ReflectionState,
} from "@/types/reflectionLoop";

import type {
  ReflectionQuestionContextV2,
} from "@/types/reflectionContext";

const validStates = new Set<ReflectionState>([
  "observation",
  "description",
  "connection",
  "discovery",
  "integration",
]);

const extractJson = (text: string): unknown => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (
      firstBrace === -1 ||
      lastBrace === -1 ||
      firstBrace >= lastBrace
    ) {
      throw new Error(
        "Reflection Question 응답에서 JSON을 찾지 못했습니다."
      );
    }

    return JSON.parse(
      cleaned.slice(firstBrace, lastBrace + 1)
    );
  }
};

const isReflectionQuestionContextV2 = (
  value: unknown
): value is ReflectionQuestionContextV2 => {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const candidate =
    value as Record<string, unknown>;

  const local = candidate.local;
  const global = candidate.global;

  if (
    !local ||
    typeof local !== "object" ||
    Array.isArray(local)
  ) {
    return false;
  }

  if (
    !global ||
    typeof global !== "object" ||
    Array.isArray(global)
  ) {
    return false;
  }

  const localContext =
    local as Record<string, unknown>;

  const globalContext =
    global as Record<string, unknown>;

  const mainThread =
    localContext.mainThread;

  const isValidMainThread =
    mainThread === null ||
    (
      typeof mainThread === "object" &&
      !Array.isArray(mainThread) &&
      typeof (
        mainThread as Record<string, unknown>
      ).target === "string" &&
      typeof (
        mainThread as Record<string, unknown>
      ).reason === "string" &&
      typeof (
        mainThread as Record<string, unknown>
      ).focus === "string" &&
      typeof (
        mainThread as Record<string, unknown>
      ).focusReason === "string" &&      
      Array.isArray(
        (
          mainThread as Record<string, unknown>
        ).evidence
      ) &&
      (
        (
          mainThread as Record<string, unknown>
        ).evidence as unknown[]
      ).every(
        (item) => typeof item === "string"
      )
    );

  return (
    isValidMainThread &&
    typeof localContext.latestRecord === "string" &&
    (
      localContext.latestFocus === null ||
      typeof localContext.latestFocus === "string"
    ) &&
    Array.isArray(localContext.recentEvidence) &&
    localContext.recentEvidence.every(
      (item) => typeof item === "string"
    ) &&
    typeof localContext.currentState === "string" &&
    validStates.has(
      localContext.currentState as ReflectionState
    ) &&
    typeof localContext.targetState === "string" &&
    validStates.has(
      localContext.targetState as ReflectionState
    ) &&
    (
      globalContext.primaryTarget === null ||
      typeof globalContext.primaryTarget === "string"
    ) &&
    (
      globalContext.immersionTarget === null ||
      typeof globalContext.immersionTarget === "string"
    ) &&
    (
      globalContext.weeklySummary === null ||
      typeof globalContext.weeklySummary === "string"
    )
  );
};

const authorizeUser = async (
  request: Request
): Promise<
  | {
      ok: true;
      userId: string;
    }
  | {
      ok: false;
      response: NextResponse;
    }
> => {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "로그인이 필요합니다.",
          code: "UNAUTHORIZED",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const accessToken = authorization
    .slice("Bearer ".length)
    .trim();

  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "로그인이 필요합니다.",
          code: "UNAUTHORIZED",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const supabase =
    createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "로그인 정보가 유효하지 않습니다.",
          code: "INVALID_SESSION",
        },
        {
          status: 401,
        }
      ),
    };
  }

  return {
    ok: true,
    userId: user.id,
  };
};

const getQuestionIntent = (
  targetState: ReflectionState
): ReflectionQuestionResult["intent"] => {
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

export async function POST(request: Request) {
  try {
    const authorization =
      await authorizeUser(request);

    if (!authorization.ok) {
      return authorization.response;
    }

    const body = await request.json();
    const context = body.context as unknown;

    if (!isReflectionQuestionContextV2(context)) {
      return NextResponse.json(
        {
          error:
            "올바른 Reflection Question Context가 필요합니다.",
        },
        {
          status: 400,
        }
      );
    }

    const { local, global } = context;

    const questionIntent =
      getQuestionIntent(local.targetState);

    const selectedFocus =
      local.mainThread?.focus ??
      local.mainThread?.target ??
      local.latestFocus ??
      global.primaryTarget;

    const prompt = `
너는 Molip의 Question Engine V3.2이다.

Question Engine은 질문을 잘 보이게 만드는 엔진이 아니다.

사용자가 방금 작성한 기록 뒤에
한 문장을 자연스럽게 더 이어 쓰도록 돕는 엔진이다.

오늘 기록의 마지막 문장만 따라가지 않는다.

기록 전체에서 반복되거나,
하루의 행동과 생각을 가장 잘 설명하는
Main Thread를 질문의 중심으로 사용한다.

Main Thread가 있다면 가장 먼저 사용한다.

마지막 문장은 Main Thread를 보완하는 근거일 뿐이다.

마지막 문장이 단순한 완료 보고이거나
Main Thread와 관계가 약하다면
질문의 중심으로 사용하지 않는다.

Local Context만으로 질문 생성을 먼저 시도한다.

Local Context만으로 충분하다면
Global Context는 사용하지 않는다.

Global Context는 질문의 중심 주제를 정하기 위한 정보가 아니다.
Local Context와 모순되는 질문을 피하기 위한 보조 정보일 뿐이다.

Global Context 때문에
질문의 중심 대상, 장면 또는 생각을 변경하지 마라.

반드시 유효한 JSON 객체 하나만 반환하라.
마크다운 코드 블록을 사용하지 마라.
JSON 앞뒤에 설명을 작성하지 마라.

────────────────────────────
1. Local Context
────────────────────────────

가장 최근 기록 전체:

${local.latestRecord}

오늘 기록의 Main Thread:

${local.mainThread?.target ?? "특정되지 않음"}

Main Thread 선택 이유:

${local.mainThread?.reason ?? "없음"}

Main Thread 근거:

Main Thread 안에서 지금 가장 붙잡고 있는 생각:

${local.mainThread?.focus ?? "특정되지 않음"}

Focus 선택 이유:

${local.mainThread?.focusReason ?? "없음"}

${JSON.stringify(
  local.mainThread?.evidence ?? [],
  null,
  2
)}

가장 마지막에 이어진 문장:

${local.latestFocus ?? "특정되지 않음"}

최근 근거 문장:

${JSON.stringify(
  local.recentEvidence,
  null,
  2
)}

현재 Reflection State:

${local.currentState}

질문이 향할 목표 State:

${local.targetState}

질문의 목적:

${questionIntent}

────────────────────────────
2. 질문 중심 선택 순서
────────────────────────────

질문의 중심은 아래 순서로 선택한다.

1. Main Thread의 Focus
2. Main Thread
3. Main Thread와 직접 연결되는 최근 장면이나 생각
4. 최근 근거 문장
5. 마지막 문장

Focus가 있다면 Main Thread의 넓은 주제보다 Focus를 우선한다.

Focus를 그대로 반복해서 묻지 말고,
그 생각이 한 문장 더 이어질 수 있는 빈틈을 질문한다.

────────────────────────────
3. Local Context First
────────────────────────────

1. 최근 기록 전체에서 중심 흐름 하나를 따라 질문한다.
2. Main Thread가 있다면 그 흐름에서 벗어나지 않는다.
3. 하나의 장면, 대상 또는 생각만 중심으로 삼는다.
4. 최근 기록에 없는 과거 주제나 장기 기억을 끌어오지 않는다.
5. 이전 날짜의 기록을 질문의 중심으로 사용하지 않는다.
6. Global Context의 주제가 최근 기록에 없으면 질문에 포함하지 않는다.
7. 사용자가 현재 기록 아래에 바로 답을 이어 쓸 수 있어야 한다.
8. 마지막 문장에만 기계적으로 반응하지 않는다.
9. 기록 전체에서 사용자의 행동을 가장 잘 설명하는 흐름을 우선한다.

────────────────────────────
4. Global Context
────────────────────────────

아래 정보는 보조 정보다.

질문의 중심을 정하는 데 사용하지 않는다.

Primary Target:

${global.primaryTarget ?? "없음"}

Immersion Target:

${global.immersionTarget ?? "없음"}

Weekly Summary:

${global.weeklySummary ?? "없음"}

주의:

Global Context에만 존재하고
Local Context에는 없는 대상은 질문에 사용하지 않는다.

────────────────────────────
5. 핵심 규칙
────────────────────────────

1. 질문은 한 문장만 작성한다.
2. 질문 끝에는 물음표를 사용한다.
3. 하나의 장면, 대상 또는 생각만 묻는다.
4. 사용자가 다음 문장을 자연스럽게 쓰도록 돕는다.
5. 현재 상태보다 지나치게 깊은 질문으로 뛰어넘지 않는다.
6. 기록에 없는 사실, 감정, 관계를 만들지 않는다.
7. AI가 해석을 먼저 단정하지 않는다.
8. 사용자를 평가하거나 성격으로 정의하지 않는다.
9. Yes / No 질문을 하지 않는다.
10. 행동 계획이나 조언을 요구하지 않는다.
11. 두 가지 이상의 생각을 한꺼번에 요구하지 않는다.
12. 지나치게 추상적인 심리 용어를 사용하지 않는다.
13. 질문을 위한 설명이나 칭찬을 붙이지 않는다.
14. 최근 기록보다 오래된 내용을 질문의 중심으로 사용하지 않는다.
15. 장기 목표, 경제 문제, 과거 계획을 임의로 연결하지 않는다.
16. 질문은 오늘 기록의 Main Thread에서 벗어나지 않는다.
17. 질문은 인터뷰나 설문 문항처럼 딱딱하게 들리지 않아야 한다.
18. 사용자가 실제 대화에서 들을 법한 자연스러운 한국어 존댓말을 사용한다.
19. "반영", "영향", "기대치", "측정", "생활 방식", "삶의 흐름", "의미를 갖다" 같은 추상 표현은 기록에 직접 등장하지 않았다면 사용하지 않는다.
20. 기록에 나온 구체적인 행동, 순간, 느낌을 그대로 활용한다.
21. "어떻게 반영되고 있나요?", "어떤 영향을 주었나요?", "어떤 의미인가요?"처럼 보고서나 인터뷰에 가까운 표현을 피한다.
22. 한 번 읽고 바로 답을 이어 쓸 수 있는 짧고 쉬운 문장을 우선한다.
23. 질문의 깊이보다 기록을 이어 쓰기 쉬운 자연스러움을 우선한다.
24. Main Thread가 넓은 주제라면 Focus에 담긴 현재의 고민이나 기대를 우선한다.
25. Focus에 이미 적힌 결론을 그대로 다시 확인하지 않는다.
26. 개발 계획이나 해결 방법보다 사용자가 지금 붙잡고 있는 생각을 한 단계 더 표현하게 한다.

────────────────────────────
6. 상태별 질문 방향
────────────────────────────

observation → description:

사건이나 행동에서
구체적인 장면, 반응 또는 느낌 하나를 표현하게 한다.

description → connection:

최근 기록 안에서 이미 함께 나타난
경험이나 반응 사이의 관계 하나를 바라보게 한다.

connection → discovery:

최근 기록에서 연결된 경험이
사용자에게 어떤 기준이나 의미를 드러내는지 생각하게 한다.

discovery → integration:

이미 최근 기록에서 발견된 의미가
선택이나 삶의 흐름과 어떻게 이어지는지 바라보게 한다.

integration → integration:

더 깊게 밀어붙이지 않는다.
최근 기록에서 아직 충분히 표현되지 않은 한 부분만 구체화한다.

────────────────────────────
7. 후보 생성과 선택
────────────────────────────

서로 다른 방향의 후보 질문 3개를 내부적으로 만든다.

각 후보를 다음 기준으로 내부 평가한다.

- Main Thread에 연결되는가?
- 오늘 기록에 실제 근거가 있는가?
- 하나의 생각만 묻는가?
- 사용자가 바로 다음 문장을 쓰기 쉬운가?
- 마지막 완료 문장에만 끌려가지 않았는가?
- 기록에 없는 주제를 만들지 않았는가?
- 사람이 실제로 이렇게 물을 법한가?
- 문장이 딱딱하거나 보고서처럼 들리지 않는가?
- 기록에 나온 표현을 자연스럽게 사용했는가?
- 사용자가 바로 한두 문장을 이어 쓰기 쉬운가?

가장 이어 쓰기 쉬운 질문 하나만 선택한다.

후보와 평가 과정은 출력하지 않는다.

────────────────────────────
8. 질문 언어 예시
────────────────────────────

좋은 질문:

- "오늘 평소보다 일찍 시작하고 싶었던 마음은 어디에서 가장 선명하게 느껴졌나요?"
- "운동을 빨리 마친 뒤 작업을 시작했을 때 가장 달라진 점은 무엇이었나요?"
- "오늘 작업을 서두르게 만든 기대는 어떤 것이었나요?"
- "Reflection Loop 작업에서 특히 마음에 남은 순간은 언제였나요?"

나쁜 질문:

- "운동 경험이 개발 작업의 몰입감에 어떻게 반영되고 있나요?"
- "이번 경험이 삶의 흐름에 어떤 영향을 주었나요?"
- "기대치를 어떤 기준으로 측정하고 싶으신가요?"
- "이 활동은 사용자에게 어떤 의미를 갖습니까?"

────────────────────────────
9. 폐기 규칙
────────────────────────────

다음 질문은 폐기하고 다시 만든다.

- Main Thread가 있는데 마지막 완료 사실만 묻는 질문
- 최근 기록에 없는 대상을 포함한 질문
- Global Context에만 존재하는 주제를 포함한 질문
- 두 개 이상의 화제를 묻는 질문
- "왜 그렇게 느꼈나요?"
- "오늘 기분은 어땠나요?"
- "앞으로 무엇을 할 계획인가요?"
- "당신은 이런 사람인가요?"
- "어떤 영향을 주었나요?"
- "기대치를 어떻게 측정하고 싶나요?"
- 사용자가 이미 쓴 결론을 다시 확인하는 질문
- 현재 기록 뒤에 자연스럽게 답을 이어 쓰기 어려운 질문
- "어떻게 반영되고 있나요?"
- "어떤 영향을 주었나요?"
- "어떤 의미를 갖나요?"
- "어떤 기준으로 측정하고 싶나요?"
- 질문이 보고서, 상담지, 설문 문항처럼 들리는 경우

────────────────────────────
10. 응답 형식
────────────────────────────

{
  "question": "현재 기록 뒤에 한 문장을 이어 쓰게 하는 질문 하나?",
  "intent": "${questionIntent}",
  "primaryTarget": ${
    selectedFocus
      ? JSON.stringify(selectedFocus)
      : "null"
  },
  "targetState": "${local.targetState}"
}
`;

    const text = await generateAIText(prompt);
    const parsed = extractJson(text);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        "Reflection Question 응답이 JSON 객체가 아닙니다."
      );
    }

    const result =
      parsed as Record<string, unknown>;

    if (
      typeof result.question !== "string" ||
      !result.question.trim()
    ) {
      throw new Error(
        "Reflection Question 문장이 비어 있습니다."
      );
    }

    let question = result.question.trim();

    if (!question.endsWith("?")) {
      question = `${question}?`;
    }

    const response: ReflectionQuestionResult = {
      question,
      intent: questionIntent,
      primaryTarget: selectedFocus,
      targetState: local.targetState,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Reflection Question 생성 오류:",
      error
    );

    const detail =
      error instanceof Error
        ? error.message
        : "알 수 없는 오류";

    const isQuotaExceeded =
      detail.includes("429") ||
      detail.includes("RESOURCE_EXHAUSTED") ||
      detail.toLowerCase().includes("quota");

    return NextResponse.json(
      {
        error: isQuotaExceeded
          ? "AI 사용 한도가 잠시 초과되었습니다."
          : "Reflection Question 생성에 실패했습니다.",
        detail,
        code: isQuotaExceeded
          ? "AI_QUOTA_EXCEEDED"
          : "REFLECTION_QUESTION_GENERATION_FAILED",
      },
      {
        status: isQuotaExceeded ? 429 : 500,
      }
    );
  }
}