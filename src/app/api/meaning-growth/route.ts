import { NextResponse } from "next/server";

import { generateGeminiText } from "@/providers/geminiProvider";
import type {
  MeaningGrowth,
  MeaningStage,
} from "@/types/meaningGrowth";

const validStages: MeaningStage[] = [
  "action",
  "reason",
  "value",
  "life_direction",
  "unknown",
];

const normalizeStage = (value: unknown): MeaningStage => {
  if (
    typeof value === "string" &&
    validStages.includes(value as MeaningStage)
  ) {
    return value as MeaningStage;
  }

  return "unknown";
};

const extractJson = (text: string) => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Gemini가 JSON 앞뒤에 설명을 붙인 경우 객체 부분만 추출
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error("Gemini 응답에서 JSON 객체를 찾지 못했습니다.");
    }

    const jsonText = cleaned.slice(firstBrace, lastBrace + 1);

    return JSON.parse(jsonText);
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const initialContent =
      typeof body.initialContent === "string"
        ? body.initialContent.trim()
        : "";

    const latestContent =
      typeof body.latestContent === "string"
        ? body.latestContent.trim()
        : "";

    if (!initialContent || !latestContent) {
      return NextResponse.json(
        { error: "비교할 기록이 필요합니다." },
        { status: 400 }
      );
    }

    if (initialContent === latestContent) {
      const result: MeaningGrowth = {
        hasMeaningGrowth: false,
        fromStage: "unknown",
        toStage: "unknown",
        addedMeanings: [],
        evidence: [],
        summary: "최초 기록과 최신 기록의 내용이 같습니다.",
        confidence: 1,
      };

      return NextResponse.json(result);
    }

    const prompt = `
너는 Molip의 Meaning Growth Engine V1이다.

최초 기록과 최신 기록을 비교하여
수정 과정에서 새롭게 드러난 의미를 구조화하라.

사용자를 평가하거나 정의하지 마라.
글이 길어진 것만으로 의미가 성장했다고 판단하지 마라.
최초 기록에는 없고 최신 기록에 실제로 추가된 의미만 추출하라.

반드시 유효한 JSON 객체 하나만 반환하라.
마크다운 코드 블록과 JSON 외 설명은 절대 작성하지 마라.

Meaning Stage:
- action: 무엇을 했는지 중심
- reason: 왜 했는지 이유가 드러남
- value: 그것이 왜 중요한지 가치가 드러남
- life_direction: 삶의 방향이나 장기적 맥락과 연결됨
- unknown: 판단하기 어려움

규칙:
1. from_stage와 to_stage는 위의 값 중 하나만 사용한다.
2. added_meanings는 최대 5개다.
3. evidence는 최신 기록의 문장을 그대로 짧게 사용한다.
4. 의미가 새로 추가되지 않았다면 has_meaning_growth는 false다.
5. confidence는 0.0부터 1.0 사이 숫자다.
6. summary는 단정하지 말고 "수정된 기록에서는..." 관점으로 작성한다.

응답 형식:
{
  "has_meaning_growth": true,
  "from_stage": "action",
  "to_stage": "value",
  "added_meanings": [
    "자신이 만족하는 시스템을 만들고 싶다는 이유",
    "다른 사람에게 도움을 주고 싶다는 가치"
  ],
  "evidence": [
    "먼저 나를 위한, 내가 만족하는 버전으로 개발해 나갈 것이다."
  ],
  "summary": "수정된 기록에서는 개발 행동에 자신의 만족과 타인에게 주는 도움이라는 의미가 추가되었습니다.",
  "confidence": 0.9
}

최초 기록:
"""
${initialContent}
"""

최신 기록:
"""
${latestContent}
"""
`;

    const text = await generateGeminiText(prompt);

    console.log("Meaning Growth raw response:", text);

    const parsed = extractJson(text);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Meaning Growth 응답이 JSON 객체가 아닙니다.");
    }

    const result = parsed as Record<string, unknown>;

    const confidence =
      typeof result.confidence === "number"
        ? Math.min(1, Math.max(0, result.confidence))
        : 0;

    const meaningGrowth: MeaningGrowth = {
      hasMeaningGrowth:
        typeof result.has_meaning_growth === "boolean"
          ? result.has_meaning_growth
          : false,

      fromStage: normalizeStage(result.from_stage),
      toStage: normalizeStage(result.to_stage),

      addedMeanings: Array.isArray(result.added_meanings)
        ? result.added_meanings
            .filter((item): item is string => typeof item === "string")
            .slice(0, 5)
        : [],

      evidence: Array.isArray(result.evidence)
        ? result.evidence
            .filter((item): item is string => typeof item === "string")
            .slice(0, 5)
        : [],

      summary:
        typeof result.summary === "string"
          ? result.summary
          : "기록 사이에서 뚜렷한 의미 변화를 확인하기 어렵습니다.",

      confidence,
    };

    return NextResponse.json(meaningGrowth);
  } catch (error) {
    console.error("Meaning Growth 분석 오류:", error);

    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";

    return NextResponse.json(
      {
        error: "Meaning Growth 분석 실패",
        detail: errorMessage,
      },
      { status: 500 }
    );
  }
}