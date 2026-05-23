"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserName, isLoggedIn } from "@/lib/auth";
import { HOME_BASE_STYLES, HOME_FONT_IMPORT } from "@/lib/home-theme";

export default function HomePage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUserName(getUserName());
  }, []);

  return (
    <main className="page-root">
      <div className="content-wrapper">
        <header className="page-header">
          <div className="logo-area">
            <h1 className="app-name">말해본새</h1>
            <p className="app-sub">인지 건강 자가 모니터링</p>
          </div>
          {loggedIn ? (
            <p className="user-greeting" aria-live="polite">
              <span>{userName ?? "회원"}</span>님
            </p>
          ) : (
            <Link href="/login" className="header-action">
              로그인하기
            </Link>
          )}
        </header>

        <section className="hero-card" aria-label="오늘의 인지 검사">
          <div className="hero-badge">오늘의 검사</div>
          <h2 className="hero-title">
            오늘 하루도<br />
            <span className="hero-highlight">건강하게</span> 지내셨나요?
          </h2>
          <p className="hero-desc">
            매일 5분, 그림을 보고 이야기해 주세요.<br />
            AI가 인지 건강을 함께 살펴드려요.
          </p>
          <button
            className="btn-primary"
            onClick={() => router.push("/test")}
          >
            오늘의 검사 시작하기
          </button>
        </section>

        <nav aria-label="주요 메뉴">
          <h3 className="section-label">무엇을 도와드릴까요?</h3>
          <div className="menu-grid">
            <button className="menu-card" onClick={() => router.push("/report")}>
              <span className="menu-emoji">📊</span>
              <span className="menu-category">리포트</span>
              <span className="menu-title">검사 리포트</span>
              <span className="menu-desc">증상 변화 확인</span>
            </button>
            <button className="menu-card" onClick={() => router.push("/profile")}>
              <span className="menu-emoji">👤</span>
              <span className="menu-category">정보</span>
              <span className="menu-title">내 정보</span>
              <span className="menu-desc">프로필 관리</span>
            </button>
            <button className="menu-card" onClick={() => router.push("/local")}>
              <span className="menu-emoji">🏥</span>
              <span className="menu-category">지역</span>
              <span className="menu-title">지역 정보</span>
              <span className="menu-desc">치매안심센터</span>
            </button>
          </div>
        </nav>

        <footer className="home-footer">
          <div className="footer-divider" />
          <p>
            ※ 이 서비스는 의료 진단이 아닌{" "}
            <strong>참고용 모니터링</strong> 서비스입니다.
          </p>
          <p>증상이 걱정되시면 가까운 치매안심센터를 방문해 주세요.</p>
        </footer>
      </div>

      <style>{`
        ${HOME_FONT_IMPORT}
        ${HOME_BASE_STYLES}

        .hero-highlight { color: #EA580C; }

        .hero-title {
          font-size: 32px;
          margin-bottom: 14px;
        }

        .hero-desc { margin-bottom: 28px; }

        .section-label {
          font-size: 20px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .menu-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 24px 10px 20px;
          background: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-family: 'Noto Sans KR', sans-serif;
          text-align: center;
          box-shadow: 0 2px 16px rgba(0,0,0,0.1);
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .menu-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 4px 14px rgba(234, 88, 12, 0.28),
            0 10px 32px rgba(234, 88, 12, 0.32);
        }

        .menu-card:active { transform: translateY(-1px); }

        .menu-emoji {
          font-size: 30px;
          line-height: 1;
          margin-bottom: 2px;
        }

        .menu-category {
          font-size: 12px;
          font-weight: 500;
          color: #EA580C;
          background: #FFF0E6;
          border-radius: 999px;
          padding: 3px 10px;
        }

        .menu-title {
          font-size: 17px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.3px;
          margin-top: 2px;
        }

        .menu-desc {
          font-size: 12px;
          color: #AAAAAA;
          font-weight: 400;
        }

        .footer-divider {
          height: 1px;
          background: #F0EAE3;
          margin-bottom: 20px;
        }

        .home-footer { text-align: center; }

        .home-footer p {
          font-size: 13px;
          color: #BBBBBB;
          line-height: 1.8;
        }

        .home-footer strong { color: #EA580C; font-weight: 700; }

        @media (max-width: 380px) {
          .hero-title { font-size: 26px; }
          .menu-title { font-size: 15px; }
        }
      `}</style>
    </main>
  );
}
