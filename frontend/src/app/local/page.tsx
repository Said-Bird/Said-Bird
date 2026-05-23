"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HOME_BASE_STYLES, HOME_FONT_IMPORT } from "@/lib/home-theme";

/* ─────────────────── 더미 데이터 ─────────────────── */

type FacilityType = "center" | "nursing" | "hospital";

interface Facility {
  id: number;
  type: FacilityType;
  name: string;
  address: string;
  tel: string;
  hours: string;
  distance: number; // km
  tag?: string;
}

const FACILITIES: Facility[] = [
  // ── 치매안심센터 (5개 구 전부) ──
  {
    id: 1, type: "center",
    name: "대전 중구 치매안심센터",
    address: "중구 중앙로 100 (대흥동, 중구청 제3별관 1층)",
    tel: "042-288-8180",
    hours: "평일 09:00~18:00",
    distance: 1.2,
    tag: "치매안심센터",
  },
  {
    id: 2, type: "center",
    name: "대전 동구 치매안심센터",
    address: "동구 현암로 22 (삼성동)",
    tel: "042-621-6011",
    hours: "평일 09:00~18:00",
    distance: 3.8,
    tag: "치매안심센터",
  },
  {
    id: 3, type: "center",
    name: "대전 서구 치매안심센터",
    address: "서구 만년로 74 (만년동, 서구보건소)",
    tel: "042-288-4470",
    hours: "평일 09:00~18:00",
    distance: 4.5,
    tag: "치매안심센터",
  },
  {
    id: 4, type: "center",
    name: "대전 유성구 치매안심센터",
    address: "유성구 박산로 177 (구암동)",
    tel: "042-611-5018",
    hours: "평일 09:00~18:00",
    distance: 6.1,
    tag: "치매안심센터",
  },
  {
    id: 5, type: "center",
    name: "대전 대덕구 치매안심센터",
    address: "대덕구 동춘당로 187 (법동, 법2동행정복지센터)",
    tel: "042-608-5426",
    hours: "평일 09:00~18:00",
    distance: 7.3,
    tag: "치매안심센터",
  },
  {
    id: 6, type: "center",
    name: "대전광역치매센터",
    address: "중구 문화로 282 충남대학교병원 노인보건의료센터 2층",
    tel: "042-280-8965",
    hours: "평일 09:00~17:00",
    distance: 2.0,
    tag: "광역치매센터",
  },
  // ── 요양시설 ──
  {
    id: 7, type: "nursing",
    name: "실버랜드 노인요양원",
    address: "중구 어남동 59",
    tel: "042-285-7391",
    hours: "24시간",
    distance: 2.9,
    tag: "최우수기관",
  },
  {
    id: 8, type: "nursing",
    name: "대전기독요양원",
    address: "동구 계족로 189 1층 (대동)",
    tel: "042-719-7578",
    hours: "24시간",
    distance: 5.2,
  },
  {
    id: 9, type: "nursing",
    name: "하나요양원",
    address: "동구 은어송로 62",
    tel: "042-628-5000",
    hours: "24시간",
    distance: 5.7,
  },
  {
    id: 10, type: "nursing",
    name: "대전요양원",
    address: "중구 문창동 38-5",
    tel: "042-224-3131",
    hours: "24시간",
    distance: 1.8,
  },
  {
    id: 11, type: "nursing",
    name: "자혜은빛마을 노인요양원",
    address: "서구 오동 175-1",
    tel: "042-586-8883",
    hours: "24시간",
    distance: 6.8,
  },
  {
    id: 12, type: "nursing",
    name: "판암요양원",
    address: "동구 옥천로106번길 115 (판암동)",
    tel: "042-719-8877",
    hours: "24시간",
    distance: 8.1,
  },
  // ── 병원 ──
  {
    id: 13, type: "hospital",
    name: "충남대학교병원",
    address: "중구 문화로 282",
    tel: "042-280-7114",
    hours: "평일 08:30~17:30",
    distance: 2.0,
    tag: "신경과·치매전문",
  },
  {
    id: 14, type: "hospital",
    name: "대전성모병원",
    address: "중구 대흥로 64-6",
    tel: "042-220-9114",
    hours: "평일 08:30~17:30",
    distance: 1.5,
    tag: "신경과",
  },
  {
    id: 15, type: "hospital",
    name: "을지대학교병원",
    address: "서구 둔산서로 95",
    tel: "042-611-3000",
    hours: "평일 08:30~17:30",
    distance: 4.2,
    tag: "신경과",
  },
  {
    id: 16, type: "hospital",
    name: "건양대학교병원",
    address: "서구 관저동로 158",
    tel: "042-600-9999",
    hours: "평일 08:30~17:30",
    distance: 7.6,
    tag: "신경과",
  },
];

interface NewsItem {
  id: number;
  date: string;
  title: string;
  source: string;
  badge: string;
  badgeColor: string;
}

const NEWS: NewsItem[] = [
  {
    id: 1,
    date: "2026.05",
    title: "대전시, 치매안심마을 확대 — 2026년 20개 동 지정",
    source: "대전광역시",
    badge: "정책",
    badgeColor: "#3B82F6",
  },
  {
    id: 2,
    date: "2026.04",
    title: "치매치료관리비 지원 확대 — 월 최대 3만원→6만원",
    source: "보건복지부",
    badge: "복지",
    badgeColor: "#22C55E",
  },
  {
    id: 3,
    date: "2026.04",
    title: "유성구, 치매예방 AI 인지훈련 프로그램 무료 운영",
    source: "대전 유성구청",
    badge: "프로그램",
    badgeColor: "#EA580C",
  },
  {
    id: 4,
    date: "2026.03",
    title: "대전시 치매가족 쉼터 — 서구·중구 추가 개소",
    source: "대전광역시",
    badge: "시설",
    badgeColor: "#8B5CF6",
  },
  {
    id: 5,
    date: "2026.03",
    title: "노인 장기요양보험 인정 기준 완화 — 경증 인지저하도 신청 가능",
    source: "국민건강보험공단",
    badge: "제도",
    badgeColor: "#0EA5E9",
  },
];

/* ─────────────────── 상수 ─────────────────── */

const TYPE_META: Record<FacilityType, { label: string; emoji: string; color: string; bg: string }> = {
  center:  { label: "치매안심센터", emoji: "🏥", color: "#EA580C", bg: "#FFF0E6" },
  nursing: { label: "요양시설",     emoji: "🏠", color: "#8B5CF6", bg: "#F5F3FF" },
  hospital:{ label: "병원",         emoji: "🏨", color: "#0EA5E9", bg: "#F0F9FF" },
};

type TabType = "all" | FacilityType;

/* ─────────────────── 컴포넌트 ─────────────────── */

export default function LocalPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("all");
  const [search, setSearch] = useState("");

  const filtered = FACILITIES
    .filter((f) => tab === "all" || f.type === tab)
    .filter((f) =>
      search.trim() === "" ||
      f.name.includes(search) ||
      f.address.includes(search)
    )
    .sort((a, b) => a.distance - b.distance);

  return (
    <main className="page-root">
      <div className="content-wrapper">

        {/* 헤더 */}
        <header className="page-header">
          <button className="back-btn" onClick={() => router.back()} aria-label="뒤로가기">←</button>
          <div className="logo-area">
            <h1 className="app-name">말해본새</h1>
            <p className="app-sub">지역 정보</p>
          </div>
          <div style={{ width: 48 }} />
        </header>

        {/* 복지 뉴스 */}
        <section className="news-section" aria-label="복지 정책 소식">
          <h3 className="section-label">📢 대전 치매 복지 소식</h3>
          <div className="news-scroll">
            {NEWS.map((n) => (
              <div key={n.id} className="news-card">
                <div className="news-top">
                  <span className="news-badge" style={{ background: n.badgeColor }}>{n.badge}</span>
                  <span className="news-date">{n.date}</span>
                </div>
                <p className="news-title">{n.title}</p>
                <p className="news-source">{n.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 검색 + 탭 묶음 */}
        <div className="search-group">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="시설명 또는 주소로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <div className="tab-row" role="tablist">
            {(["all", "center", "nursing", "hospital"] as TabType[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`tab-btn${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "all" ? "전체" : TYPE_META[t as FacilityType].label}
              </button>
            ))}
          </div>
        </div>

        <section className="facility-list" aria-label="시설 목록">
          {filtered.length === 0 && (
            <div className="empty-box">
              <p>검색 결과가 없어요</p>
            </div>
          )}
          {filtered.map((f) => {
            const meta = TYPE_META[f.type];
            return (
              <div key={f.id} className="facility-card">
                {/* 타입 뱃지 + 거리 */}
                <div className="facility-top">
                  <span className="facility-type-badge" style={{ background: meta.bg, color: meta.color }}>
                    {meta.emoji} {meta.label}
                  </span>
                  {f.tag && (
                    <span className="facility-tag">{f.tag}</span>
                  )}
                  <span className="facility-distance">📍 {f.distance.toFixed(1)} km</span>
                </div>

                {/* 이름 */}
                <h4 className="facility-name">{f.name}</h4>

                {/* 상세 정보 */}
                <div className="facility-info-list">
                  <div className="facility-info-row">
                    <span className="facility-info-icon">📍</span>
                    <span className="facility-info-text">{f.address}</span>
                  </div>
                  <div className="facility-info-row">
                    <span className="facility-info-icon">📞</span>
                    <a href={`tel:${f.tel}`} className="facility-tel">{f.tel}</a>
                  </div>
                  <div className="facility-info-row">
                    <span className="facility-info-icon">🕐</span>
                    <span className="facility-info-text">{f.hours}</span>
                  </div>
                </div>

                {/* 전화 버튼 */}
                <a href={`tel:${f.tel}`} className="btn-call">
                  📞 전화하기
                </a>
              </div>
            );
          })}
        </section>

        {/* 치매 상담 콜센터 고정 배너 */}
        <section className="hotline-banner" aria-label="치매 상담 콜센터">
          <div className="hotline-inner">
            <div>
              <p className="hotline-label">24시간 치매 상담 콜센터</p>
              <p className="hotline-num">☎ 치매상담콜센터 <strong>1899-9988</strong></p>
            </div>
            <a href="tel:18999988" className="btn-hotline">전화</a>
          </div>
        </section>

        <footer className="home-footer">
          <div className="footer-divider" />
          <p>※ 시설 정보는 참고용이며 변경될 수 있습니다.</p>
          <p>방문 전 반드시 전화로 확인해 주세요.</p>
        </footer>
      </div>

      <style>{`
        ${HOME_FONT_IMPORT}
        ${HOME_BASE_STYLES}

        .back-btn {
          background: none; border: none; font-size: 22px;
          cursor: pointer; color: #EA580C;
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; transition: background 0.15s;
        }
        .back-btn:hover { background: #FFF0E6; }

        /* 뉴스 */
        .news-section { margin-bottom: 24px; }
        .section-label {
          font-size: 17px; font-weight: 700; color: #1A1A1A;
          margin-bottom: 12px; letter-spacing: -0.4px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .news-scroll {
          display: flex; gap: 12px;
          overflow-x: auto; padding-bottom: 8px;
          scrollbar-width: none;
        }
        .news-scroll::-webkit-scrollbar { display: none; }
        .news-card {
          flex-shrink: 0; width: 220px;
          background: white; border-radius: 18px;
          padding: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          display: flex; flex-direction: column; gap: 6px;
        }
        .news-top { display: flex; align-items: center; gap: 8px; }
        .news-badge {
          font-size: 11px; font-weight: 700; color: white;
          border-radius: 999px; padding: 3px 10px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .news-date { font-size: 11px; color: #AAAAAA; font-family: 'Noto Sans KR', sans-serif; margin-left: auto; }
        .news-title {
          font-size: 14px; font-weight: 700; color: #1A1A1A;
          font-family: 'Noto Sans KR', sans-serif;
          line-height: 1.5; margin: 0;
        }
        .news-source { font-size: 12px; color: #AAAAAA; font-family: 'Noto Sans KR', sans-serif; margin: 0; }

        /* 검색+탭 묶음 */
        .search-group { margin-bottom: 10px; }

        /* 검색 */
        .search-wrap {
          display: flex; align-items: center; gap: 10px;
          background: white; border-radius: 16px;
          padding: 13px 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          margin-bottom: 14px;
        }
        .search-icon { font-size: 18px; flex-shrink: 0; }
        .search-input {
          flex: 1; border: none; outline: none;
          font-size: 15px; color: #1A1A1A;
          font-family: 'Noto Sans KR', sans-serif;
          background: transparent;
        }
        .search-input::placeholder { color: #CCCCCC; }
        .search-clear {
          background: none; border: none; color: #AAAAAA;
          font-size: 14px; cursor: pointer; padding: 2px 4px;
        }

        /* 탭 */
        .tab-row {
          display: flex; gap: 8px; margin-bottom: 0;
          overflow-x: auto; padding-bottom: 2px;
          scrollbar-width: none;
        }
        .tab-row::-webkit-scrollbar { display: none; }
        .tab-btn {
          flex-shrink: 0;
          padding: 8px 18px;
          border-radius: 999px;
          border: 2px solid #EEEEEE;
          background: white;
          font-size: 14px; font-weight: 600;
          color: #888; cursor: pointer;
          font-family: 'Noto Sans KR', sans-serif;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .tab-btn.active {
          background: #EA580C; border-color: #EA580C; color: white;
        }


        /* 시설 카드 */
        .facility-list { display: flex; flex-direction: column; gap: 14px; margin-top: 12px; margin-bottom: 24px; }
        .facility-card {
          background: white; border-radius: 20px;
          padding: 18px 18px 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .facility-top {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 10px; flex-wrap: wrap;
        }
        .facility-type-badge {
          font-size: 12px; font-weight: 700;
          border-radius: 999px; padding: 4px 12px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .facility-tag {
          font-size: 11px; font-weight: 600;
          background: #FFF9E6; color: #D97706;
          border-radius: 999px; padding: 3px 10px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .facility-distance {
          margin-left: auto;
          font-size: 13px; font-weight: 700; color: #EA580C;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .facility-name {
          font-size: 17px; font-weight: 800; color: #1A1A1A;
          letter-spacing: -0.4px; margin: 0 0 12px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .facility-info-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .facility-info-row { display: flex; align-items: flex-start; gap: 8px; }
        .facility-info-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .facility-info-text {
          font-size: 13px; color: #555;
          font-family: 'Noto Sans KR', sans-serif; line-height: 1.5;
        }
        .facility-tel {
          font-size: 13px; color: #EA580C; font-weight: 600;
          font-family: 'Noto Sans KR', sans-serif;
          text-decoration: none;
        }
        .facility-tel:hover { text-decoration: underline; }

        /* 전화 버튼 */
        .btn-call {
          display: block; width: 100%;
          padding: 12px;
          background: #FFF0E6; color: #EA580C;
          border: 2px solid #F4B88B;
          border-radius: 14px;
          font-size: 14px; font-weight: 700;
          font-family: 'Noto Sans KR', sans-serif;
          text-align: center; text-decoration: none;
          transition: background 0.15s;
          box-sizing: border-box;
        }
        .btn-call:hover { background: #FFE4CC; }

        /* 빈 상태 */
        .empty-box {
          text-align: center; padding: 40px;
          font-size: 15px; color: #AAAAAA;
          font-family: 'Noto Sans KR', sans-serif;
        }

        /* 핫라인 배너 */
        .hotline-banner {
          background: linear-gradient(135deg, #EA580C, #F97316);
          border-radius: 20px; padding: 18px 20px;
          margin-bottom: 28px;
          box-shadow: 0 4px 20px rgba(234,88,12,0.35);
        }
        .hotline-inner { display: flex; align-items: center; gap: 12px; }
        .hotline-label {
          font-size: 12px; color: rgba(255,255,255,0.8);
          font-family: 'Noto Sans KR', sans-serif; margin: 0 0 4px;
        }
        .hotline-num {
          font-size: 16px; color: white; font-weight: 700;
          font-family: 'Noto Sans KR', sans-serif; margin: 0;
        }
        .hotline-num strong { font-size: 20px; }
        .btn-hotline {
          margin-left: auto; flex-shrink: 0;
          background: white; color: #EA580C;
          border-radius: 14px; padding: 10px 20px;
          font-size: 15px; font-weight: 800;
          font-family: 'Noto Sans KR', sans-serif;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .footer-divider { height: 1px; background: #F0EAE3; margin-bottom: 20px; }
        .home-footer { text-align: center; }
        .home-footer p {
          font-size: 13px; color: #BBBBBB; line-height: 1.8;
          font-family: 'Noto Sans KR', sans-serif; margin: 0;
        }
      `}</style>
    </main>
  );
}