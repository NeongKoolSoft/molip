# Project Molip API

## 목적

Molip API는 Frontend와 Database를 연결한다.

DB에는 원본 데이터만 저장한다.

AI 분석은 Service Layer에서 수행한다.

---

# API 목록

| Method | URL | 설명 |
|---------|-----|------|
| GET | /api/tags | 반응 태그 조회 |
| POST | /api/logs | 오늘 기록 저장 |
| GET | /api/logs/today | 오늘 기록 조회 |
| POST | /api/analyze | AI 분석 |

---

# GET /api/tags

### 설명

사용 가능한 반응 태그를 조회한다.

### Request

없음

### Response

- System Tag 목록
- User Tag 목록

---

# POST /api/logs

### 설명

오늘의 기록을 저장한다.

하루에 하나의 기록만 가진다.

이미 존재하면 수정(Update)한다.

### Request

content

- string

tagIds

- string[]

### Response

저장된 기록 반환

---

# GET /api/logs/today

### 설명

오늘 작성한 기록을 조회한다.

### Response

기록이 있으면 반환

기록이 없으면

log = null

---

# POST /api/analyze

### 설명

오늘 기록을 AI가 분석한다.

DB에는 저장하지 않는다.

### Input

content

tags

### Output

summary

signals

question

---

# 인증

모든 API는 로그인 후 사용한다.

user_id는 Frontend가 보내지 않는다.

Supabase Auth에서 가져온다.

---

# Error

UNAUTHORIZED

VALIDATION_ERROR

NOT_FOUND

INTERNAL_ERROR

---

# Sprint1 범위

✔ 기록 저장

✔ 기록 조회

✔ 태그 조회

✔ AI 분석

---

# Sprint2

기록 검색

주간 리포트

몰입 패턴

추천

AI 히스토리