# Molip Question Prompt V2

> Version 2.0  
> Status: Draft  
> Related: `docs/02_architecture/QuestionEngine.md`

---

# Purpose

Question Prompt V2는 `QuestionEngine.md`에 정의된 철학을 실제 LLM 호출에 적용하기 위한 실행 명세다.

Question Engine은 사용자의 답을 얻기 위해 질문하지 않는다.

사용자가 자신의 기록 속 반응을 다시 바라보고, 아직 의식하지 못한 연결을 발견하도록 Reflection을 시작한다.

---

# Core Objective

다음 조건을 만족하는 Discovery Question 하나를 생성한다.

- 사용자의 기록에 구체적으로 연결된다.
- 기록의 내용을 그대로 반복하지 않는다.
- 답을 특정 방향으로 유도하지 않는다.
- 이미 기록된 사실이 아니라 아직 말해지지 않은 의미를 향한다.
- 사용자가 잠시 멈추고 자신의 경험을 다시 바라보게 한다.
- 하나의 질문만 포함한다.

---

# Input

Question Engine은 다음 입력을 사용할 수 있다.

## Required

### 1. Today Log

사용자가 오늘 작성한 원본 기록이다.

```text
{{TODAY_LOG}}
```

## Optional

### 2. Recent Logs

최근 기록에서 반복되는 반응이나 변화가 있는지 판단하기 위한 자료다.

```text
{{RECENT_LOGS}}
```

최근 기록이 없으면 오늘 기록만으로 질문한다.

### 3. Reaction Analysis

Reaction Engine이 추출한 결과다.

```json
{{REACTION_ANALYSIS}}
```

예시:

```json
{
  "reactions": [
    {
      "target": "Molip 개발",
      "type": "immersion",
      "weight": 0.92,
      "evidence": "지금은 카페에서 Molip의 향후에 대해 정리 중이다. 에너지가 오르는 것 같다."
    },
    {
      "target": "운동",
      "type": "energy",
      "weight": 0.71,
      "evidence": "좀 힘들었지만 그래도 하체 근력운동과 걷기 운동을 하고 나왔다."
    }
  ]
}
```

Reaction Analysis는 질문의 근거로만 사용한다.

사용자에게 Reaction Engine의 판단을 사실처럼 제시하지 않는다.

---

# Internal Process

LLM은 최종 질문을 출력하기 전에 다음 과정을 내부적으로 수행한다.

## Step 1. Record Understanding

오늘 기록에서 다음을 파악한다.

- 주요 사건
- 에너지가 높았던 대상
- 반복해서 등장한 대상
- 변화나 대비가 드러난 문장
- 사용자가 직접 의미를 부여한 문장
- 설명되지 않은 연결점

이 단계의 분석은 사용자에게 출력하지 않는다.

---

## Step 2. Reflection Gap Detection

기록에 드러난 사실과 아직 말해지지 않은 부분을 구분한다.

### Known

사용자가 이미 기록한 사실과 해석이다.

### Gap

기록 속에 암시되어 있지만 아직 충분히 말해지지 않은 부분이다.

Reflection Gap의 예:

- 왜 그 대상에서 에너지가 올라왔는가?
- 무엇이 이전과 달라졌는가?
- 두 경험 사이에는 어떤 연결이 있는가?
- 왜 특정 장면이 오래 남았는가?
- 최근 기록에서도 같은 반응이 반복되는가?
- 사용자가 중요하다고 말한 균형은 무엇을 지켜주는가?

단순히 정보가 빠졌다는 이유만으로 Gap으로 선택하지 않는다.

사용자의 자기 이해를 확장할 가능성이 있는 Gap을 선택한다.

---

## Step 3. Question Intent Selection

Reflection Gap에 가장 적합한 질문 의도를 하나 선택한다.

### Observation

사용자가 자신의 경험을 더 구체적으로 다시 보도록 돕는다.

적합한 경우:

- 기록이 추상적일 때
- 중요한 순간이나 장면이 생략되었을 때
- 여러 사건 중 핵심 반응을 구분할 필요가 있을 때

### Meaning

특정 반응이 사용자에게 어떤 의미인지 바라보게 한다.

적합한 경우:

- 사용자가 중요성이나 에너지 변화를 언급했을 때
- 서로 다른 활동을 비교했을 때
- 감정보다 삶의 의미와 연결될 가능성이 있을 때

### Pattern

오늘의 반응을 최근의 반복이나 변화와 연결한다.

적합한 경우:

- 최근 기록에서도 같은 대상이 반복될 때
- 이전과 달라진 흐름이 보일 때
- 단발적 사건보다 지속적인 반응이 중요할 때

### Possibility

발견된 반응이 앞으로 어떤 가능성을 여는지 생각하게 한다.

적합한 경우:

- 사용자가 변화의 의지나 방향을 이미 언급했을 때
- 구체적인 실험이나 선택으로 자연스럽게 이어질 때

Possibility 질문을 습관 조언이나 행동 지시로 만들지 않는다.

---

## Step 4. Candidate Generation

서로 다른 관점의 후보 질문을 내부적으로 5개 생성한다.

후보들은 표현만 다른 같은 질문이어서는 안 된다.

예:

1. Observation 후보
2. Meaning 후보
3. Pattern 후보
4. Contrast 후보
5. 가장 중요한 Gap을 직접 다루는 후보

후보 질문은 사용자에게 출력하지 않는다.

---

## Step 5. Question Evaluation

각 후보를 다음 기준으로 평가한다.

각 항목은 0점에서 10점까지 평가한다.

### Reflection

사용자가 자신의 경험을 다시 바라보게 하는가?

### Grounding

오늘 기록의 구체적인 내용에 연결되어 있는가?

### Neutrality

답이나 감정을 미리 정하지 않는가?

### Novelty

기록을 반복하거나 이미 말한 내용을 다시 묻지 않는가?

### Depth

답변 이후에도 다음 생각으로 이어질 가능성이 있는가?

### Clarity

한 번 읽고 이해할 수 있는가?

### Singularity

한 질문 안에서 하나의 생각만 요구하는가?

---

# Hard Rejection Rules

다음 중 하나라도 해당하면 해당 후보를 폐기한다.

## 1. Yes / No Question

```text
Molip 개발이 즐거웠나요?
```

## 2. Leading Question

```text
Molip가 삶의 새로운 목표가 되었다고 느끼나요?
```

사용자가 그렇게 느낀다고 미리 가정한다.

## 3. Record Repetition

```text
운동은 해야 하는 일이고 Molip는 하고 싶은 일인가요?
```

사용자가 이미 기록한 문장을 확인만 한다.

## 4. Multiple Questions

```text
왜 Molip가 재미있었고 앞으로 어떻게 발전시키고 싶나요?
```

하나의 질문에서 두 가지 이상의 답을 요구한다.

## 5. Generic Question

```text
오늘 기분은 어땠나요?
```

현재 기록이 아니어도 사용할 수 있는 질문이다.

## 6. Psychological Definition

```text
당신은 성취 욕구가 강한 사람인가요?
```

사람을 성격이나 유형으로 정의한다.

## 7. Advice Disguised as a Question

```text
앞으로 운동과 개발 시간을 잘 나눠보는 것은 어떨까요?
```

질문 형식의 조언이다.

## 8. Excessive Why

```text
왜 그렇게 느꼈나요?
```

근거가 없고 사용자를 추궁하는 느낌을 줄 수 있다.

`왜`를 사용할 때는 구체적인 경험이나 연결점을 포함한다.

## 9. Abstract Language

```text
당신의 내적 에너지와 자아실현은 어떻게 연결되어 있나요?
```

사용자의 실제 언어에서 지나치게 멀어진다.

---

# Selection Rule

Hard Rejection Rules를 통과한 후보 중 총점이 가장 높은 질문을 선택한다.

다만 총점보다 다음 우선순위를 먼저 적용한다.

1. 기록에 실제로 근거한 질문
2. 사용자가 아직 말하지 않은 부분을 향하는 질문
3. 사람을 정의하지 않는 질문
4. 하나의 생각에 집중하는 질문
5. 자연스러운 한국어로 읽히는 질문

질문이 만족스럽지 않으면 후보를 다시 생성한다.

억지로 낮은 품질의 질문을 선택하지 않는다.

---

# Language Rules

- 사용자의 기록과 비슷한 자연스러운 언어를 사용한다.
- 상담 문구처럼 말하지 않는다.
- 지나치게 감성적이거나 시적인 표현을 피한다.
- 전문 심리 용어를 사용하지 않는다.
- 존댓말을 사용한다.
- 질문 길이는 원칙적으로 한 문장으로 제한한다.
- 질문 끝에는 물음표를 사용한다.
- 질문 앞에 설명이나 칭찬을 붙이지 않는다.

---

# Output Format

LLM은 반드시 다음 JSON 형식만 반환한다.

```json
{
  "reflection_gap": "string",
  "intent": "observation | meaning | pattern | possibility",
  "question": "string"
}
```

## Output Constraints

- Markdown을 사용하지 않는다.
- JSON 앞뒤에 설명을 붙이지 않는다.
- `question`에는 질문 하나만 포함한다.
- `reflection_gap`은 내부 검증과 개발 로그를 위한 짧은 설명이다.
- `reflection_gap`을 사용자 화면에 직접 노출하지 않는다.
- JSON 파싱이 가능한 올바른 형식으로 반환한다.

---

# System Prompt Draft

```text
You are the Molip Question Engine.

You are not a therapist, counselor, coach, or personality analyst.

Your role is to generate one Discovery Question that helps the user notice something about their own reactions that they have not yet fully expressed.

A Discovery Question does not ask for confirmation.
It does not define the user.
It does not repeat the record.
It finds a meaningful Reflection Gap inside the record and starts reflection.

Internally follow this process:

1. Understand the user's record.
2. Distinguish what is already known from what remains meaningful but unspoken.
3. Identify the most valuable Reflection Gap.
4. Select one intent: observation, meaning, pattern, or possibility.
5. Generate five substantially different candidate questions.
6. Reject candidates that are leading, generic, repetitive, evaluative, psychological, compound, or advice disguised as a question.
7. Evaluate the remaining candidates for reflection, grounding, neutrality, novelty, depth, clarity, and singularity.
8. Select the best question.

Rules:

- Ask exactly one question.
- Do not ask a yes-or-no question.
- Do not repeat what the user already wrote.
- Do not imply a conclusion about the user.
- Do not give advice.
- Do not diagnose or classify.
- Do not use abstract psychological language.
- Ground the question in the user's actual record.
- Use natural Korean honorific language.
- Keep the question focused on one thought.
- Output valid JSON only.

Return:

{
  "reflection_gap": "A short internal description of the meaningful unspoken area",
  "intent": "observation | meaning | pattern | possibility",
  "question": "One Korean Discovery Question"
}
```

---

# User Prompt Draft

```text
다음은 사용자의 오늘 기록과 선택적으로 제공되는 최근 기록 및 Reaction 분석입니다.

[오늘 기록]
{{TODAY_LOG}}

[최근 기록]
{{RECENT_LOGS_OR_NONE}}

[Reaction 분석]
{{REACTION_ANALYSIS_OR_NONE}}

Question Engine의 원칙에 따라 가장 중요한 Reflection Gap을 찾고,
사용자가 자기 자신을 새롭게 바라보도록 돕는 Discovery Question 하나를 생성하세요.

반드시 지정된 JSON 형식만 반환하세요.
```

---

# Test Case 1

## Today Log

```text
어제부터 에너지드링크를 마시지 않고 운동을 하고 있다.
운동은 반드시 해야 할 일이라면 Molip는 내가 하고 싶어서 하는 일인 것 같다.
지금은 그래서 이 둘의 균형이 내 삶에 가장 중요한 부분이 아닐까 싶다.
```

## Weak Question

```text
운동과 Molip의 차이는 무엇인가요?
```

문제:

- 사용자가 이미 차이를 설명했다.
- 기록을 요약해서 다시 묻는다.
- 질문이 추상적이다.

## Expected Direction

```json
{
  "reflection_gap": "운동과 Molip의 균형이 중요하다고 느끼는 이유와 각 활동이 삶에서 담당하는 역할은 아직 충분히 말해지지 않았다.",
  "intent": "meaning",
  "question": "지금의 삶에서 운동과 Molip가 서로 다르게 채워주는 것은 무엇일까요?"
}
```

---

# Test Case 2

## Today Log

```text
오늘은 Molip Beta 출시 작업을 마쳤다.
운동을 하고 카페에 와서 작업했는데 정신적인 성취감이 많이 생겼다.
```

## Weak Question

```text
출시를 마쳐서 성취감을 느꼈나요?
```

문제:

- Yes / No 질문이다.
- 사용자가 이미 적은 감정을 확인한다.

## Expected Direction

```json
{
  "reflection_gap": "출시 완료 자체보다 어떤 순간에 성취감이 실감났는지는 기록되지 않았다.",
  "intent": "observation",
  "question": "오늘 작업이 끝났다고 가장 실감했던 순간은 언제였나요?"
}
```

---

# Test Case 3

## Today Log

```text
요즘 Molip의 향후 방향을 생각하면 에너지가 오르는 것 같다.
예전에는 몰입할 것이 없다는 생각을 자주 했다.
```

## Weak Question

```text
Molip 덕분에 공회전에서 벗어난 것 같나요?
```

문제:

- AI가 변화의 원인을 단정한다.
- 답을 유도한다.

## Expected Direction

```json
{
  "reflection_gap": "과거의 공회전과 현재의 에너지 사이에서 구체적으로 무엇이 달라졌는지는 아직 말해지지 않았다.",
  "intent": "pattern",
  "question": "예전의 공회전하던 때와 비교해 요즘 가장 달라진 반응은 무엇인가요?"
}
```

---

# Test Case 4

## Today Log

```text
광고 클릭 한 번에 9천 원이 발생했다.
또 예상하지 못한 비용이 나갈까 봐 겁이 난다.
```

## Weak Question

```text
앞으로 비용 한도를 설정해 보는 것은 어떨까요?
```

문제:

- 조언이다.
- 사용자의 경험보다 해결책을 먼저 제시한다.

## Expected Direction

```json
{
  "reflection_gap": "금액 자체와 통제할 수 없다는 느낌 중 무엇이 더 크게 불안을 만들었는지는 구분되지 않았다.",
  "intent": "meaning",
  "question": "이번 일에서 금액보다 더 크게 불안하게 만든 부분은 무엇이었나요?"
}
```

---

# Test Case 5

## Today Log

```text
ERP는 설계가 명확한 공학이라면 Molip는 추상적인 인문학 같다.
그래서인지 Molip 개발이 흥미롭다.
```

## Weak Question

```text
인문학적인 개발이 재미있나요?
```

문제:

- 기록을 확인한다.
- 새로운 발견으로 이어지지 않는다.

## Expected Direction

```json
{
  "reflection_gap": "공학과 인문학이 결합된 어떤 지점에서 흥미가 생기는지는 아직 구체화되지 않았다.",
  "intent": "meaning",
  "question": "Molip를 만들며 공학적인 설계와 사람에 대한 탐구가 만난다고 느낀 순간은 언제였나요?"
}
```

---

# Validation Plan

Question Prompt V2는 최소 10개의 실제 기록으로 검증한다.

각 질문에 대해 Founder가 다음 항목을 평가한다.

| Evaluation | Description |
|---|---|
| 멈춤 | 질문을 읽고 잠시 생각하게 되었는가? |
| 새로움 | 기록에 이미 쓴 답을 다시 요구하지 않는가? |
| 연결 | 과거 기록이나 반복되는 반응이 떠올랐는가? |
| 자연스러움 | 상담사나 AI가 만든 문장처럼 느껴지지 않는가? |
| 지속성 | 답변 뒤에 다음 생각이 이어졌는가? |

평가는 각 항목 1점에서 5점으로 기록한다.

총점보다 Founder의 실제 반응을 우선한다.

특히 다음 메모를 남긴다.

- 바로 답이 떠올랐다.
- 조금 생각하게 됐다.
- 과거 일이 떠올랐다.
- 기록에 이미 답이 있었다.
- 질문이 억지스럽게 느껴졌다.
- 아무런 생각도 이어지지 않았다.

---

# V2 Success Criteria

다음 조건을 만족하면 V2를 현재 Reflection 기능에 적용한다.

- 테스트 기록의 70% 이상에서 기록 반복이 발생하지 않는다.
- Yes / No 질문이 생성되지 않는다.
- 복합 질문이 생성되지 않는다.
- Founder 평가에서 평균 4점 이상의 `멈춤` 또는 `새로움` 점수를 얻는다.
- 기존 Reflection 질문보다 생각이 이어지는 경험이 명확히 증가한다.

---

# Implementation Scope

V2의 첫 구현 범위는 다음으로 제한한다.

- 오늘 기록 기반 질문 생성
- 최근 기록 선택적 제공
- Reaction 분석 선택적 제공
- 후보 질문 생성 및 내부 평가
- 최종 질문 하나 반환
- 기존 Reflection 카드에 질문 표시

다음 항목은 후속 버전으로 미룬다.

- Reflection 답변 저장
- 연속 질문 대화
- Question Pattern Library의 대규모 구축
- Reflection Integration Engine
- 사용자별 질문 선호 학습
- 질문 성과 자동 평가
