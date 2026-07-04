import type { DailyLog } from "@/types/dailyLog";
import { generateGeminiText } from "@/providers/geminiProvider";

export type ReactionTarget = {
  target: string;
  normalized_target: string;
  type:
    | "interest"
    | "desire"
    | "avoidance"
    | "burden"
    | "joy"
    | "regret"
    | "immersion"
    | "concern"
    | "energy";
  weight: number;
  evidence: string;
};

export type AIInsight = {
  reaction_targets: ReactionTarget[];
  overall_emotion: string;
  overall_energy: "높음" | "보통" | "낮음";
  immersion_score: number;
  confidence: number;
  summary: string;
  question: string;
};

export async function analyzeLogs(logs: DailyLog[]): Promise<AIInsight> {
  const prompt = `
너는 Molip의 Reaction Engine V1이다.

Molip는 사용자가 무엇에 반복적으로 반응하는지 발견하도록 돕는 서비스다.
감정 평가가 아니라 "반응 대상"과 "반응 방식"을 구조화하라.

반드시 JSON만 반환하라.
마크다운 코드블록은 사용하지 마라.
JSON 밖에 설명을 쓰지 마라.

Reaction Type은 반드시 아래 중 하나만 사용하라:
interest, desire, avoidance, burden, joy, regret, immersion, concern, energy

규칙:
1. reaction_targets는 최대 5개까지 추출한다.
2. target은 사용자가 실제로 언급한 표현에 가깝게 작성한다.
3. normalized_target은 더 상위 개념으로 정규화한다.
   예: 카드값 → 경제적 부담
4. weight는 0.0부터 1.0 사이 숫자다.
5. evidence는 사용자 기록에서 근거가 되는 짧은 문장이다.
6. overall_energy는 반드시 "높음", "보통", "낮음" 중 하나다.
7. immersion_score는 전체 기록 기준 몰입 신호의 강도다.
8. confidence는 분석 신뢰도다.
9. 사용자를 단정하지 말고 "최근 기록에서는..." 관점으로 작성하라.
10. normalized_target은 날짜가 달라도 같은 주제라면 반드시 같은 이름을 사용하라.
예:
- "Molip 저장 기능", "Molip 개발", "프로젝트 개발", "개인 프로젝트 진행"은 모두 "Molip 개발"로 정규화한다.
- "카드값", "지출관리", "돈 걱정", "아껴 써야 한다"는 모두 "경제적 부담"으로 정규화한다.
- "운동", "헬스", "걷기", "찜질"은 모두 "운동"으로 정규화한다.

새로운 표현이 있어도, 가능한 한 기존 normalized_target과 의미가 같은지 먼저 판단하라.

응답 형식:
{
  "reaction_targets": [
    {
      "target": "카드값",
      "normalized_target": "경제적 부담",
      "type": "burden",
      "weight": 0.68,
      "evidence": "카드값이 신경 쓰인다"
    }
  ],
  "overall_emotion": "아쉬움",
  "overall_energy": "보통",
  "immersion_score": 0.72,
  "confidence": 0.88,
  "summary": "최근 기록에서는 운동과 Molip 개발, 경제적 부담이 반복적으로 마음에 남는 신호로 보입니다.",
  "question": "최근 가장 자주 떠오른 것은 운동, 개발, 경제적 부담 중 무엇인가요?"
}

사용자 기록:
${JSON.stringify(logs, null, 2)}
`;

  const text = await generateGeminiText(prompt);

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    reaction_targets: Array.isArray(parsed.reaction_targets)
      ? parsed.reaction_targets.filter(
          (item: any) =>
            item &&
            typeof item.target === "string" &&
            typeof item.normalized_target === "string" &&
            typeof item.type === "string" &&
            typeof item.weight === "number" &&
            typeof item.evidence === "string"
        )
      : [],
    overall_emotion: parsed.overall_emotion ?? "알 수 없음",
    overall_energy: parsed.overall_energy ?? "보통",
    immersion_score:
      typeof parsed.immersion_score === "number"
        ? parsed.immersion_score
        : 0,
    confidence:
      typeof parsed.confidence === "number"
        ? parsed.confidence
        : 0,
    summary: parsed.summary ?? "분석 결과를 요약할 수 없습니다.",
    question: parsed.question ?? "최근 가장 오래 마음에 남은 것은 무엇인가요?",
  };
}