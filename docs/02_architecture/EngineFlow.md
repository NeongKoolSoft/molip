# Engine Flow

> Version 0.8
>
> Engine Flow는 Molip의 전체 아키텍처이다.
>
> 사용자의 기록이 자기 이해와 몰입의 성장으로 이어지는 과정을 정의한다.
>
> 이 문서는 기능의 순서가 아니라,
> 사람이 자기 자신을 이해해 가는 흐름을 설명한다.

---

# Why

Molip는 기록을 저장하는 서비스가 아니다.

기록을 통해

사용자가

자기 자신을 이해하고,

반복되는 반응을 발견하며,

조금씩 자신의 삶을 만들어 갈 수 있도록 돕는 서비스이다.

Engine Flow는

그 전체 과정을 연결하는 가장 상위 구조이다.

---

# Core Flow

```text
Living

↓

Daily Log

↓

Reaction

↓

Reflection

↓

Meaning

↓

Growth

↓

Immersion

↓

Life Pattern

↓

Self Understanding

↓

Choice

↓

Living Again
```

이 흐름은

한 번의 분석으로 끝나지 않는다.

사용자의 삶 속에서

계속 반복되는 성장의 순환 구조이다.

---

# Layer 1 : Reaction Engine

## 목적

사용자가 무엇에 반복적으로 반응하는지를 발견한다.

## Input

Daily Log

## Output

Reaction Target

- 운동
- 경제적 부담
- Molip 개발

등

반복되는 반응 대상을 추출한다.

Reaction Engine은

사람을 정의하지 않는다.

최근 기록에서 나타나는 반응만 추출한다.

---

# Layer 2 : Reflection Loop

## 목적

사용자가

자신의 반응을

스스로 다시 생각하도록 돕는다.

## Flow

```text
Reaction

↓

Reflection Question

↓

Log 수정

↓

새로운 Reflection
```

Reflection은

AI가 답을 주는 과정이 아니다.

사용자가

스스로 생각을 이어가는 과정이다.

---

# Layer 3 : Meaning Growth

## 목적

Reflection을 통해

생각의 의미가

어떻게 변화하는지를 본다.

예를 들어

```text
오늘 개발을 시작했다.

↓

나를 위한 시스템을 만들고 싶다.

↓

다른 사람에게도 도움이 되고 싶다.

↓

인생 2막을 시작했기 때문이다.
```

기록이 길어진 것이 아니라

생각의 깊이가 성장한 것이다.

Molip는

이러한 의미의 성장을 발견한다.

---

# Layer 4 : Growth Signal

Growth Signal은

몰입보다 먼저 나타나는 변화의 신호이다.

현재 고려하는 요소는 다음과 같다.

| Signal | 의미 |
|---------|------|
| 반복 | 같은 주제가 계속 나타나는가 |
| 반응 강도 | Weight가 변화하는가 |
| 표현의 구체성 | 기록이 점점 구체적으로 변하는가 |
| Reflection | 기록 수정이 발생했는가 |
| Meaning | 이유와 가치가 드러나는가 |

Growth Signal은

하나의 수치가 아니라

변화의 흐름이다.

※ 계산 방식은 Sprint 5 구현 과정에서 구체화한다.

---

# Layer 5 : Immersion Discovery

몰입은

갑자기 생기지 않는다.

반복되는 반응과

Reflection,

그리고 성장의 흐름이

시간 속에서 이어질 때

몰입의 신호가 나타난다.

Molip는

"당신은 몰입하는 사람입니다."

라고 말하지 않는다.

대신

최근 기록에서는

이러한 변화가 나타나고 있습니다.

라는 증거를 보여준다.

---

# Layer 6 : Life Pattern

여러 Immersion Signal이

시간 속에서 연결되면

Life Pattern이 형성된다.

Life Pattern은

성격 분석이 아니다.

사용자가

어떤 순간에

살아있음을 느끼는지를

시간의 흐름 속에서 보여주는 것이다.

---

# Continuous Loop

```text
Living

↓

Record

↓

Understand

↓

Choose

↓

Living Again
```

자기 이해는

한 번 완성되는 결과가 아니다.

삶 속에서

계속 반복되는 과정이다.

Molip는

이 반복을 함께한다.

---

# AI의 역할

AI는

사용자를 판단하지 않는다.

AI의 역할은

- 반응을 추출한다.
- Reflection Question을 생성한다.
- 변화의 흐름을 요약한다.

AI는

판단자가 아니라

생각을 돕는 촉진자(Facilitator)이다.

---

# 사용자의 역할

사용자는

```text
기록한다.

↓

생각한다.

↓

수정한다.

↓

선택한다.

↓

성장한다.
```

Molip는

선택을 대신하지 않는다.

이후의 선택은

사용자의 몫이다.

---

# Future

현재 Engine Flow는

Reaction

Reflection

Meaning

Growth

Immersion

Life Pattern

까지 정의되어 있다.

앞으로 Sprint를 진행하면서

각 Layer는

점차 구체화된다.

Engine Flow 역시

고정된 설계가 아니라

제품과 함께 성장하는 살아있는 아키텍처이다.

---

# Sprint Mapping

```text
Sprint 1

Daily Log

↓

Sprint 2

Reaction Engine

↓

Sprint 3

Timeline

↓

Sprint 4

Reflection Loop

↓

Sprint 5

Growth Signal
Immersion Discovery

↓

Sprint 6

Life Pattern

↓

Sprint 7+

Personal Growth OS

↓

Long-term Vision

Life OS
```

---

# Final Principle

Molip는

사용자의 삶을 분석하는 서비스가 아니다.

사용자가

자기 자신을 이해하고,

반복되는 반응을 발견하며,

몰입이 자라나는 과정을

함께 발견하는 서비스이다.

그리고

그 이후의 선택은

항상 사용자의 몫이다.