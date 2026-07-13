import { NextResponse } from "next/server";

import { generateGeminiText } from "@/providers/geminiProvider";

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
      context.mainReaction ||
      context.growth ||
      context.meaningGrowth ||
      context.immersionEvidence;

    if (!hasEvidence) {
      const result: TodaysReflection = {
        reflection:
          "최근 기록에서는 아직 하나의 흐름으로 연결할 만한 변화가 충분히 쌓이지 않았습니다. 오늘 오래 마음에 남은 것을 편하게 기록하며 조금 더 지켜보세요.",
      };

      return NextResponse.json(result);
    }

    const prompt = `
너는 Molip의 Reflection Writer이다.

Molip는 사용자를 평가하거나 정의하지 않는다.
아래 Structured Context에 포함된 증거만 연결하여,
최근 기록에서 나타난 흐름을 자연스러운 한국어로 작성하라.

새로운 사실이나 원인을 추측하지 마라.
Context에 없는 의미를 추가하지 마라.

반드시 유효한 JSON 객체 하나만 반환하라.
마크다운 코드블록은 사용하지 마라.
JSON 밖에 설명을 작성하지 마라.

작성 규칙:
1. 반드시 "최근 기록에서는"으로 시작한다.
2. 3문장 이상 5문장 이하로 작성한다.
3. 점수와 백분율을 직접 언급하지 않는다.
4. 수정 횟수나 글자 수를 통계처럼 나열하지 않는다.
5. mainReaction이 있다면 가장 오래 마음에 남은 주제로 연결한다.
6. growth가 있다면 기록을 다시 돌아본 흔적으로 표현한다.
7. meaningGrowth가 true라면 새롭게 드러난 이유, 가치 또는 삶의 방향을 연결한다.
8. immersionEvidence가 있다면 반복성과 변화 방향을 조심스럽게 표현한다.
9. burden, concern, avoidance가 중심이라면 몰입으로 해석하지 않는다.
10. "당신은 이런 사람입니다"와 같은 정체성 단정을 하지 않는다.
11. 행동을 지시하거나 조언하지 않는다.
12. 마지막 문장은 사용자가 스스로 돌아볼 여지를 남긴다.
13. 따뜻하지만 과장되지 않은 어조를 사용한다.

사용 가능한 표현:
- 반복해서 마음에 남고 있습니다.
- 조금씩 구체화되고 있습니다.
- 이런 의미가 새롭게 드러났습니다.
- 계속 이어지는 신호로 보입니다.
- 스스로 돌아볼 만한 흐름입니다.

피해야 할 표현:
- 당신은 반드시
- 당신은 원래
- 확실히 몰입하고 있습니다
- 계속해야 합니다
- 성공할 것입니다
- 당신의 적성입니다

응답 형식:
{
  "reflection": "최근 기록에서는 ..."
}

Structured Context:
${JSON.stringify(context, null, 2)}
`;

    const text = await generateGeminiText(prompt);

    console.log(
      "Today's Reflection raw response:",
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

    const reflection: TodaysReflection = {
      reflection: result.reflection.trim(),
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

    return NextResponse.json(
      {
        error: "Today's Reflection 생성 실패",
        detail,
      },
      { status: 500 }
    );
  }
}