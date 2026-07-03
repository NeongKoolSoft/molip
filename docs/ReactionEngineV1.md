# Molip Reaction Engine V1

## 1. Purpose

Reaction Engine is the core analysis system of Molip.

Molip does not simply analyze emotions.
Molip discovers what the user repeatedly reacts to.

Core question:

> What keeps staying in the user's mind?

---

## 2. Core Principle

User records are raw signals.

LLM extracts structured reaction data.

Molip accumulates and interprets reaction patterns over time.

The LLM should not be the whole product.
The LLM is only the extraction layer.

Molip owns the pattern logic.

---

## 3. Analysis Pipeline

```txt
Daily Log
   ↓
LLM Extraction
   ↓
Reaction Target
   ↓
Reaction Type
   ↓
Reaction Weight
   ↓
Reaction Trend
   ↓
Insight

```

---

## 4. Reaction Target

Reaction Target means the object, topic, person, activity, worry, desire, or idea that stayed in the user's mind.

Examples:

운동
Molip 개발
경제적 부담
가족 건강
야구
AI 자동화

Reaction Target should not be just a surface keyword.

Example:

카드값

should be normalized as:

경제적 부담

if the context is financial pressure.

## 5. Reaction Type

Reaction Type describes how the user reacted to the target.

V1 reaction types:

interest      관심
desire        욕구
avoidance     회피
burden        부담
joy           즐거움
regret        아쉬움
immersion     몰입
concern       걱정
energy        에너지

Example:

{
  "target": "운동",
  "type": "regret",
  "evidence": "운동에 집중이 되지 않아서 조금만 했다"
}

## 6. Reaction Weight

Reaction Weight represents how strongly the user reacted.

Range:

0.0 ~ 1.0

Guideline:

0.1 ~ 0.3 = weak signal
0.4 ~ 0.6 = noticeable signal
0.7 ~ 0.9 = strong signal
1.0       = very strong signal

Weight should consider:

Frequency
Emotional intensity
Repeated mention
Action tendency
User's wording strength

## 7. Reaction Trend

Reaction Trend describes how a reaction changes over time.

V1 trends:

increasing
decreasing
stable
emerging
fading
unknown

Example:

{
  "target": "운동",
  "trend": "increasing",
  "reason": "운동 관련 기록이 최근 7일 동안 반복적으로 증가함"
}

## 8. LLM Responsibility

The LLM is responsible for extraction.

LLM should extract:

reaction_targets
reaction_types
evidence
estimated weight
short summary
reflective question

LLM should not decide long-term identity.

Wrong:

You are a fitness person.

Correct:

운동은 최근 반복적으로 마음에 남는 주제로 보입니다.

## 9. Molip Responsibility

Molip is responsible for accumulation and interpretation.

Molip should calculate:

how often a target appears
whether the target is increasing
whether reaction type changes
whether high-weight reactions repeat
weekly and monthly patterns

Molip should avoid making absolute judgments about the user.

## 10. V1 AI Output Schema
{
  "reaction_targets": [
    {
      "target": "운동",
      "normalized_target": "운동",
      "type": "regret",
      "weight": 0.74,
      "evidence": "운동에 집중이 되지 않아서 조금만 했다"
    },
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
  "summary": "최근 운동과 Molip 개발, 경제적 부담이 반복적으로 마음에 남고 있습니다.",
  "question": "최근 가장 자주 떠오른 것은 운동, 개발, 경제적 부담 중 무엇인가요?"
}

## 11. UX Principle

Molip should speak carefully.

Avoid:

당신은 이런 사람입니다.

Prefer:

최근 기록에서는 이런 신호가 반복되고 있습니다.

Molip should help the user discover patterns, not define the user.

## 12. Sprint 3 Goal

Sprint 3 goal:

Reaction Engine V1

Implementation order:

Update AI output schema
Update prompt
Update UI card
Store analysis result in DB
Compare reaction targets over time
Generate weekly insight