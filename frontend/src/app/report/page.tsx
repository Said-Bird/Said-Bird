"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HOME_BASE_STYLES, HOME_FONT_IMPORT } from "@/lib/home-theme";
import { getHistory } from "@/lib/api";

interface AnalysisResult {
  total_words: number;
  pronoun_ratio: number;
  speech_rate: number;
  filler_count: number;
  avg_sentence_length: number;
  risk_level: number;
  risk_description: string;
  recommended_activities: string[];
}

interface HistoryRecord {
  record_id: number;
  result: AnalysisResult;
  created_at: string;
}

const RISK_LABELS = ["정상", "주의", "경계", "위험"];
const RISK_COLORS = ["#22C55E", "#EAB308", "#F97316", "#EF4444"];
const RISK_BG = ["#F0FDF4", "#FEFCE8", "#FFF5EE", "#FFF1F1"];
const RISK_EMOJIS = ["😊", "🙂", "😐", "😟"];

// 미니 바 차트 (SVG)
function BarChart({ data, label, color }: { data: number[]; label: string; color: string }) {
  const max = Math.max(...data, 0.001);
  const width = 280;
  const height = 80;
  const barW = Math.min(32, (width / data.length) - 8);
  const gap = (width - barW * data.length) / (data.length + 1);

  return (
    <div className="chart-wrap">
      <p className="chart-label">{label}</p>
      <svg width="100%" viewBox={`0 0 ${width} ${height + 20}`} style={{ overflow: "visible" }}>
        {data.map((v, i) => {
          const barH = (v / max) * height;
          const x = gap + i * (barW + gap);
          const y = height - barH;
          return (
            <g key={i}>
              <rect
                x={x} y={y}
                width={barW} height={barH}
                rx={6}
                fill={i === data.length - 1 ? color : `${color}66`}
              />
              <text
                x={x + barW / 2} y={height + 16}
                textAnchor="middle"
                fontSize="10"
                fill="#AAAAAA"
                fontFamily="Noto Sans KR, sans-serif"
              >
                {i === data.length - 1 ? "오늘" : `-${data.length - 1 - i}일`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// 위험도 추이 라인 차트 (SVG)
function RiskLineChart({ records }: { records: HistoryRecord[] }) {
  const data = [...records].reverse().slice(0, 7);
  if (data.length < 2) return null;

  const width = 280;
  const height = 80;
  const levels = data.map((r) => r.result.risk_level);
  const xs = data.map((_, i) => (i / (data.length - 1)) * width);
  const ys = levels.map((v) => height - (v / 3) * height);

  const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const areaD = `M ${xs[0]} ${ys[0]} ${xs.map((x, i) => `L ${x} ${ys[i]}`).join(" ")} L ${xs[xs.length - 1]} ${height} L ${xs[0]} ${height} Z`;

  return (
    <div className="chart-wrap">
      <p className="chart-label">위험도 추이 (최근 {data.length}회)</p>
      <svg width="100%" viewBox={`0 0 ${width} ${height + 24}`}>
        {/* 가이드 라인 */}
        {[0, 1, 2, 3].map((v) => {
          const y = height - (v / 3) * height;
          return (
            <g key={v}>
              <line x1={0} y1={y} x2={width} y2={y} stroke="#F0EAE3" strokeWidth={1} />
              <text x={width + 4} y={y + 4} fontSize="9" fill={RISK_COLORS[v]} fontFamily="sans-serif">
                {RISK_LABELS[v]}
              </text>
            </g>
          );
        })}
        {/* 영역 */}
        <path d={areaD} fill="#EA580C22" />
        {/* 라인 */}
        <path d={pathD} fill="none" stroke="#EA580C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* 점 */}
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r={i === xs.length - 1 ? 6 : 4}
            fill={i === xs.length - 1 ? "#EA580C" : "white"}
            stroke="#EA580C" strokeWidth={2}
          />
        ))}
        {/* x 라벨 */}
        {data.map((r, i) => (
          <text key={i} x={xs[i]} y={height + 18} textAnchor="middle"
            fontSize="9" fill="#AAAAAA" fontFamily="Noto Sans KR, sans-serif">
            {i === data.length - 1 ? "오늘" : `${data.length - 1 - i}일전`}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHistory(10, 0)
      .then((data) => setRecords(data))
      .catch(() => setError("데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요."))
      .finally(() => setLoading(false));
  }, []);

  const latest = records[0];
  const result = latest?.result;

  // 지표 추출
  const recentN = [...records].reverse().slice(0, 7);
  const wordData = recentN.map((r) => r.result.total_words);
  const speechRateData = recentN.map((r) => r.result.speech_rate);
  const fillerData = recentN.map((r) => r.result.filler_count);

  return (
    <main className="page-root">
      <div className="content-wrapper">
        {/* 헤더 */}
        <header className="page-header">
          <button className="back-btn" onClick={() => router.back()} aria-label="뒤로가기">←</button>
          <div className="logo-area">
            <h1 className="app-name">말해본새</h1>
            <p className="app-sub">검사 리포트</p>
          </div>
          <div style={{ width: 48 }} />
        </header>

        {loading && (
          <div className="loading-box">
            <div className="loading-spinner" />
            <p>리포트를 불러오는 중이에요...</p>
          </div>
        )}

        {error && (
          <div className="error-box" role="alert">⚠️ {error}</div>
        )}

        {!loading && !error && !result && (
          <div className="empty-box">
            <p className="empty-emoji">📋</p>
            <p className="empty-title">아직 검사 기록이 없어요</p>
            <p className="empty-desc">오늘의 검사를 먼저 진행해주세요</p>
            <button className="btn-primary full" onClick={() => router.push("/test")}>
              지금 검사하기
            </button>
          </div>
        )}

        {!loading && result && (
          <>
            {/* 위험도 카드 */}
            <section
              className="risk-card"
              style={{ background: RISK_BG[result.risk_level], border: `2px solid ${RISK_COLORS[result.risk_level]}33` }}
              aria-label="오늘 위험도"
            >
              <div className="risk-header">
                <span className="risk-emoji">{RISK_EMOJIS[result.risk_level]}</span>
                <div>
                  <p className="risk-date">
                    {new Date(latest.created_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} 검사 결과
                  </p>
                  <p className="risk-level-label" style={{ color: RISK_COLORS[result.risk_level] }}>
                    {RISK_LABELS[result.risk_level]} 단계
                  </p>
                </div>
                <div className="risk-badge" style={{ background: RISK_COLORS[result.risk_level] }}>
                  {result.risk_level}
                </div>
              </div>
              <p className="risk-desc">{result.risk_description}</p>
            </section>

            {/* 오늘의 수치 */}
            <section className="metrics-section" aria-label="오늘의 언어 지표">
              <h3 className="section-label">오늘의 언어 지표</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-emoji">📝</span>
                  <span className="metric-value">{result.total_words}<span className="metric-unit">개</span></span>
                  <span className="metric-name">총 낱말 수</span>
                </div>
                <div className="metric-card">
                  <span className="metric-emoji">🔤</span>
                  <span className="metric-value">{(result.pronoun_ratio * 100).toFixed(0)}<span className="metric-unit">%</span></span>
                  <span className="metric-name">대명사 비율</span>
                </div>
                <div className="metric-card">
                  <span className="metric-emoji">⚡</span>
                  <span className="metric-value">{result.speech_rate.toFixed(0)}<span className="metric-unit">단/분</span></span>
                  <span className="metric-name">발화 속도</span>
                </div>
                <div className="metric-card">
                  <span className="metric-emoji">💬</span>
                  <span className="metric-value">{result.filler_count}<span className="metric-unit">회</span></span>
                  <span className="metric-name">간투사 수</span>
                </div>
                <div className="metric-card wide">
                  <span className="metric-emoji">📏</span>
                  <span className="metric-value">{result.avg_sentence_length.toFixed(1)}<span className="metric-unit">단어/문장</span></span>
                  <span className="metric-name">평균 문장 길이</span>
                </div>
              </div>
            </section>

            {/* 위험도 추이 그래프 */}
            {recentN.length >= 2 && (
              <section className="chart-section" aria-label="위험도 추이">
                <h3 className="section-label">위험도 추이</h3>
                <div className="chart-card">
                  <RiskLineChart records={records} />
                </div>
              </section>
            )}

            {/* 지표 추이 그래프 */}
            {recentN.length >= 2 && (
              <section className="chart-section" aria-label="세부 지표 추이">
                <h3 className="section-label">세부 지표 변화</h3>
                <div className="chart-card-grid">
                  <div className="chart-card">
                    <BarChart data={wordData} label="총 낱말 수 (개)" color="#EA580C" />
                  </div>
                  <div className="chart-card">
                    <BarChart data={speechRateData} label="발화 속도 (단어/분)" color="#3B82F6" />
                  </div>
                  <div className="chart-card">
                    <BarChart data={fillerData} label="간투사 수 (회)" color="#EAB308" />
                  </div>
                </div>
              </section>
            )}

            {/* 가정 활동 추천 */}
            <section className="activity-section" aria-label="가정 활동 추천">
              <h3 className="section-label">🏡 오늘의 가정 활동 추천</h3>
              <div className="activity-list">
                {result.recommended_activities.map((act, i) => (
                  <div key={i} className="activity-card">
                    <span className="activity-num">{i + 1}</span>
                    <span className="activity-text">{act}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 과거 기록 */}
            {records.length > 1 && (
              <section className="history-section" aria-label="검사 기록">
                <h3 className="section-label">📅 최근 검사 기록</h3>
                <div className="history-list">
                  {records.slice(1, 5).map((r) => (
                    <div key={r.record_id} className="history-card">
                      <div className="history-date">
                        {new Date(r.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      </div>
                      <div className="history-bar-wrap">
                        <div
                          className="history-bar"
                          style={{
                            width: `${(r.result.risk_level / 3) * 100}%`,
                            background: RISK_COLORS[r.result.risk_level],
                          }}
                        />
                      </div>
                      <span
                        className="history-badge"
                        style={{
                          background: RISK_BG[r.result.risk_level],
                          color: RISK_COLORS[r.result.risk_level],
                        }}
                      >
                        {RISK_LABELS[r.result.risk_level]}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 다시 검사 */}
            <div className="cta-section">
              <button className="btn-primary full" onClick={() => router.push("/test")}>
                🎙️ 다시 검사하기
              </button>
            </div>
          </>
        )}

        <footer className="home-footer">
          <div className="footer-divider" />
          <p>※ 이 서비스는 의료 진단이 아닌 <strong>참고용 모니터링</strong> 서비스입니다.</p>
          <p>증상이 걱정되시면 가까운 치매안심센터를 방문해 주세요.</p>
        </footer>
      </div>

      <style>{`
        ${HOME_FONT_IMPORT}
        ${HOME_BASE_STYLES}

        .back-btn {
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          color: #EA580C;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.15s;
        }
        .back-btn:hover { background: #FFF0E6; }

        /* 로딩 */
        .loading-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 60px 0;
          font-family: 'Noto Sans KR', sans-serif;
          color: #AAAAAA;
          font-size: 15px;
        }
        .loading-spinner {
          width: 36px; height: 36px;
          border: 3px solid #F0EAE3;
          border-top-color: #EA580C;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* 에러 */
        .error-box {
          background: #FFF0F0;
          border: 1.5px solid #FFCCCC;
          border-radius: 14px;
          padding: 14px 16px;
          font-size: 14px;
          color: #CC3333;
          font-family: 'Noto Sans KR', sans-serif;
          margin-bottom: 16px;
        }

        /* 빈 상태 */
        .empty-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 48px 0;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .empty-emoji { font-size: 48px; margin: 0; }
        .empty-title { font-size: 18px; font-weight: 700; color: #1A1A1A; margin: 0; }
        .empty-desc { font-size: 14px; color: #AAAAAA; margin: 0 0 12px; }

        /* 위험도 카드 */
        .risk-card {
          border-radius: 24px;
          padding: 22px 20px;
          margin-bottom: 20px;
        }
        .risk-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
        }
        .risk-emoji { font-size: 40px; flex-shrink: 0; }
        .risk-date {
          font-size: 12px;
          color: #888;
          margin: 0;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .risk-level-label {
          font-size: 22px;
          font-weight: 800;
          margin: 2px 0 0;
          letter-spacing: -0.5px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .risk-badge {
          margin-left: auto;
          width: 44px; height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          font-weight: 800;
          font-family: 'Noto Sans KR', sans-serif;
          flex-shrink: 0;
        }
        .risk-desc {
          font-size: 14px;
          color: #444;
          line-height: 1.7;
          font-family: 'Noto Sans KR', sans-serif;
          margin: 0;
        }

        /* 수치 그리드 */
        .section-label {
          font-size: 18px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 14px;
          letter-spacing: -0.5px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .metrics-section { margin-bottom: 24px; }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .metric-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: white;
          border-radius: 20px;
          padding: 20px 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          text-align: center;
        }
        .metric-card.wide {
          grid-column: 1 / -1;
          flex-direction: row;
          gap: 12px;
          justify-content: center;
        }
        .metric-emoji { font-size: 24px; }
        .metric-value {
          font-size: 26px;
          font-weight: 800;
          color: #EA580C;
          font-family: 'Noto Sans KR', sans-serif;
          letter-spacing: -1px;
        }
        .metric-unit {
          font-size: 13px;
          font-weight: 500;
          color: #AAAAAA;
          margin-left: 2px;
        }
        .metric-name {
          font-size: 12px;
          color: #888;
          font-family: 'Noto Sans KR', sans-serif;
        }

        /* 차트 */
        .chart-section { margin-bottom: 24px; }
        .chart-card {
          background: white;
          border-radius: 20px;
          padding: 20px 18px 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          margin-bottom: 12px;
        }
        .chart-card-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chart-wrap { width: 100%; }
        .chart-label {
          font-size: 13px;
          font-weight: 600;
          color: #555;
          margin-bottom: 10px;
          font-family: 'Noto Sans KR', sans-serif;
        }

        /* 가정 활동 */
        .activity-section { margin-bottom: 24px; }
        .activity-list { display: flex; flex-direction: column; gap: 12px; }
        .activity-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: white;
          border-radius: 18px;
          padding: 18px 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .activity-num {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #EA580C, #F97316);
          color: white;
          font-size: 16px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .activity-text {
          font-size: 15px;
          color: #222;
          font-family: 'Noto Sans KR', sans-serif;
          line-height: 1.5;
        }

        /* 히스토리 */
        .history-section { margin-bottom: 24px; }
        .history-list { display: flex; flex-direction: column; gap: 10px; }
        .history-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.07);
        }
        .history-date {
          font-size: 13px;
          color: #888;
          font-family: 'Noto Sans KR', sans-serif;
          width: 48px;
          flex-shrink: 0;
        }
        .history-bar-wrap {
          flex: 1;
          height: 8px;
          background: #F5F5F5;
          border-radius: 999px;
          overflow: hidden;
        }
        .history-bar {
          height: 100%;
          border-radius: 999px;
          transition: width 0.6s ease;
          min-width: 8px;
        }
        .history-badge {
          font-size: 12px;
          font-weight: 700;
          border-radius: 999px;
          padding: 4px 12px;
          font-family: 'Noto Sans KR', sans-serif;
          flex-shrink: 0;
        }

        /* CTA */
        .cta-section { margin-bottom: 28px; }
        .btn-primary {
          padding: 18px;
          background: linear-gradient(135deg, #EA580C, #F97316);
          color: white;
          border: none;
          border-radius: 18px;
          font-size: 17px;
          font-weight: 700;
          font-family: 'Noto Sans KR', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(234, 88, 12, 0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary.full { width: 100%; }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(234, 88, 12, 0.45);
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
          font-family: 'Noto Sans KR', sans-serif;
          margin: 0;
        }
        .home-footer strong { color: #EA580C; font-weight: 700; }
      `}</style>
    </main>
  );
}