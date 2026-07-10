# Sprint 4 : Reflection Sprint

> Version 1.0
>
> Sprint 4는
> Molip의 철학을
> 처음으로 실제 제품에 구현하는 Sprint이다.

---

# Sprint Goal

Reflection을

Molip의 첫 번째 핵심 사용자 경험으로 구현한다.

사용자는

AI의 답을 받는 것이 아니라,

스스로 생각하게 된다.

---

# Why

Vision House에서는

"선택은 사용자의 몫이다."

라고 정의했다.

하지만

선택은

생각하지 않으면 만들어질 수 없다.

Reflection은

Self Understanding으로 가는

가장 중요한 과정이다.

---

# Sprint Theme

Insight는

끝이 아니다.

Reflection의 시작이다.

---

# User Flow

Daily Log

↓

Reaction Extraction

↓

Timeline

↓

Trend

↓

Insight

↓

Reflection Question

↓

User Reflection

↓

Self Understanding

---

# MVP

Sprint 4에서는

Reflection Question 하나만 구현한다.

---

# Reflection Question

현재

AI는

요약을 제공한다.

앞으로는

사용자가

스스로 생각하도록

질문을 생성한다.

예시

최근 운동이 반복되고 있습니다.

↓

운동 자체보다

운동을 했던 날에는

무엇이 달랐는지 기억나시나요?

---

경제적 부담이 반복되고 있습니다.

↓

최근 가장 많이 신경 쓰이는 것은

돈 자체인가요?

아니면

미래에 대한 불안인가요?

---

Molip 개발이 반복되고 있습니다.

↓

최근 개발을 하면서

가장 즐거웠던 순간은

무엇이었나요?

---

# UI

AI가 발견한 나의 변화

↓

반응

↓

Timeline

↓

Insight

↓

Reflection Question

---

# Implementation

## Step 1

LLM Prompt 수정

Reflection Question 생성

---

## Step 2

AIInsight Type 추가

reflection_question

---

## Step 3

AIInsightCard

Reflection Question 출력

---

## Step 4

UI 개선

질문을

조금 더 눈에 띄게 표시

---

# Success Criteria

사용자는

답을 읽고 끝나는 것이 아니라

잠시 생각하게 된다.

Reflection이

자연스럽게 시작된다.

---

# Sprint Principle

Molip는

답을 주는 서비스가 아니다.

좋은 질문을 만드는 서비스이다.

---

# Out of Scope

이번 Sprint에서는

하지 않는다.

❌ Weekly Insight

❌ Life Pattern

❌ Dashboard 개선

❌ 통계 기능

Reflection만 구현한다.

---

# Expected Result

Sprint 4가 끝나면

사용자는

AI의 분석을 읽는 것이 아니라,

자기 자신에게 질문을 던지게 된다.

Molip는

분석 서비스에서

Reflection Service로

한 단계 진화한다.