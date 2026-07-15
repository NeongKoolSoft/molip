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
  reflection_question: string;
};

export async function analyzeLogs(logs: DailyLog[]): Promise<AIInsight> {
  const prompt = `
너는 Molip의 Reaction Engine V1이다.

Molip는 사용자가 무엇에 반복적으로 반응하는지 발견하고,
그 반응을 통해 자기 자신을 이해하도록 돕는 서비스다.

사용자를 평가하거나 정의하지 말고,
기록에서 나타나는 "반응 대상"과 "반응 방식"을 구조화하라.

반드시 JSON만 반환하라.
마크다운 코드블록은 사용하지 마라.
JSON 밖에 설명을 쓰지 마라.

Reaction Type은 반드시 아래 중 하나만 사용하라:
interest, desire, avoidance, burden, joy, regret, immersion, concern, energy

규칙:
1. reaction_targets는 최대 5개까지 추출한다.
2. target은 사용자가 실제로 언급한 표현에 가깝게 작성한다.
3. normalized_target은 의미가 같은 표현을 대표하는 상위 개념으로 정규화한다.
4. weight는 0.0부터 1.0 사이 숫자다.
5. evidence는 사용자 기록에서 근거가 되는 짧은 문장이다.
6. overall_energy는 반드시 "높음", "보통", "낮음" 중 하나다.
7. immersion_score는 전체 기록에서 나타나는 몰입 신호의 강도다.
8. confidence는 분석 결과에 대한 신뢰도다.
9. 사용자를 단정하지 말고 "최근 기록에서는..."의 관점으로 작성한다.
10. 날짜가 달라도 의미가 같은 주제는 가능한 한 동일한 normalized_target을 사용한다.

정규화 예시:
- "Molip 저장 기능", "Molip 개발", "프로젝트 개발", "개인 프로젝트 진행"
  → "Molip 개발"
- "카드값", "지출 관리", "돈 걱정", "아껴 써야 한다"
  → "경제적 부담"
- "운동", "헬스", "걷기", "찜질"
  → 문맥에 따라 의미를 판단하여 일관된 상위 개념으로 정규화한다.

reflection_question 규칙:
1. 사용자가 자신의 반응을 스스로 돌아볼 수 있는 질문 하나를 만든다.
2. 답을 유도하지 않는다.
3. 사용자를 판단하거나 진단하지 않는다.
4. 조언하거나 행동을 지시하지 않는다.
5. 최근 기록에서 발견된 반응 대상, 변화 또는 근거와 연결한다.
6. 단순히 두 대상을 비교하라고 묻기보다,
   그 반응이 나타난 이유·상황·느낌을 돌아보도록 돕는다.
7. 한 문장 또는 두 문장 이내의 자연스러운 한국어 질문으로 작성한다.

좋은 질문 예시:
- 최근 운동이 계속 마음에 남았던 이유는 무엇이었을까요?
- Molip 개발에 집중했던 순간에는 평소와 무엇이 달랐나요?
- 지출 관리가 신경 쓰일 때 실제 부담과 미래에 대한 걱정 중 어느 쪽이 더 크게 느껴졌나요?

피해야 할 질문:
- 운동을 더 열심히 해야 하지 않을까요?
- 앞으로 지출을 줄이세요.
- 당신은 개발에 몰입하는 사람인가요?

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
  "reflection_question": "최근 경제적 부담이 마음에 남을 때, 실제 지출과 미래에 대한 걱정 중 무엇이 더 크게 느껴졌나요?"
}

사용자 기록:
${JSON.stringify(logs, null, 2)}
`;

  const text = await generateGeminiText(prompt);

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsed: unknown = JSON.parse(cleaned);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI 분석 결과가 올바른 JSON 객체가 아닙니다.");
  }

  const result = parsed as Record<string, unknown>;

  const reactionTargets = Array.isArray(result.reaction_targets)
    ? result.reaction_targets.filter(
        (item): item is ReactionTarget =>
          Boolean(
            item &&
              typeof item === "object" &&
              typeof (item as ReactionTarget).target === "string" &&
              typeof (item as ReactionTarget).normalized_target === "string" &&
              typeof (item as ReactionTarget).type === "string" &&
              typeof (item as ReactionTarget).weight === "number" &&
              typeof (item as ReactionTarget).evidence === "string"
          )
      )
    : [];

  const energy =
    result.overall_energy === "높음" ||
    result.overall_energy === "보통" ||
    result.overall_energy === "낮음"
      ? result.overall_energy
      : "보통";

  const reflectionQuestion =
    typeof result.reflection_question === "string"
      ? result.reflection_question
      : typeof result.question === "string"
        ? result.question
        : "최근 가장 오래 마음에 남은 반응은 무엇이었고, 왜 그랬을까요?";

  return {
    reaction_targets: reactionTargets,
    overall_emotion:
      typeof result.overall_emotion === "string"
        ? result.overall_emotion
        : "알 수 없음",
    overall_energy: energy,
    immersion_score:
      typeof result.immersion_score === "number"
        ? Math.min(1, Math.max(0, result.immersion_score))
        : 0,
    confidence:
      typeof result.confidence === "number"
        ? Math.min(1, Math.max(0, result.confidence))
        : 0,
    summary:
      typeof result.summary === "string"
        ? result.summary
        : "분석 결과를 요약할 수 없습니다.",
    reflection_question: reflectionQuestion,
  };
}