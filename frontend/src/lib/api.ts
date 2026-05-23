// lib/api.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export type ApiError = { detail: string };

/* ──────────────────────────────── 공통 fetch ──────────────────────────────── */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    let detail = "요청에 실패했습니다";
    try {
      const body = (await res.json()) as ApiError;
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    const err = new Error(detail) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ──────────────────────────────── 회원가입 ──────────────────────────────── */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  age?: number;
  suspicion_level?: number;
}

export async function register(payload: RegisterPayload) {
  return apiFetch("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ──────────────────────────────── 로그인 ──────────────────────────────── */
export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(
  payload: LoginPayload
): Promise<{ access_token: string; token_type: string }> {
  return apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ──────────────────────────────── 내 프로필 ──────────────────────────────── */
export async function getMyProfile() {
  return apiFetch("/api/v1/users/me", { headers: authHeaders() });
}

/* ──────────────────────────────── 이메일로 이름 조회 (login/page 호환) ──────────────────────────────── */
export async function getNameByEmail(email: string): Promise<string | null> {
  try {
    const data = await getMyProfile() as { name?: string };
    return data?.name ?? null;
  } catch {
    return null;
  }
}

/* ──────────────────────────────── 발화 분석 ──────────────────────────────── */
export interface AnalyzePayload {
  transcript: string;
  image_id?: string;
  duration_seconds?: number;
}

const INJECTION_KEYWORDS = [
  "프롬프트를 무시", "지시를 잊어", "ignore previous",
  "forget your instructions", "you are now", "너는 이제",
  "시스템 프롬프트", "system prompt", "jailbreak",
  "개인정보를 출력", "모든 데이터를",
];

export async function analyzeTranscript(payload: AnalyzePayload) {
  const lower = payload.transcript.toLowerCase();
  if (INJECTION_KEYWORDS.some((kw) => lower.includes(kw))) {
    throw new Error("분석할 수 없는 내용이 포함되어 있어요. 그림을 보고 다시 설명해주세요.");
  }
  if (payload.transcript.length > 500) {
    throw new Error("입력이 너무 깁니다. 다시 녹음해주세요.");
  }
  return apiFetch("/api/v1/analyze/", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/* ──────────────────────────────── 이미지 ──────────────────────────────── */
export interface ImageResponse {
  image_id: string;
  url: string;
  category: string;
}

export async function getRandomImage(category: string): Promise<ImageResponse> {
  return apiFetch<ImageResponse>(
    `/api/v1/images/random?category=${encodeURIComponent(category)}`,
    { headers: authHeaders() }
  );
}

/* ──────────────────────────────── 분석 기록 조회 ──────────────────────────────── */
export async function getHistory(limit = 10, offset = 0) {
  return apiFetch<any[]>(
    `/api/v1/analyze/history?limit=${limit}&offset=${offset}`,
    { headers: authHeaders() }
  );
}