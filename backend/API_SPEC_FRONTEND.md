# Said-Bird API 명세서 (프론트엔드용)

Base URL: `http://localhost:8000`

---

## 공통

### 인증 헤더
로그인 후 발급받은 토큰을 모든 🔒 API 요청 헤더에 포함

```
Authorization: Bearer <access_token>
```

### 에러 응답 형식
```json
{ "detail": "에러 메시지" }
```

---

## 1. 회원가입

```
POST /api/v1/auth/register
```

**Request**
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
| suspicion_level | integer | ❌ | 0=정상, 1=경도, 2=중등도, 3=중증 / 기본값 0 |

**Response `200`**
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
| 코드 | detail | 처리 |
|------|--------|------|
| 400 | "이미 사용 중인 이메일입니다" | 이메일 중복 안내 |

---

## 2. 로그인

```
POST /api/v1/auth/login
```

> 1분에 5회 초과 요청 시 자동 차단 (429)

**Request**
```json
{
  "email": "hong@example.com",
  "password": "password123"
}
```

**Response `200`**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```
> `access_token` 을 localStorage 또는 상태에 저장해서 이후 요청에 사용

**에러**
| 코드 | detail | 처리 |
|------|--------|------|
| 401 | "이메일 또는 비밀번호가 올바르지 않습니다" | 로그인 실패 안내 |
| 403 | "계정이 잠겼습니다. 15분 후 시도해주세요" | 잠금 안내 |
| 429 | - | 잠시 후 다시 시도 안내 |

---

## 3. 내 프로필 조회 🔒

```
GET /api/v1/users/me
```

**Response `200`**
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
| 코드 | 처리 |
|------|------|
| 401 | 로그인 페이지로 이동 |

---

## 4. 발화 분석 🔒

```
POST /api/v1/analyze/
```

**Request**
```json
{
  "transcript": "강아지가 뛰어 놀고 있어요. 저기 나무도 있고 그... 뭐지 꽃도 있어요.",
  "image_id": "nature_01",
  "duration_seconds": 12.5
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| transcript | string | ✅ | STT 변환된 텍스트 (500자 이하) |
| image_id | string | ❌ | 표시한 이미지 ID |
| duration_seconds | float | ❌ | 녹음 길이(초) — 발화 속도 계산에 사용 |

**Response `200`**
```json
{
  "record_id": 1,
  "result": {
    "total_words": 11,
    "pronoun_ratio": 0.09,
    "speech_rate": 52.8,
    "filler_count": 2,
    "avg_sentence_length": 5.5,
    "risk_level": 1,
    "risk_description": "간투사 사용이 다소 많아 단어 찾기에 약간의 어려움이 보입니다. 이는 진단이 아닌 참고용 정보입니다.",
    "recommended_activities": [
      "가족과 오늘 있었던 일 이야기 나누기",
      "좋아하는 책 소리 내어 읽기",
      "간단한 일기 쓰기"
    ]
  },
  "created_at": "2026-05-24T10:30:00"
}
```

| 응답 필드 | 타입 | 설명 |
|-----------|------|------|
| total_words | integer | 총 낱말 수 |
| pronoun_ratio | float | 대명사·지시어 비율 (0.0~1.0) |
| speech_rate | float | 발화 속도 (단어/분) |
| filler_count | integer | 간투사 수 (어, 음, 그, 뭐 등) |
| avg_sentence_length | float | 문장당 평균 단어 수 |
| risk_level | integer | 위험도 (0=정상, 1=주의, 2=경계, 3=위험) |
| risk_description | string | 위험도 근거 설명 (1~2문장, 참고용임을 명시) |
| recommended_activities | string[] | 위험도에 맞는 가정 활동 추천 2~3가지 |

**risk_level 기준**
| 값 | 단계 | 표시 색상 권장 |
|----|------|----------------|
| 0 | 정상 | 초록 |
| 1 | 주의 | 노랑 |
| 2 | 경계 | 주황 |
| 3 | 위험 | 빨강 |

**에러**
| 코드 | detail | 처리 |
|------|--------|------|
| 400 | "입력이 너무 깁니다" | 다시 녹음 안내 |
| 400 | "분석할 수 없는 내용입니다" | 그림 보고 다시 설명 요청 |
| 401 | - | 로그인 페이지로 이동 |
| 500 | "AI 분석 중 오류가 발생했습니다" | 잠시 후 다시 시도 안내 |

---

## 5. 분석 기록 조회 🔒

```
GET /api/v1/analyze/history?limit=10&offset=0
```

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| limit | integer | 10 | 가져올 개수 |
| offset | integer | 0 | 시작 위치 (페이징) |

**Response `200`**
```json
[
  {
    "record_id": 3,
    "result": {
      "total_words": 11,
      "pronoun_ratio": 0.09,
      "speech_rate": 52.8,
      "filler_count": 2,
      "avg_sentence_length": 5.5,
      "risk_level": 1,
      "risk_description": "간투사 사용이 다소 많아 단어 찾기에 약간의 어려움이 보입니다. 이는 진단이 아닌 참고용 정보입니다.",
      "recommended_activities": ["가족과 오늘 있었던 일 이야기 나누기", "좋아하는 책 소리 내어 읽기"]
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
      "avg_sentence_length": 3.3,
      "risk_level": 2,
      "risk_description": "대명사 사용 비율이 높고 문장이 단순해지는 경향이 있습니다. 이는 진단이 아닌 참고용 정보입니다.",
      "recommended_activities": ["사진 보며 옛날 이야기 나누기", "동요나 민요 따라 부르기"]
    },
    "created_at": "2026-05-23T09:15:00"
  }
]
```

> 최신순 정렬. 주간 리포트 그래프 및 위험도 추이 표시에 활용

**에러**
| 코드 | 처리 |
|------|------|
| 401 | 로그인 페이지로 이동 |

---

## 6. 헬스체크

```
GET /health
```

**Response `200`**
```json
{ "status": "ok" }
```
