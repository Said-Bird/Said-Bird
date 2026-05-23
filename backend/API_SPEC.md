# Said-Bird API 명세서

Base URL: `http://localhost:8000`

인증이 필요한 API는 Header에 토큰을 포함해야 합니다.
```
Authorization: Bearer <access_token>
```

---

## 1. 인증 (Auth)

### 1-1. 회원가입

**POST** `/api/v1/auth/register`

**Request Body**
```json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "password": "password123",
  "age": 72,
  "suspicion_level": 0
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | string | ✅ | 이름 |
| email | string | ✅ | 이메일 |
| password | string | ✅ | 비밀번호 |
| age | integer | ❌ | 나이 |
| suspicion_level | integer | ❌ | 현재 의심 단계 (0=정상, 1=경도, 2=중등도, 3=중증), 기본값 0 |

**Response 201**
```json
{
  "id": 1,
  "name": "홍길동",
  "email": "hong@example.com",
  "age": 72,
  "suspicion_level": 0
}
```

**에러**
| 코드 | 설명 |
|------|------|
| 400 | 이미 사용 중인 이메일 |

---

### 1-2. 로그인

**POST** `/api/v1/auth/login`

> Rate Limit: 분당 5회 초과 시 429 반환

**Request Body**
```json
{
  "email": "hong@example.com",
  "password": "password123"
}
```

**Response 200**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**에러**
| 코드 | 설명 |
|------|------|
| 401 | 이메일 또는 비밀번호 불일치 |
| 403 | 계정 잠금 (5회 실패 시 15분 잠금) |
| 429 | 요청 횟수 초과 (분당 5회 제한) |

---

## 2. 사용자 (User)

### 2-1. 내 프로필 조회

**GET** `/api/v1/users/me`

🔒 인증 필요

**Response 200**
```json
{
  "id": 1,
  "name": "홍길동",
  "email": "hong@example.com",
  "age": 72,
  "suspicion_level": 0
}
```

**에러**
| 코드 | 설명 |
|------|------|
| 401 | 토큰 없음 또는 유효하지 않은 토큰 |

---

## 3. 분석 (Analyze)

### 3-1. 발화 분석

**POST** `/api/v1/analyze/`

🔒 인증 필요

**Request Body**
```json
{
  "transcript": "강아지가 뛰어 놀고 있어요. 저기 나무도 있고 그... 뭐지 꽃도 있어요.",
  "image_id": "nature_01",
  "duration_seconds": 12.5
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| transcript | string | ✅ | STT 변환된 발화 텍스트 (500자 이하) |
| image_id | string | ❌ | 어떤 이미지를 봤는지 |
| duration_seconds | float | ❌ | 녹음 시간 (초) — 발화 속도 계산에 사용 |

**Response 200**
```json
{
  "record_id": 1,
  "result": {
    "total_words": 14,
    "pronoun_ratio": 0.14,
    "speech_rate": 67.2,
    "filler_count": 2,
    "avg_sentence_length": 4.7
  },
  "created_at": "2026-05-24T10:30:00"
}
```

| 지표 | 설명 |
|------|------|
| total_words | 총 낱말 수 |
| pronoun_ratio | 대명사·지시어 비율 (0.0~1.0, 높을수록 인지 저하 의심) |
| speech_rate | 발화 속도 (단어/분, duration_seconds 없으면 0.0) |
| filler_count | 간투사 수 (어, 음, 그, 뭐 등) |
| avg_sentence_length | 문장당 평균 단어 수 |

**에러**
| 코드 | 설명 |
|------|------|
| 400 | 입력 500자 초과 또는 Prompt Injection 감지 |
| 401 | 토큰 없음 또는 유효하지 않은 토큰 |
| 500 | AI 분석 오류 |

---

### 3-2. 분석 기록 목록 조회

**GET** `/api/v1/analyze/history`

🔒 인증 필요

**Query Parameters**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| limit | integer | 10 | 조회 개수 |
| offset | integer | 0 | 시작 위치 |

**Response 200**
```json
[
  {
    "record_id": 3,
    "result": {
      "total_words": 14,
      "pronoun_ratio": 0.14,
      "speech_rate": 67.2,
      "filler_count": 2,
      "avg_sentence_length": 4.7
    },
    "created_at": "2026-05-24T10:30:00"
  },
  {
    "record_id": 2,
    "result": {
      "total_words": 10,
      "pronoun_ratio": 0.30,
      "speech_rate": 55.0,
      "filler_count": 4,
      "avg_sentence_length": 3.3
    },
    "created_at": "2026-05-23T09:15:00"
  }
]
```

**에러**
| 코드 | 설명 |
|------|------|
| 401 | 토큰 없음 또는 유효하지 않은 토큰 |

---

## 4. 공통

### 헬스체크

**GET** `/health`

인증 불필요

**Response 200**
```json
{ "status": "ok" }
```

---

## 구현 현황

| API | 구현 |
|-----|------|
| POST /auth/register | ✅ |
| POST /auth/login | ✅ Rate Limit 포함 |
| GET /users/me | ✅ |
| POST /analyze/ | ✅ JWT 인증 포함 |
| GET /analyze/history | ✅ JWT 인증 포함 |
