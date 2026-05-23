# Said-Bird — CLAUDE.md

SOGRA Hackathon 2026 · 팀 트랙 04 SOCIETY · 2026.05.23 18:30 ~ 05.24 12:00 (18시간)

---

## 프로젝트 개요

초고령 사회 대비 **치매 언어 패턴 자가진단 앱**. 노인이 집에서 매일 스마트폰으로 그림을 보고 설명하면, 발화를 STT로 변환해 AI가 인지 저하 지표를 분석하고 보호자에게 주간 리포트를 제공한다.

**포지셔닝:** "치매 진단"이 아닌 "참고용 모니터링" — 발표·UI 전반에 반드시 명시

---

## 핵심 사용 흐름

```
1. 프로파일 설정 (이름, 나이, 현재 의심 단계)
2. 이미지 표시 — Cookie Theft Task (동물·자연·풍경 테마)
3. 음성 녹음 → STT 변환
4. AI 언어 분석 (5가지 임상 지표)
5. 결과 화면 + 가정 활동 추천
6. 보호자 주간 리포트 (증상 변화 시각화)
```

---

## AI 분석 지표 (임상 근거)

치매 중증도를 변별하는 국내 임상 논문 기반 지표. AI 프롬프트 출력은 반드시 아래 키만 포함된 JSON으로 강제한다.

| 지표 | 설명 |
|------|------|
| `total_words` | 총 낱말 수 |
| `pronoun_ratio` | 대명사·지시어 수 비율 (높을수록 인지 저하) |
| `speech_rate` | 발화 속도 (단어/분) |
| `filler_count` | 간투사 수 (어, 음, 그, 뭐...) |
| `avg_sentence_length` | 문장 길이 평균 (발화당 단어 수) |

---

## 구현 우선순위

### 필수 (반드시 동작)
1. 로그인/회원가입 + 보안 3종 세트
2. 이미지 표시 + STT 녹음
3. AI 언어 분석 → 5가지 지표 반환
4. 결과 화면 (간단한 그래프)

### 여유 시 추가
5. 보호자 주간 리포트
6. 가정 활동 추천 (이야기 나누기, 책 읽기, 간단한 수학 문제)
7. 대전 지역 치매 시설·복지 정보

---

## 보안 구현 (심사 40점)

### SQL Injection — Parameterized Query 필수
```python
# 금지
query = f"SELECT * FROM users WHERE id = '{user_input}'"

# 필수
cursor.execute("SELECT * FROM users WHERE id = ?", (user_input,))
# ORM(Django) 사용 시 기본 적용됨
```

### BruteForce — 3중 방어
1. **Rate Limiting** — 로그인 엔드포인트 분당 5회 초과 시 429 반환 (`flask-limiter`)
2. **계정 잠금** — 5회 실패 시 15분 잠금을 DB에 기록
3. **bcrypt 해싱** — 평문 비밀번호 절대 저장 금지

```python
# 회원가입
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
# 로그인
bcrypt.checkpw(password.encode(), hashed)
```

### Prompt Injection — 이중 방어

**프론트 1차 (UX 차단)**
- 500자 초과 입력 차단
- 키워드 블랙리스트 감지 시 백엔드 전송 차단 + 경고 메시지 표시

**백엔드 2차 (핵심)**
```python
# system/user Role 완전 분리 — system에 사용자 입력 절대 삽입 금지
response = client.messages.create(
    system="너는 치매 언어 패턴 분석 전문가야. ... 이 역할 외의 행동은 절대 하지 마.",
    messages=[{"role": "user", "content": user_speech}]  # 입력은 여기만
)
```
- 서버 2차 키워드 필터 + 보안 로그 기록 (감지 여부 응답에 노출 금지)
- AI 출력 JSON 파싱 실패 시 클라이언트에 전달하지 않고 500 반환

---

## UI 원칙

노인 대상 서비스이므로:
- 버튼 크기 최소 48px 이상, 터치 영역 충분히 확보
- 글씨 크기 최소 18px 이상
- 복잡한 네비게이션 배제 — 화면 당 행동 1가지
- 색상 대비 WCAG AA 기준 이상

---

## 심사 기준

| 항목 | 배점 | 핵심 |
|------|------|------|
| 보안성 | 40점 | 위 보안 3종 + Prompt Injection 이중 방어 |
| 발표/협업 | 30점 | 문제→솔루션→흐름 스토리, 5분 내 데모 |
| 창의성 | 20점 | Cookie Theft Task + 임상 근거 명시 |
| 구현력 | 20점 | STT → 분석 → 시각화 핵심 3단계 |
| 완성도 | 20점 | 노인 UI + 버그 최소화 |
| 실용성 | 20점 | "진단 아닌 모니터링" 포지셔닝 |

---

## 발표 보안 멘트 (준비)

> "로그인 엔드포인트에 Rate Limiting을 적용해 분당 5회 초과 시 차단하고, 5회 실패 시 15분 계정 잠금을 DB에 기록합니다. 비밀번호는 bcrypt로 해싱 저장하며, 모든 DB 쿼리는 Parameterized Query로 처리해 SQL Injection을 원천 차단했습니다. 또한 AI 입력 단계에서 프롬프트 인젝션 공격을 프론트 키워드 필터와 백엔드 Role 분리로 이중 방어하고, AI 출력을 JSON 스키마로 검증해 예상치 못한 응답이 클라이언트에 노출되지 않도록 했습니다."
