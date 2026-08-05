import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { generateAIText } from "@/providers";

import type {
  WeeklyMeaningChange,
  WeeklyPrimarySignal,
  WeeklyReport,
} from "@/types/weeklyReport";

import type {
  WeeklyReportContext,
} from "@/services/weeklyReportService";

const MIN_RECORDED_DAYS = 2;

const extractJson = (
  text: string
): unknown => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");

    if (
      firstBrace === -1 ||
      lastBrace === -1 ||
      firstBrace >= lastBrace
    ) {
      throw new Error(
        "Weekly Report 응답에서 JSON 객체를 찾지 못했습니다."
      );
    }

    return JSON.parse(
      cleaned.slice(
        firstBrace,
        lastBrace + 1
      )
    );
  }
};

const isWeeklyReportContext = (
  value: unknown
): value is WeeklyReportContext => {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Record<
      string,
      unknown
    >;

  return (
    typeof candidate.periodStart ===
      "string" &&
    typeof candidate.periodEnd ===
      "string" &&
    typeof candidate.recordedDays ===
      "number" &&
    Array.isArray(
      candidate.analyses
    ) &&
    typeof candidate.immersionDiscovery ===
      "object" &&
    candidate.immersionDiscovery !==
      null
  );
};

const createPrimarySignal = (
  context: WeeklyReportContext
): WeeklyPrimarySignal | null => {
  const signal =
    context.immersionDiscovery
      .primarySignal;

  if (!signal) {
    return null;
  }

  return {
    target:
      signal.target,

    frequency:
      signal.frequency,

    averageWeight:
      signal.averageWeight,

    latestWeight:
      signal.latestWeight,

    dominantType:
      signal.dominantType,

    growthDirection:
      signal.growthDirection,
  };
};

const parseMeaningChange = (
  value: unknown
): WeeklyMeaningChange | null => {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const candidate =
    value as Record<
      string,
      unknown
    >;

  const addedMeanings =
    Array.isArray(
      candidate.addedMeanings
    )
      ? candidate.addedMeanings
          .filter(
            (
              item
            ): item is string =>
              typeof item ===
                "string" &&
              item.trim().length >
                0
          )
          .slice(0, 2)
      : [];

  return {
    hasChange:
      candidate.hasChange === true,

    summary:
      typeof candidate.summary ===
      "string"
        ? candidate.summary.trim()
        : "",

    addedMeanings,
  };
};

const getString = (
  value: unknown,
  fallback = ""
): string => {
  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value.trim();
  }

  return fallback;
};

type AuthorizationResult =
  | {
      ok: true;
      userId: string;
    }
  | {
      ok: false;
      response: NextResponse;
    };

const authorizePlusUser = async (
  request: Request
): Promise<AuthorizationResult> => {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "로그인이 필요합니다.",

            code:
              "UNAUTHORIZED",
          },
          {
            status: 401,
          }
        ),
    };
  }

  const accessToken =
    authorization
      .slice(
        "Bearer ".length
      )
      .trim();

  if (!accessToken) {
    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "로그인이 필요합니다.",

            code:
              "UNAUTHORIZED",
          },
          {
            status: 401,
          }
        ),
    };
  }

  const supabase =
    createSupabaseServerClient(
      accessToken
    );

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser(
      accessToken
    );

  if (
    userError ||
    !user
  ) {
    console.error(
      "Weekly Report 사용자 인증 실패:",
      userError
    );

    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "로그인 정보가 유효하지 않습니다.",

            code:
              "INVALID_SESSION",
          },
          {
            status: 401,
          }
        ),
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Weekly Report 프로필 조회 실패:",
      profileError
    );

    throw profileError;
  }

  if (!profile) {
    console.error(
      "Weekly Report 프로필 없음:",
      {
        userId: user.id,
      }
    );

    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "사용자 플랜 정보를 찾을 수 없습니다.",

            code:
              "PROFILE_NOT_FOUND",
          },
          {
            status: 403,
          }
        ),
    };
  }

  const normalizedPlan =
    typeof profile.plan ===
    "string"
      ? profile.plan
          .trim()
          .toLowerCase()
      : "";

  console.log(
    "Weekly Report 플랜 확인:",
    {
      userId: user.id,
      plan: normalizedPlan,
    }
  );

  if (
    normalizedPlan !== "plus"
  ) {
    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "Weekly Report는 Molip Plus에서 제공됩니다.",

            code:
              "PLUS_REQUIRED",
          },
          {
            status: 403,
          }
        ),
    };
  }

  return {
    ok: true,
    userId: user.id,
  };
};

export async function POST(
  request: Request
) {
  try {
    const authorization =
      await authorizePlusUser(
        request
      );

    if (!authorization.ok) {
      return authorization.response;
    }

    const body =
      await request.json();

    const context =
      body.context as unknown;

    if (
      !isWeeklyReportContext(
        context
      )
    ) {
      return NextResponse.json(
        {
          error:
            "올바른 Weekly Report Context가 필요합니다.",

          code:
            "INVALID_CONTEXT",
        },
        {
          status: 400,
        }
      );
    }

    const primarySignal =
      createPrimarySignal(
        context
      );

    if (
      context.recordedDays <
        MIN_RECORDED_DAYS ||
      context.analyses.length <
        MIN_RECORDED_DAYS
    ) {
      const notReadyReport:
        WeeklyReport = {
        status:
          "not_ready",

        periodStart:
          context.periodStart,

        periodEnd:
          context.periodEnd,

        recordedDays:
          context.recordedDays,

        summary:
          "이번 주의 흐름을 연결하려면 기록이 조금 더 필요합니다.",

        primarySignal,

        meaningChange:
          null,

        reflection:
          "하루의 기록도 의미가 있지만, 서로 다른 날의 반응이 쌓이면 한 주 동안 이어진 흐름을 더 분명하게 발견할 수 있습니다.",

        nextQuestion:
          "이번 주에 다시 기록해 보고 싶은 순간은 무엇인가요?",
      };

      return NextResponse.json(
        notReadyReport
      );
    }

    const prompt = `
너는 Molip의 Weekly Report Engine이다.

Molip는 사용자를 평가하지 않는다.

이번 주의 성과를 채점하거나,
잘한 점과 부족한 점을 판단하거나,
다음 행동을 지시하지 않는다.

너의 역할은 최근 7일 동안의 기록과 분석에서
반복된 반응, 의미의 변화, 이어진 생각을 발견하고
사용자가 이번 주를 하나의 흐름으로 바라보도록 돕는 것이다.

반드시 유효한 JSON 객체 하나만 반환하라.
마크다운 코드 블록을 사용하지 마라.
JSON 앞뒤에 설명을 추가하지 마라.

────────────────────────────
1. 기본 원칙
────────────────────────────

1. 사용자를 평가하거나 정의하지 않는다.
2. 성취도, 생산성, 성공 여부를 판단하지 않는다.
3. 조언, 계획, 목표, 행동 지시를 만들지 않는다.
4. Context에 없는 사실이나 감정을 추측하지 않는다.
5. 여러 날짜의 기록을 단순히 나열하지 않는다.
6. 이번 주 전체에서 이어진 흐름을 중심으로 작성한다.
7. 지나치게 감성적이거나 시적인 표현을 피한다.
8. 자연스럽고 담백한 한국어 존댓말을 사용한다.
9. 내부 점수, confidence, weight를 문장에 직접 노출하지 않는다.
10. 동일한 내용을 summary와 reflection에서 반복하지 않는다.

────────────────────────────
2. Summary
────────────────────────────

summary는 이번 주 전체 흐름을 한 문장으로 작성한다.

규칙:

1. 45자 이내를 우선한다.
2. 가장 반복된 반응이나 가장 선명한 변화 하나만 중심으로 작성한다.
3. 하나의 문장만 작성한다.
4. 사용자를 단정하거나 평가하지 않는다.
5. 사건을 나열하지 말고 하나의 흐름으로 압축한다.
6. "이번 주에는"으로 시작하지 않아도 된다.
7. Reflection과 같은 내용을 반복하지 않는다.

좋은 방향:

"Molip가 실제 서비스 준비 단계로 이어졌습니다."

또는

"Molip 개발이 실제 사용자와 연결되는 단계로 이어졌습니다."

나쁜 방향:

"이번 주에는 도메인을 사고 광고를 하고 개발도 했습니다."

────────────────────────────
3. Meaning Change
────────────────────────────

meaningChange는 이번 주 기록 안에서
같은 대상이나 활동의 의미가 확장되거나 달라졌는지 표현한다.

의미 변화가 분명하지 않다면:

{
  "hasChange": false,
  "summary": "이번 주에는 뚜렷한 의미 변화보다 비슷한 관심이 이어졌습니다.",
  "addedMeanings": []
}

의미 변화가 있다면:

- 처음에는 활동이나 사건으로 기록됨
- 이후 이유, 가치, 관계, 방향이 추가됨
- 사용자의 표현 안에서 새 의미가 드러남

Context에 없는 의미를 만들어내지 않는다.

addedMeanings는 최대 2개까지만 반환한다.

비슷한 의미는 하나로 합쳐서 작성한다.

────────────────────────────
4. Reflection
────────────────────────────

reflection은 2문장 이상 4문장 이하로 작성한다.

규칙:

1. 이번 주의 사건을 날짜순으로 나열하지 않는다.
2. primarySignal이 있다면 중심 흐름으로 활용한다.
3. 긍정적 반응과 부담이 함께 있었다면 어느 한쪽으로 단정하지 않는다.
4. 사용자가 이번 주를 다시 읽는 느낌이 들게 한다.
5. 마지막 문장은 결론보다 여지를 남긴다.
6. 다음 행동을 제안하지 않는다.
7. 같은 주제를 반복해서 설명하지 않는다.
8. Summary를 길게 다시 풀어쓰지 않는다.

────────────────────────────
5. Next Question
────────────────────────────

nextQuestion은 이번 주를 한 번 더 돌아보게 하는 질문 하나다.

규칙:

1. 다음 주 계획을 요구하지 않는다.
2. 행동 목표를 만들게 하지 않는다.
3. Yes / No 질문을 하지 않는다.
4. 질문은 한 문장만 작성한다.
5. 이번 주 기록에 실제로 등장한 대상이나 흐름에 연결한다.
6. 사용자가 이미 기록한 답을 그대로 다시 묻지 않는다.
7. 지나치게 추상적인 질문을 피한다.
8. 여러 화제를 한꺼번에 묻지 않는다.
9. 질문 끝에는 물음표를 사용한다.

좋은 방향:

"이번 주 Molip가 실제 서비스처럼 느껴졌던 순간은 언제였나요?"

나쁜 방향:

"다음 주에는 Molip를 어떻게 더 발전시키고 싶나요?"

────────────────────────────
6. Primary Signal
────────────────────────────

Primary Signal은 서버가 이미 계산했다.

너는 primarySignal 값을 새로 만들거나 변경하지 않는다.

Primary Signal이 null일 수 있다.

null인 경우에도 기록에서 억지로 몰입 신호를 만들지 않는다.

────────────────────────────
7. 응답 형식
────────────────────────────

반드시 아래 구조로 반환한다.

{
  "summary": "이번 주 전체 흐름 한 문장",
  "meaningChange": {
    "hasChange": true,
    "summary": "이번 주 의미 변화 요약",
    "addedMeanings": [
      "새롭게 추가된 의미"
    ]
  },
  "reflection": "이번 주의 흐름을 연결한 2~4문장",
  "nextQuestion": "이번 주를 돌아보는 질문 하나?"
}

추가 규칙:

- addedMeanings는 최대 2개까지만 반환한다.

주간 기간:

${context.periodStart} ~ ${context.periodEnd}

기록한 날짜 수:

${context.recordedDays}

서버가 계산한 Primary Signal:

${JSON.stringify(
  primarySignal,
  null,
  2
)}

Immersion Discovery 결과:

${JSON.stringify(
  context.immersionDiscovery,
  null,
  2
)}

최근 7일 AI 분석:

${JSON.stringify(
  context.analyses,
  null,
  2
)}
`;

    const text =
      await generateAIText(
        prompt
      );

    console.log(
      "Weekly Report MVP raw response:",
      text
    );

    const parsed =
      extractJson(text);

    if (
      !parsed ||
      typeof parsed !==
        "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        "Weekly Report 응답이 올바른 JSON 객체가 아닙니다."
      );
    }

    const result =
      parsed as Record<
        string,
        unknown
      >;

    const summary =
      getString(
        result.summary,
        "이번 주 기록에서는 여러 반응과 생각이 이어졌습니다."
      );

    const reflection =
      getString(
        result.reflection,
        "이번 주 기록에서는 반복해서 마음에 남은 대상과 그 주변의 생각이 함께 나타났습니다."
      );

    const nextQuestion =
      getString(
        result.nextQuestion,
        "이번 주에 가장 오래 마음에 남은 순간은 무엇이었나요?"
      );

    const report:
      WeeklyReport = {
      status:
        "ready",

      periodStart:
        context.periodStart,

      periodEnd:
        context.periodEnd,

      recordedDays:
        context.recordedDays,

      summary,

      primarySignal,

      meaningChange:
        parseMeaningChange(
          result.meaningChange
        ),

      reflection,

      nextQuestion,
    };

    return NextResponse.json(
      report
    );
  } catch (error) {
    console.error(
      "Weekly Report 생성 오류:",
      error
    );

    const detail =
      error instanceof Error
        ? error.message
        : "알 수 없는 오류";

    const normalizedDetail =
      detail.toLowerCase();

    const isQuotaExceeded =
      detail.includes("429") ||
      detail.includes(
        "RESOURCE_EXHAUSTED"
      ) ||
      normalizedDetail.includes(
        "quota"
      );

    return NextResponse.json(
      {
        error:
          isQuotaExceeded
            ? "AI 사용 한도가 잠시 초과되었습니다."
            : "Weekly Report 생성에 실패했습니다.",

        detail,

        code:
          isQuotaExceeded
            ? "AI_QUOTA_EXCEEDED"
            : "WEEKLY_REPORT_GENERATION_FAILED",
      },
      {
        status:
          isQuotaExceeded
            ? 429
            : 500,
      }
    );
  }
}