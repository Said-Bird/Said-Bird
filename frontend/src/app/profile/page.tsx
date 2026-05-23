"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { clearAuth } from "@/lib/auth";
import { HOME_BASE_STYLES, HOME_FONT_IMPORT } from "@/lib/home-theme";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  age: number | null;
  suspicion_level: number;
  interests: string[];
};

const SUSPICION_LABELS = ["정상", "경도 의심", "중등도 의심", "중증 의심"];
const SUSPICION_COLORS = ["#22C55E", "#EAB308", "#F97316", "#EF4444"];
const SUSPICION_BG    = ["#F0FDF4", "#FEFCE8", "#FFF5EE", "#FFF1F1"];

const INTEREST_EMOJI: Record<string, string> = {
  동물: "🐾", 자연: "🌿", 음악: "🎵", 요리: "🍳",
  여행: "✈️", 운동: "🏃", 독서: "📚", 그림: "🎨",
  가족: "👨‍👩‍👧", 영화: "🎬",
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<UserProfile>("/api/v1/users/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
      },
    })
      .then(setProfile)
      .catch((err) => {
        if (err?.status === 401) router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.replace("/");
  }

  const sl = profile?.suspicion_level ?? 0;

  return (
    <main className="page-root">
      <div className="content-wrapper">
        {/* 헤더 */}
        <header className="page-header">
          <button className="back-btn" onClick={() => router.back()} aria-label="뒤로가기">←</button>
          <div className="logo-area">
            <h1 className="app-name">말해본새</h1>
            <p className="app-sub">내 정보</p>
          </div>
          <div style={{ width: 48 }} />
        </header>

        {loading && (
          <div className="loading-box">
            <div className="loading-spinner" />
            <p>정보를 불러오는 중이에요...</p>
          </div>
        )}

        {!loading && profile && (
          <>
            {/* 프로필 카드 */}
            <section className="profile-card" aria-label="기본 정보">
              <div className="avatar">
                {profile.name.charAt(0)}
              </div>
              <div className="profile-name">{profile.name}</div>
              <div className="profile-email">{profile.email}</div>
            </section>

            {/* 기본 정보 */}
            <section className="info-section" aria-label="계정 정보">
              <h3 className="section-label">기본 정보</h3>
              <div className="info-card">
                <div className="info-row">
                  <span className="info-icon">👤</span>
                  <span className="info-key">이름</span>
                  <span className="info-val">{profile.name}</span>
                </div>
                <div className="info-divider" />
                <div className="info-row">
                  <span className="info-icon">📧</span>
                  <span className="info-key">이메일</span>
                  <span className="info-val">{profile.email}</span>
                </div>
                <div className="info-divider" />
                <div className="info-row">
                  <span className="info-icon">🎂</span>
                  <span className="info-key">나이</span>
                  <span className="info-val">
                    {profile.age != null ? `${profile.age}세` : "미입력"}
                  </span>
                </div>
              </div>
            </section>

            {/* 인지 단계 */}
            <section className="info-section" aria-label="인지 단계">
              <h3 className="section-label">현재 의심 단계</h3>
              <div
                className="suspicion-card"
                style={{
                  background: SUSPICION_BG[sl],
                  border: `2px solid ${SUSPICION_COLORS[sl]}33`,
                }}
              >
                <div className="suspicion-row">
                  <span className="suspicion-dot" style={{ background: SUSPICION_COLORS[sl] }} />
                  <span className="suspicion-label" style={{ color: SUSPICION_COLORS[sl] }}>
                    {SUSPICION_LABELS[sl]}
                  </span>
                  <span className="suspicion-level">Lv.{sl}</span>
                </div>
                <div className="suspicion-bar-bg">
                  <div
                    className="suspicion-bar-fill"
                    style={{
                      width: `${(sl / 3) * 100}%`,
                      background: SUSPICION_COLORS[sl],
                    }}
                  />
                </div>
              </div>
            </section>

            {/* 관심사 */}
            <section className="info-section" aria-label="관심사">
              <h3 className="section-label">관심사</h3>
              {profile.interests && profile.interests.length > 0 ? (
                <div className="interest-grid">
                  {profile.interests.map((item) => (
                    <div key={item} className="interest-chip">
                      <span className="chip-emoji">{INTEREST_EMOJI[item] ?? "⭐"}</span>
                      <span className="chip-label">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-interest">
                  <p>선택된 관심사가 없어요</p>
                </div>
              )}
            </section>

            {/* 로그아웃 */}
            <div className="logout-section">
              <button className="btn-logout" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </>
        )}

        <footer className="home-footer">
          <div className="footer-divider" />
          <p>※ 이 서비스는 의료 진단이 아닌 <strong>참고용 모니터링</strong> 서비스입니다.</p>
        </footer>
      </div>

      <style>{`
        ${HOME_FONT_IMPORT}
        ${HOME_BASE_STYLES}

        .back-btn {
          background: none; border: none;
          font-size: 22px; cursor: pointer; color: #EA580C;
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; transition: background 0.15s;
        }
        .back-btn:hover { background: #FFF0E6; }

        /* 로딩 */
        .loading-box {
          display: flex; flex-direction: column;
          align-items: center; gap: 16px;
          padding: 60px 0;
          font-family: 'Noto Sans KR', sans-serif;
          color: #AAAAAA; font-size: 15px;
        }
        .loading-spinner {
          width: 36px; height: 36px;
          border: 3px solid #F0EAE3;
          border-top-color: #EA580C;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* 프로필 카드 */
        .profile-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #EA580C, #F97316);
          border-radius: 28px;
          padding: 32px 24px 28px;
          margin-bottom: 24px;
          box-shadow: 0 6px 24px rgba(234,88,12,0.35);
        }
        .avatar {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          border: 3px solid rgba(255,255,255,0.6);
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; font-weight: 800; color: white;
          font-family: 'Noto Sans KR', sans-serif;
          margin-bottom: 4px;
        }
        .profile-name {
          font-size: 22px; font-weight: 800; color: white;
          font-family: 'Noto Sans KR', sans-serif;
          letter-spacing: -0.5px;
        }
        .profile-email {
          font-size: 14px; color: rgba(255,255,255,0.8);
          font-family: 'Noto Sans KR', sans-serif;
        }

        /* 섹션 */
        .info-section { margin-bottom: 24px; }
        .section-label {
          font-size: 17px; font-weight: 700; color: #1A1A1A;
          margin-bottom: 12px; letter-spacing: -0.4px;
          font-family: 'Noto Sans KR', sans-serif;
        }

        /* 정보 카드 */
        .info-card {
          background: white; border-radius: 20px;
          box-shadow: 0 2px 14px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .info-row {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 18px;
        }
        .info-icon { font-size: 20px; flex-shrink: 0; }
        .info-key {
          font-size: 14px; color: #888; font-weight: 500;
          font-family: 'Noto Sans KR', sans-serif;
          flex: 1;
        }
        .info-val {
          font-size: 15px; color: #1A1A1A; font-weight: 600;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .info-divider { height: 1px; background: #F5F5F5; margin: 0 18px; }

        /* 인지 단계 카드 */
        .suspicion-card {
          border-radius: 20px; padding: 18px 20px;
        }
        .suspicion-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 14px;
        }
        .suspicion-dot {
          width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
        }
        .suspicion-label {
          font-size: 18px; font-weight: 800;
          font-family: 'Noto Sans KR', sans-serif;
          flex: 1;
        }
        .suspicion-level {
          font-size: 13px; font-weight: 600; color: #AAAAAA;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .suspicion-bar-bg {
          height: 8px; background: rgba(0,0,0,0.08);
          border-radius: 999px; overflow: hidden;
        }
        .suspicion-bar-fill {
          height: 100%; border-radius: 999px;
          transition: width 0.6s ease;
          min-width: 8px;
        }

        /* 관심사 */
        .interest-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
        }
        .interest-chip {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          padding: 14px 6px 11px;
          background: #FFF0E6; border: 2px solid #EA580C;
          border-radius: 16px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .chip-emoji { font-size: 24px; line-height: 1; }
        .chip-label { font-size: 12px; color: #EA580C; font-weight: 700; }

        .empty-interest {
          background: #F9F9F9; border-radius: 16px;
          padding: 20px; text-align: center;
          font-size: 14px; color: #AAAAAA;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .empty-interest p { margin: 0; }

        /* 로그아웃 */
        .logout-section { margin-bottom: 28px; }
        .btn-logout {
          width: 100%; padding: 16px;
          background: white; color: #888;
          border: 2px solid #EEEEEE;
          border-radius: 18px;
          font-size: 16px; font-weight: 600;
          font-family: 'Noto Sans KR', sans-serif;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-logout:hover { border-color: #EF4444; color: #EF4444; }

        .footer-divider { height: 1px; background: #F0EAE3; margin-bottom: 20px; }
        .home-footer { text-align: center; }
        .home-footer p {
          font-size: 13px; color: #BBBBBB; line-height: 1.8;
          font-family: 'Noto Sans KR', sans-serif; margin: 0;
        }
        .home-footer strong { color: #EA580C; font-weight: 700; }

        @media (max-width: 380px) {
          .interest-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </main>
  );
}