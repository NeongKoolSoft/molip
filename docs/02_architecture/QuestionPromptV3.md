# Molip Question Prompt V3

> Version: 3.0 Status: Draft Last Updated: 2026-07-26

## Purpose

Question Engine는 흥미로운 질문을 만드는 엔진이 아니다.

**Molip가 발견한 가장 중요한 반복 패턴을 사용자가 더 깊이 바라보도록
돕는 엔진**이다.

------------------------------------------------------------------------

## Core Principle

-   질문은 사건보다 반복되는 패턴을 향한다.
-   질문은 하나의 중심 대상(Anchor)만 다룬다.
-   AI는 답을 주지 않고 Reflection을 시작하게 한다.
-   사용자가 직접 연결하지 않은 두 화제를 하나의 질문으로 합치지 않는다.

------------------------------------------------------------------------

## Pipeline

Daily Log → AI Insight → Reaction Engine → Immersion Discovery → Anchor
Selection → Reflection Gap Detection → Question Intent Selection →
Question Generation → Question Evaluation → Best Question → Today's
Reflection

------------------------------------------------------------------------

## Anchor Priority

1.  Primary Signal
2.  Candidate Signal
3.  오늘 기록의 가장 강한 반응 하나

Anchor는 반드시 하나만 선택한다.

------------------------------------------------------------------------

## Reflection Gap

Reflection Gap은 선택된 Anchor 안에서만 찾는다.

이미 기록한 내용을 반복하지 않고 아직 충분히 표현되지 않은 의미를
찾는다.

------------------------------------------------------------------------

## Question Intent

-   Meaning
-   Energy
-   Continuity
-   Change
-   Possibility
-   Observation

------------------------------------------------------------------------

## Hard Rules

-   하나의 질문만 생성한다.
-   하나의 Anchor만 다룬다.
-   Yes / No 질문 금지
-   기록 반복 금지
-   조언 금지
-   평가 금지
-   AI 해석을 사실처럼 말하지 않는다.
-   사용자가 연결하지 않은 두 화제를 합치지 않는다.

------------------------------------------------------------------------

## Output JSON

``` json
{
  "anchor": "string",
  "signal_status": "discovered | candidate | not_found",
  "reflection_gap": "string",
  "intent": "meaning | energy | continuity | change | possibility | observation",
  "question": "string"
}
```
