import { NextResponse } from "next/server";

import { generateAIText } from "@/providers";

import type {
  TodaysReflection,
  TodaysReflectionContext,
} from "@/types/todaysReflection";

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
        "Today's Reflection 응답에서 JSON을 찾지 못했습니다."
      );
    }

    return JSON.parse(
      cleaned.slice(firstBrace, lastBrace + 1)
    );
  }
};

const toneInstructions = {
  calm: `
차분하고 담백하게 작성한다.
변화를 과장하지 않고 관찰된 흐름만 연결한다.
`,
  hopeful: `
따뜻하고 희망적인 어조를 사용한다.
다만 성공이나 지속을 단정하지 않는다.
`,
  careful: `
조심스럽고 신중한 어조를 사용한다.
부담이나 걱정을 몰입이나 성장으로 해석하지 않는다.
`,
  energetic: `
생동감은 살리되 과장하지 않는다.
활력과 자발성이 기록에 있을 때만 표현한다.
`,
};

const flowInstructions = {
  main_theme: `
첫 문장에서는 primaryTheme을 중심 주제로 소개한다.
supportingThemes보다 먼저 다룬다.
`,
  growth: `
기록을 다시 쓰거나 구체화한 흔적을 연결한다.
수정 횟수, 글자 수, 문장 수를 직접 나열하지 않는다.
`,
  meaning: `
새롭게 드러난 이유, 가치, 삶의 방향을 연결한다.
evidence.meaning에 없는 의미는 추가하지 않는다.
`,
  supporting: `
supportingThemes는 중심 주제를 보완하는 범위에서만 언급한다.
각 주제를 독립적인 중심 이야기처럼 확장하지 않는다.
`,
  closing: `
마지막 문장은 단정이나 조언 없이,
사용자가 이 흐름을 스스로 돌아볼 여지를 남긴다.
`,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const context = body.context as
      | TodaysReflectionContext
      | undefined;

    if (!context || typeof context !== "object") {
      return NextResponse.json(
        { error: "Reflection Context가 필요합니다." },
        { status: 400 }
      );
    }

    const hasEvidence =
      context.primaryTheme ||
      context.supportingThemes.length > 0 ||
      context.evidence.reaction ||
      context.evidence.growth ||
      context.evidence.meaning ||
      context.evidence.immersion;

    if (!hasEvidence) {
      const result: TodaysReflection = {
        reflection:
          "최근 기록에서는 아직 하나의 흐름으로 연결할 만한 변화가 충분히 쌓이지 않았습니다. 오늘 오래 마음에 남은 것을 편하게 기록하며 조금 더 지켜볼 수 있습니다.",
      };

      return NextResponse.json(result);
    }

    const orderedFlow = context.storyFlow
      .map((step, index) => {
        return `${index + 1}. ${step}
${flowInstructions[step]}`;
      })
      .join("\n");

    const prompt = `
너는 Molip의 Reflection Writer이다.

Molip Composer가 이미
이야기의 중심 주제, 보조 주제, 어조, 이야기 순서를 결정했다.

너의 역할은 새로운 해석을 만드는 것이 아니라,
주어진 Structured Context 안의 증거를
사람이 읽기 좋은 한 단락으로 연결하는 것이다.

사용자를 평가하거나 정의하지 마라.
Context에 없는 사실, 원인, 감정, 관계를 추측하지 마라.

반드시 유효한 JSON 객체 하나만 반환하라.
마크다운 코드블록은 사용하지 마라.
JSON 밖에 설명을 작성하지 마라.

핵심 규칙:

1. 반드시 "최근 기록에서는"으로 시작한다.
2. primaryTheme을 글의 중심으로 유지한다.
3. supportingThemes는 중심 주제를 보완하는 범위에서만 사용한다.
4. storyFlow에 적힌 순서를 그대로 따른다.
5. 3문장 이상 5문장 이하로 작성한다.
6. 점수, 백분율, 가중치, 내부 중요도는 직접 언급하지 않는다.
7. 수정 횟수, 글자 수, 문장 수를 통계처럼 나열하지 않는다.
8. evidence에 없는 의미를 추가하지 않는다.
9. burden, concern, avoidance가 중심이면 몰입이나 성장으로 해석하지 않는다.
10. "당신은 이런 사람입니다" 같은 정체성 단정을 하지 않는다.
11. 행동을 지시하거나 조언하지 않는다.
12. 마지막 문장은 생각을 이어갈 여지를 남긴다.
13. 같은 주제를 반복해서 여러 번 언급하지 않는다.
14. supportingThemes를 각각 별도의 문단 주제로 확장하지 않는다.
15. 한 문단 안에서 자연스럽게 이어지도록 작성한다.

Tone:

${toneInstructions[context.tone]}

Story Flow:

${orderedFlow}

Primary Theme:

${JSON.stringify(context.primaryTheme, null, 2)}

Supporting Themes:

${JSON.stringify(context.supportingThemes, null, 2)}

Evidence:

${JSON.stringify(context.evidence, null, 2)}

응답 형식:

{
  "reflection": "최근 기록에서는 ..."
}
`;

    const text = await generateAIText(prompt);

    console.log(
      "Today's Reflection V2 raw response:",
      text
    );

    const parsed = extractJson(text);

    if (!parsed || typeof parsed !== "object") {
      throw new Error(
        "Today's Reflection 응답이 JSON 객체가 아닙니다."
      );
    }

    const result = parsed as Record<string, unknown>;

    if (
      typeof result.reflection !== "string" ||
      !result.reflection.trim()
    ) {
      throw new Error(
        "Today's Reflection 문장이 비어 있습니다."
      );
    }

    const reflectionText = result.reflection.trim();

    if (!reflectionText.startsWith("최근 기록에서는")) {
      throw new Error(
        "Today's Reflection 시작 문장이 규칙과 맞지 않습니다."
      );
    }

    const reflection: TodaysReflection = {
      reflection: reflectionText,
    };

    return NextResponse.json(reflection);
  } catch (error) {
    console.error(
      "Today's Reflection 생성 오류:",
      error
    );

    const detail =
      error instanceof Error
        ? error.message
        : "알 수 없는 오류";

    const isQuotaExceeded =
      detail.includes("429") ||
      detail.includes("RESOURCE_EXHAUSTED") ||
      detail.includes("quota");        

    return NextResponse.json(
      {
        error: isQuotaExceeded
          ? "AI 사용 한도가 잠시 초과되었습니다."
          : "Today's Reflection 생성 실패",
        detail,
        code: isQuotaExceeded
          ? "AI_QUOTA_EXCEEDED"
          : "REFLECTION_GENERATION_FAILED",
      },
      {
        status: isQuotaExceeded ? 429 : 500,
      }
    );      

  }
}