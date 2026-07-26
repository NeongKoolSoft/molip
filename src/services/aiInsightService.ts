import type { DailyLog } from "@/types/dailyLog";
import { generateAIText } from "@/providers";

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

export type ReflectionIntent =
  | "observation"
  | "meaning"
  | "pattern"
  | "possibility";

export type AIInsight = {
  reaction_targets: ReactionTarget[];
  overall_emotion: string;
  overall_energy: "높음" | "보통" | "낮음";
  immersion_score: number;
  confidence: number;
  summary: string;
  reflection_question: string;

  // Question Engine V2 내부 검증용
  // 기존 저장 데이터와의 호환성을 위해 optional로 둔다.
  reflection_gap?: string;
  reflection_intent?: ReflectionIntent;
};

const VALID_REACTION_TYPES = new Set<ReactionTarget["type"]>([
  "interest",
  "desire",
  "avoidance",
  "burden",
  "joy",
  "regret",
  "immersion",
  "concern",
  "energy",
]);

const VALID_REFLECTION_INTENTS = new Set<ReflectionIntent>([
  "observation",
  "meaning",
  "pattern",
  "possibility",
]);

function clamp01(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function isReactionTarget(item: unknown): item is ReactionTarget {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.target === "string" &&
    typeof candidate.normalized_target === "string" &&
    typeof candidate.type === "string" &&
    VALID_REACTION_TYPES.has(candidate.type as ReactionTarget["type"]) &&
    typeof candidate.weight === "number" &&
    typeof candidate.evidence === "string"
  );
}

function isReflectionIntent(value: unknown): value is ReflectionIntent {
  return (
    typeof value === "string" &&
    VALID_REFLECTION_INTENTS.has(value as ReflectionIntent)
  );
}

export async function analyzeLogs(logs: DailyLog[]): Promise<AIInsight> {
  const prompt = `
너는 Molip의 Reaction Engine V1과 Question Engine V2를 함께 수행한다.

Molip는 사용자가 무엇에 반복적으로 반응하는지 발견하고,
그 반응을 통해 자기 자신을 이해하도록 돕는 서비스다.

사용자를 평가하거나 정의하지 않는다.
기록에 나타나는 반응을 구조화하고,
사용자가 아직 충분히 말하지 않은 Reflection Gap을 발견해
생각이 이어지는 Discovery Question 하나를 만든다.

반드시 올바른 JSON 객체 하나만 반환하라.
마크다운 코드 블록을 사용하지 마라.
JSON 앞뒤에 설명을 쓰지 마라.

────────────────────────────
1. Reaction Engine
────────────────────────────

Reaction Type은 반드시 아래 중 하나만 사용한다.

interest, desire, avoidance, burden, joy, regret,
immersion, concern, energy

Reaction 규칙:

1. reaction_targets는 최대 5개까지 추출한다.
2. target은 사용자가 실제로 언급한 표현에 가깝게 작성한다.
3. normalized_target은 의미가 같은 표현을 대표하는 상위 개념이다.
4. weight는 0.0부터 1.0 사이 숫자다.
5. evidence는 사용자 기록에서 가져온 짧은 근거 문장이다.
6. overall_energy는 반드시 "높음", "보통", "낮음" 중 하나다.
7. immersion_score는 전체 기록에서 나타난 몰입 신호의 강도다.
8. confidence는 전체 분석 결과에 대한 신뢰도다.
9. 사용자를 단정하지 말고 최근 기록에서 관찰되는 신호만 표현한다.
10. 날짜가 달라도 의미가 같은 주제는 가능한 한 동일한
    normalized_target을 사용한다.

정규화 예시:

- "Molip 저장 기능", "Molip 개발", "프로젝트 개발",
  "개인 프로젝트 진행"
  → "Molip 개발"

- "카드값", "지출 관리", "돈 걱정", "아껴 써야 한다"
  → "경제적 부담"

- "운동", "헬스", "걷기", "찜질"
  → 문맥을 판단하여 일관된 상위 개념으로 정규화한다.

summary 규칙:

1. 최근 기록에서 반복되거나 강하게 나타난 신호를 짧게 요약한다.
2. 사용자를 성격이나 유형으로 정의하지 않는다.
3. 진단, 평가, 교훈, 행동 지시를 하지 않는다.

────────────────────────────
2. Question Engine V2
────────────────────────────

Question Engine은 답을 얻기 위해 질문하지 않는다.

사용자가 자신의 기록 속 반응을 다시 바라보고,
아직 의식하지 못한 연결을 발견하도록 Reflection을 시작한다.

최종 질문을 만들기 전에 다음 과정을 내부적으로 수행하라.
이 내부 과정은 사용자에게 출력하지 않는다.

Step 1. Record Understanding

기록에서 다음을 파악한다.

- 주요 사건
- 에너지가 높았던 대상
- 반복해서 등장한 대상
- 변화나 대비가 드러난 문장
- 사용자가 직접 의미를 부여한 문장
- 설명되지 않은 연결점

Step 2. Reflection Gap Detection

이미 기록된 사실과,
기록 속에 암시되어 있지만 아직 충분히 말해지지 않은 부분을 구분한다.

단순히 빠진 정보를 묻지 않는다.

사용자의 자기 이해를 한 단계 확장할 가능성이 있는
Reflection Gap 하나를 선택한다.

Step 3. Question Intent Selection

다음 중 가장 적합한 intent 하나를 선택한다.

- observation:
  중요한 순간, 장면, 반응을 구체적으로 다시 보게 한다.

- meaning:
  특정 반응이 사용자에게 어떤 의미인지 바라보게 한다.

- pattern:
  오늘의 반응을 최근의 반복이나 변화와 연결한다.

- possibility:
  발견된 반응이 앞으로 어떤 가능성을 여는지 생각하게 한다.
  단, 조언이나 행동 지시로 만들지 않는다.

Step 4. Candidate Generation

서로 다른 관점의 후보 질문 5개를 내부적으로 생성한다.

표현만 바꾼 동일한 질문 5개를 만들지 않는다.

Step 5. Question Evaluation

각 후보를 다음 기준으로 평가한다.

- Reflection:
  자신의 경험을 다시 바라보게 하는가?

- Grounding:
  실제 기록의 구체적인 내용에 연결되는가?

- Neutrality:
  답이나 감정을 미리 정하지 않는가?

- Novelty:
  이미 쓴 내용을 그대로 다시 묻지 않는가?

- Depth:
  답변 뒤에도 다음 생각으로 이어질 가능성이 있는가?

- Clarity:
  한 번 읽고 이해할 수 있는가?

- Singularity:
  하나의 질문에서 하나의 생각만 요구하는가?

가장 가치 있는 질문 하나만 선택한다.

────────────────────────────
3. 질문 폐기 규칙
────────────────────────────

다음 중 하나라도 해당하면 후보를 폐기하고 다시 만든다.

1. Yes / No 질문

나쁜 예:
"Molip 개발이 즐거웠나요?"

2. 답을 유도하는 질문

나쁜 예:
"Molip가 삶의 새로운 목표가 되었다고 느끼나요?"

3. 기록 반복

나쁜 예:
"운동은 해야 하는 일이고 Molip는 하고 싶은 일인가요?"

4. 두 가지 이상을 한꺼번에 묻는 복합 질문

나쁜 예:
"왜 Molip가 재미있었고 앞으로 어떻게 발전시키고 싶나요?"

5. 어느 기록에도 붙일 수 있는 일반적인 질문

나쁜 예:
"오늘 기분은 어땠나요?"

6. 사람을 성격이나 유형으로 정의하는 질문

나쁜 예:
"당신은 성취 욕구가 강한 사람인가요?"

7. 질문처럼 표현한 조언

나쁜 예:
"앞으로 운동과 개발 시간을 잘 나눠보는 것은 어떨까요?"

8. 근거 없이 추궁하는 '왜' 질문

나쁜 예:
"왜 그렇게 느꼈나요?"

9. 사용자의 표현에서 멀어진 추상적인 심리 용어

나쁜 예:
"내적 에너지와 자아실현은 어떻게 연결되어 있나요?"

────────────────────────────
4. 질문 언어 규칙
────────────────────────────

1. 자연스러운 한국어 존댓말을 사용한다.
2. 상담사나 코치처럼 말하지 않는다.
3. 지나치게 감성적이거나 시적인 표현을 피한다.
4. 전문 심리 용어를 사용하지 않는다.
5. 질문은 한 문장으로 작성한다.
6. 질문 하나만 포함한다.
7. 질문 끝에는 물음표를 붙인다.
8. 질문 앞에 설명, 칭찬, 해석을 붙이지 않는다.
9. 사용자 기록의 구체적인 대상이나 장면에 연결한다.
10. 이미 기록한 결론을 다시 확인하지 않는다.

────────────────────────────
5. 좋은 질문 방향
────────────────────────────

기록:
"운동은 반드시 해야 할 일이라면 Molip는 내가 하고 싶어서
하는 일인 것 같다. 둘의 균형이 중요하다."

좋은 방향:
"지금의 삶에서 운동과 Molip가 서로 다르게 채워주는 것은
무엇일까요?"

기록:
"Molip Beta 출시 작업을 마쳤고 정신적인 성취감이 생겼다."

좋은 방향:
"오늘 작업이 끝났다고 가장 실감했던 순간은 언제였나요?"

기록:
"예전에는 공회전하는 느낌이었지만 요즘 Molip를 생각하면
에너지가 오른다."

좋은 방향:
"예전의 공회전하던 때와 비교해 요즘 가장 달라진 반응은
무엇인가요?"

────────────────────────────
6. 응답 형식
────────────────────────────

반드시 아래 구조의 JSON 객체 하나만 반환한다.

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
  "reflection_gap": "경제적 부담에서 실제 지출과 미래에 대한 걱정 중 무엇이 더 크게 작용하는지는 아직 구분되지 않았다.",
  "reflection_intent": "meaning",
  "reflection_question": "경제적 부담이 마음에 남을 때, 실제 지출과 미래에 대한 걱정 중 무엇이 더 크게 느껴졌나요?"
}

reflection_intent는 반드시 다음 중 하나다.

observation, meaning, pattern, possibility

사용자 기록:
${JSON.stringify(logs, null, 2)}
`;

  const text = await generateAIText(prompt);

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `AI 분석 결과를 JSON으로 해석할 수 없습니다. 응답: ${cleaned.slice(
        0,
        300
      )}`
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI 분석 결과가 올바른 JSON 객체가 아닙니다.");
  }

  const result = parsed as Record<string, unknown>;

  const reactionTargets = Array.isArray(result.reaction_targets)
    ? result.reaction_targets
        .filter(isReactionTarget)
        .slice(0, 5)
        .map((item) => ({
          ...item,
          weight: clamp01(item.weight),
        }))
    : [];

  const overallEnergy: AIInsight["overall_energy"] =
    result.overall_energy === "높음" ||
    result.overall_energy === "보통" ||
    result.overall_energy === "낮음"
      ? result.overall_energy
      : "보통";

  const reflectionQuestion =
    typeof result.reflection_question === "string" &&
    result.reflection_question.trim().length > 0
      ? result.reflection_question.trim()
      : typeof result.question === "string" &&
          result.question.trim().length > 0
        ? result.question.trim()
        : "오늘 기록에서 아직 충분히 말하지 않은 부분은 무엇일까요?";

  const reflectionGap =
    typeof result.reflection_gap === "string" &&
    result.reflection_gap.trim().length > 0
      ? result.reflection_gap.trim()
      : undefined;

  const reflectionIntent = isReflectionIntent(result.reflection_intent)
    ? result.reflection_intent
    : undefined;

  return {
    reaction_targets: reactionTargets,
    overall_emotion:
      typeof result.overall_emotion === "string"
        ? result.overall_emotion
        : "알 수 없음",
    overall_energy: overallEnergy,
    immersion_score: clamp01(result.immersion_score),
    confidence: clamp01(result.confidence),
    summary:
      typeof result.summary === "string" && result.summary.trim().length > 0
        ? result.summary.trim()
        : "분석 결과를 요약할 수 없습니다.",
    reflection_question: reflectionQuestion,
    reflection_gap: reflectionGap,
    reflection_intent: reflectionIntent,
  };
}