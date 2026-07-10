# Reflection History

> Version 0.8
>
> Reflection History는
> 사용자의 기록 수정 이력만 저장하는 기능이 아니다.
>
> 질문을 통해 생각이 어떻게 깊어지고,
> 기록이 어떻게 변화했는지를 남기는 구조이다.

---

# Why

현재 Molip의 `daily_logs`에는

오늘의 최신 기록만 남는다.

사용자가 Reflection Question을 보고
기록을 수정하면,
이전 기록은 사라진다.

하지만 Molip가 Growth Signal과
Immersion Signal을 발견하려면

다음 흐름을 기억해야 한다.

```text
최초 기록

↓

Reflection Question

↓

수정된 기록

↓

새로운 AI 분석

↓

새로운 Reflection Question

↓

다시 수정된 기록
```

Reflection History는

사용자의 생각이 어떻게 변화했는지를
시간 순서대로 보존한다.

---

# Core Principle

Molip는

완성된 기록만 저장하지 않는다.

기록이 완성되어 가는 과정도 기억한다.

Reflection History의 목적은

사용자의 글을 감시하거나
수정 횟수를 평가하는 것이 아니다.

생각이 어떻게 확장되고
구체화되었는지를 이해하기 위한
증거를 남기는 것이다.

---

# Reflection Revision

Reflection Revision은

특정 시점의 기록 내용이다.

예시:

```text
Revision 1

오늘부터 Molip 개발을 시작한다.
```

```text
Revision 2

나를 위한 시스템을 만들고 싶다.
```

```text
Revision 3

다른 사람에게도 도움이 되는 서비스를 만들고 싶다.
```

```text
Revision 4

인생 2막을 시작했기 때문이다.
```

각 Revision은

좋고 나쁨을 평가하지 않는다.

단지

그 시점에 사용자가 남긴 생각을 보존한다.

---

# Revision Flow

```text
Daily Log Draft

↓

Revision 1 저장

↓

AI Analysis

↓

Reflection Question

↓

사용자 수정

↓

Revision 2 저장

↓

AI 재분석

↓

새로운 Reflection Question

↓

Revision 3 저장
```

이 흐름은

사용자가 더 이상 수정하지 않을 때까지
반복될 수 있다.

---

# Reflection Event

Reflection Event는

질문과 수정 사이의 연결이다.

```text
Revision 1

↓

Reflection Question 1

↓

Revision 2
```

하나의 Reflection Event는
최소한 다음 정보를 가진다.

- 질문이 생성된 시점
- 질문 내용
- 질문이 연결된 Revision
- 질문 이후 생성된 Revision
- 사용자가 실제로 기록을 수정했는지 여부

이 관계가 남아야

어떤 질문이
사용자의 생각을 더 깊게 만들었는지
나중에 관찰할 수 있다.

---

# Data Model Overview

```text
daily_logs
└─ 오늘의 최신 기록

log_revisions
├─ 최초 기록
├─ 1차 수정 기록
├─ 2차 수정 기록
└─ 최종 기록

ai_analyses
├─ 각 시점의 반응 분석
└─ Reflection Question

reflection_events
└─ 질문과 다음 수정본의 연결
```

현재 Sprint 5에서는

`log_revisions`를 우선 구현한다.

`reflection_events`는
필요한 데이터가 충분히 쌓인 뒤
다음 단계에서 구현할 수 있다.

---

# Proposed Revision Data

각 Revision은
다음 정보를 가진다.

```text
id

user_id

daily_log_id

log_date

content

revision_number

source

created_at
```

---

# Field Meaning

## id

Revision의 고유 식별자이다.

---

## user_id

Revision을 작성한 사용자이다.

---

## daily_log_id

어떤 Daily Log의 수정 이력인지 연결한다.

---

## log_date

해당 기록의 날짜이다.

---

## content

그 시점의 전체 기록 내용이다.

차이값만 저장하지 않고
전체 스냅샷을 저장한다.

V1에서는
구조를 단순하게 유지하기 위해
전체 내용을 보존한다.

---

## revision_number

하루 안에서의 수정 순서이다.

예시:

```text
1
2
3
4
```

---

## source

Revision이 어떤 흐름에서 저장되었는지를 나타낸다.

초기 후보:

```text
initial

manual_edit

reflection_edit
```

V1에서는
사용자가 저장한 모든 수정본을
`manual_edit`로 저장할 수 있다.

Reflection과의 명확한 연결이 가능해지면
`reflection_edit`를 사용한다.

---

## created_at

Revision이 저장된 시간이다.

---

# Why Full Snapshot

V1에서는
수정된 부분만 저장하지 않고
전체 기록을 저장한다.

이유:

- 구현이 단순하다.
- 각 Revision을 독립적으로 읽을 수 있다.
- 이전 내용과 비교하기 쉽다.
- Meaning Growth 분석에 적합하다.
- 데이터가 아직 많지 않아 저장 비용 부담이 작다.

추후 데이터가 크게 증가하면
Diff 방식이나 압축 저장을 검토할 수 있다.

---

# Save Flow

기록 저장 시
다음 순서로 처리한다.

```text
사용자 저장 클릭

↓

현재 Daily Log 조회

↓

내용이 이전 기록과 같은지 확인

├─ 같음
│  └─ Revision 저장하지 않음
│
└─ 다름
   ├─ log_revisions에 새 Revision 추가
   ├─ daily_logs 최신 내용 갱신
   ├─ 오늘 AI 분석 캐시 삭제
   └─ 재분석 가능 상태로 변경
```

같은 내용이 반복 저장되었을 때
불필요한 Revision은 생성하지 않는다.

---

# Initial Revision

기존 사용자의 과거 기록에는
Revision History가 없다.

V1에서는 두 가지 방법을 고려한다.

## 방법 A

새로운 수정부터 Revision을 저장한다.

장점:

- 구현이 단순하다.
- 마이그레이션이 필요 없다.

단점:

- 최초 기록이 Revision History에 없을 수 있다.

---

## 방법 B

최초 수정 시
기존 Daily Log를 Revision 1로 저장하고,
수정된 내용을 Revision 2로 저장한다.

장점:

- 수정 전후 비교가 가능하다.

단점:

- 저장 로직이 조금 복잡하다.

Sprint 5 V1에서는
**방법 B를 우선 검토한다.**

Reflection Loop의 시작점을 보존하는 것이
Growth Signal 분석에 더 유용하기 때문이다.

---

# Growth Data

Reflection History에서
다음 데이터를 얻을 수 있다.

## 수정 횟수

```text
Revision 1 → Revision 4

수정 3회
```

---

## 기록 길이 변화

```text
초기 28자

↓

최종 174자
```

---

## 새로 추가된 의미

```text
개발 시작

↓

자기 만족

↓

타인에게 주는 도움

↓

수익 가능성

↓

인생 2막
```

---

## 표현의 구체성

초기에는
행동만 적었는가?

Reflection 이후
이유와 가치가 추가되었는가?

---

## Reaction 변화

같은 Reaction Target이 유지되는가?

Reaction Type이나 Weight가 변하는가?

---

# Growth Signal과의 관계

Reflection History는

Growth Signal의 원본 데이터이다.

```text
Reflection History

↓

Revision 비교

↓

Meaning Growth

↓

Growth Signal

↓

Immersion Signal
```

Revision이 없으면
생각의 변화도 비교할 수 없다.

따라서 Reflection History는
Immersion Discovery Engine의
기반 데이터 구조이다.

---

# UX Principle

Reflection History는

사용자에게
모든 수정 과정을 강제로 보여주지 않는다.

기록 과정이 부담이나 감시처럼
느껴져서는 안 된다.

초기에는
시스템 내부 데이터로 저장한다.

사용자에게 보여줄 때는

```text
생각이 이렇게 깊어졌습니다.
```

처럼
의미 있는 변화만 조심스럽게 표현한다.

---

# Privacy Principle

Reflection History에는
사용자의 개인적인 생각이 축적된다.

따라서 다음 원칙을 지킨다.

- 본인만 조회할 수 있다.
- RLS를 적용한다.
- 사용자가 원하면 삭제할 수 있어야 한다.
- 장기적으로 History 저장 여부를 선택할 수 있어야 한다.
- 분석 목적보다 사용자 통제권을 우선한다.

---

# V1 Scope

Sprint 5 V1에서 구현한다.

- `log_revisions` 테이블 생성
- Revision 번호 관리
- 내용이 변경된 경우에만 저장
- Daily Log 최신본 유지
- AI 분석 캐시 무효화 유지
- 개발 확인용 Revision 조회

---

# Out of Scope

이번 단계에서는 구현하지 않는다.

- Reflection Event 별도 테이블
- Revision 간 의미 비교
- Growth Score 계산
- 사용자용 Revision Timeline
- 수정본 복원
- 자동 최종본 확정
- 여러 질문과 수정의 인과관계 판정

이 기능들은
Revision 데이터가 실제로 쌓인 뒤
검토한다.

---

# Future

Reflection History가 축적되면
Molip는 다음 질문을 탐색할 수 있다.

- 어떤 질문이 생각을 더 깊게 만드는가?
- 사용자는 어떤 주제에서 기록을 자주 수정하는가?
- 행동 중심 기록이 가치 중심 기록으로 확장되는가?
- 반복되는 Reflection이 몰입으로 이어지는가?
- 사용자의 언어는 시간에 따라 어떻게 변하는가?

이 질문들은
사용자를 평가하기 위한 것이 아니다.

자기 이해를 더 깊게 돕기 위한 것이다.

---

# Final Principle

Molip는

최종 기록만 기억하지 않는다.

사용자가

질문을 통해 생각하고,

다시 쓰고,

조금 더 자신을 이해하게 되는 과정도

함께 기억한다.

Reflection History는

수정 이력이 아니라

생각이 자라난 흔적이다.