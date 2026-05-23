"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getNameByEmail, saveAuth } from "@/lib/auth";
import { HOME_BASE_STYLES, HOME_FONT_IMPORT } from "@/lib/home-theme";

type TokenResponse = {
  access_token: string;
  token_type: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch<TokenResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      saveAuth({
        access_token: data.access_token,
        email,
        name: getNameByEmail(email),
      });
      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "로그인에 실패했습니다";
      const status = (err as Error & { status?: number }).status;
      if (status === 429) {
        setError("요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
      } else {
        setError(message);
      }
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

        <section className="hero-card" aria-label="로그인">
          <div className="hero-badge">로그인</div>
          <h2 className="hero-title">다시 만나서 반가워요</h2>
          <p className="hero-desc">이메일과 비밀번호를 입력해 주세요.</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

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
                autoComplete="current-password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인하기"}
            </button>
          </form>

          <p className="auth-link-row">
            아직 계정이 없으신가요?{" "}
            <Link href="/register">회원가입하기</Link>
          </p>
        </section>
      </div>

      <style>{`
        ${HOME_FONT_IMPORT}
        ${HOME_BASE_STYLES}
        .auth-link-row { margin-top: 80px; }
      `}</style>
    </main>
  );
}
