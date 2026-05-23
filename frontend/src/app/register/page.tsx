"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { HOME_BASE_STYLES, HOME_FONT_IMPORT } from "@/lib/home-theme";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  age: number | null;
  suspicion_level: number;
};

const SUSPICION_OPTIONS = [
  { value: 0, label: "정상 (특별한 증상 없음)" },
  { value: 1, label: "경도 인지 저하 의심" },
  { value: 2, label: "중등도 인지 저하 의심" },
  { value: 3, label: "중증 인지 저하 의심" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [suspicionLevel, setSuspicionLevel] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body: Record<string, unknown> = {
      name,
      email,
      password,
      suspicion_level: suspicionLevel,
    };
    if (age.trim()) body.age = Number(age);

    try {
      const user = await apiFetch<UserProfile>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const login = await apiFetch<{ access_token: string }>(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      saveAuth({
        access_token: login.access_token,
        name: user.name,
        email: user.email,
      });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "회원가입에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-root">
      <div className="content-wrapper">
        <Link href="/" className="back-link">
          ← 홈으로
        </Link>

        <header className="page-header">
          <div className="logo-area">
            <h1 className="app-name">말해본새</h1>
            <p className="app-sub">인지 건강 자가 모니터링</p>
          </div>
        </header>

        <section className="hero-card" aria-label="회원가입">
          <div className="hero-badge">회원가입</div>
          <h2 className="hero-title">함께 시작해 볼까요?</h2>
          <p className="hero-desc">
            간단한 정보를 입력하시면
            <br />
            매일 인지 건강을 모니터링할 수 있어요.
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="name">
                이름
              </label>
              <input
                id="name"
                className="form-input"
                type="text"
                autoComplete="name"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                이메일
              </label>
              <input
                id="email"
                className="form-input"
                type="email"
                autoComplete="email"
                placeholder="hong@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                비밀번호
              </label>
              <input
                id="password"
                className="form-input"
                type="password"
                autoComplete="new-password"
                placeholder="8자 이상 입력해 주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="age">
                나이 <span className="optional">(선택)</span>
              </label>
              <input
                id="age"
                className="form-input"
                type="number"
                inputMode="numeric"
                min={1}
                max={120}
                placeholder="72"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="form-group form-group-before-submit">
              <label className="form-label" htmlFor="suspicion">
                현재 의심 단계
              </label>
              <select
                id="suspicion"
                className="form-select"
                value={suspicionLevel}
                onChange={(e) => setSuspicionLevel(Number(e.target.value))}
              >
                {SUSPICION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "가입 중..." : "회원가입하기"}
            </button>
          </form>

          <p className="auth-link-row">
            이미 계정이 있으신가요?{" "}
            <Link href="/login">로그인하기</Link>
          </p>
        </section>
      </div>

      <style>{`
        ${HOME_FONT_IMPORT}
        ${HOME_BASE_STYLES}
        .form-group-before-submit { margin-bottom: 40px; }
        .auth-link-row { margin-top: 80px; }
        .optional {
          font-weight: 400;
          color: #AAAAAA;
          font-size: 13px;
        }
      `}</style>
    </main>
  );
}
