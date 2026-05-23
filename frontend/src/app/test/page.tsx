"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HOME_BASE_STYLES, HOME_FONT_IMPORT } from "@/lib/home-theme";
import { getMyProfile, getRandomImage } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Phase = "ready" | "recording" | "recorded" | "submitting" | "done";

const DEFAULT_CATEGORIES = ["동물", "자연", "풍경", "요리"];
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export default function TestPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ready");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string>("unknown");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 이미지 로딩
  useEffect(() => {
    async function loadImage() {
      try {
        const profile = await getMyProfile() as { interests?: string[] };
        const interests =
          profile.interests && profile.interests.length > 0
            ? profile.interests
            : DEFAULT_CATEGORIES;
        const category = interests[Math.floor(Math.random() * interests.length)];
        const img = await getRandomImage(category);
        setImageUrl(img.url);
        setImageId(img.image_id);
      } catch {
        const category = DEFAULT_CATEGORIES[Math.floor(Math.random() * DEFAULT_CATEGORIES.length)];
        try {
          const img = await getRandomImage(category);
          setImageUrl(img.url);
          setImageId(img.image_id);
        } catch {
          /* 이미지 없이 진행 */
        }
      }
    }
    loadImage();
  }, []);

  // 타이머
  useEffect(() => {
    if (phase === "recording") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startRecording = async () => {
    setError(null);
    setDuration(0);
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch {
      setError("마이크 권한이 필요해요. 브라우저 설정에서 마이크를 허용해 주세요.");
      return;
    }

    const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"]
      .find((t) => MediaRecorder.isTypeSupported(t)) ?? "";

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.start(200);
    mediaRef.current = recorder;
    setPhase("recording");
  };

  const stopRecording = () => {
    const recorder = mediaRef.current;
    if (!recorder) return;

    recorder.onstop = () => {
      const mimeType = recorder.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(blob));
    };

    recorder.stop();
    recorder.stream.getTracks().forEach((t) => t.stop());
    setPhase("recorded");
  };

  const handleSubmit = async () => {
    const chunks = chunksRef.current;
    if (!chunks.length) {
      setError("녹음된 내용이 없어요. 다시 시도해주세요.");
      return;
    }
    setPhase("submitting");

    const mimeType = mediaRef.current?.mimeType || "audio/webm";
    const blob = new Blob(chunks, { type: mimeType });
    const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "webm";

    const formData = new FormData();
    formData.append("audio", blob, `recording.${ext}`);
    if (imageId) formData.append("image_id", imageId);
    formData.append("duration_seconds", String(duration));

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/v1/analyze/audio`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "분석 중 오류가 발생했어요.");
      }
      router.push("/report");
    } catch (e: any) {
      setError(e?.message ?? "분석 중 오류가 발생했어요. 다시 시도해주세요.");
      setPhase("recorded");
    }
  };

  const reset = () => {
    chunksRef.current = [];
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
    setPhase("ready");
  };

  return (
    <main className="page-root">
      <div className="content-wrapper">
        {/* 헤더 */}
        <header className="page-header">
          <button className="back-btn" onClick={() => router.back()} aria-label="뒤로가기">
            ←
          </button>
          <div className="logo-area">
            <h1 className="app-name">말해본새</h1>
            <p className="app-sub">오늘의 검사</p>
          </div>
          <div style={{ width: 48 }} />
        </header>

        {/* 단계 표시 */}
        <div className="step-indicator">
          <div className={`step-dot ${phase !== "ready" ? "done" : "active"}`} />
          <div className="step-line" />
          <div className={`step-dot ${phase === "recording" ? "active" : phase === "recorded" || phase === "submitting" || phase === "done" ? "done" : ""}`} />
          <div className="step-line" />
          <div className={`step-dot ${phase === "submitting" || phase === "done" ? "active" : ""}`} />
        </div>
        <div className="step-labels">
          <span>그림 보기</span>
          <span>말하기</span>
          <span>분석</span>
        </div>

        {/* 이미지 영역 */}
        <section className="image-section" aria-label="오늘의 그림">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="오늘의 그림"
              className="test-image"
            />
          ) : (
            <div className="image-placeholder">
              <div className="image-placeholder-inner">
                <span className="image-icon">🖼️</span>
                <p className="image-placeholder-text">오늘의 그림</p>
                <p className="image-placeholder-sub">이미지를 불러오는 중이에요</p>
              </div>
            </div>
          )}
        </section>

        {/* 안내 카드 */}
        <section className="guide-card">
          <div className="guide-badge">💬 말해보세요</div>
          <h2 className="guide-title">
            이 그림을 보고<br />
            <span className="guide-highlight">생각나는 것</span>을 자유롭게 말해보세요
          </h2>
          <ul className="guide-tips">
            <li>✅ 무엇이 보이나요?</li>
            <li>✅ 어떤 느낌이 드나요?</li>
            <li>✅ 어떤 이야기가 떠오르나요?</li>
          </ul>
        </section>

        {/* 녹음 영역 */}
        <section className="record-section">
          {/* 타이머 */}
          {phase === "recording" && (
            <div className="timer-display">
              <span className="timer-dot" />
              <span className="timer-text">{formatTime(duration)}</span>
            </div>
          )}

          {/* 녹음 완료 + 재생 */}
          {phase === "recorded" && (
            <div className="transcript-box" aria-live="polite">
              <p className="transcript-label">✅ 녹음 완료</p>
              {audioUrl && (
                <audio controls src={audioUrl} style={{ width: "100%", marginTop: 8 }} />
              )}
            </div>
          )}

          {error && (
            <div className="error-box" role="alert">
              ⚠️ {error}
            </div>
          )}

          {/* 버튼 */}
          <div className="btn-row">
            {phase === "ready" && (
              <button className="btn-record" onClick={startRecording}>
                🎙️ 녹음 시작하기
              </button>
            )}
            {phase === "recording" && (
              <button className="btn-stop" onClick={stopRecording}>
                ⏹ 녹음 멈추기
              </button>
            )}
            {phase === "recorded" && (
              <>
                <button className="btn-secondary" onClick={reset}>
                  다시 녹음
                </button>
                <button className="btn-primary" onClick={handleSubmit}>
                  분석 결과 보기
                </button>
              </>
            )}
            {phase === "submitting" && (
              <button className="btn-primary" disabled>
                <span className="spinner" /> 분석 중...
              </button>
            )}
          </div>
        </section>

        <footer className="home-footer">
          <div className="footer-divider" />
          <p>※ 이 서비스는 의료 진단이 아닌 <strong>참고용 모니터링</strong> 서비스입니다.</p>
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

        /* 단계 표시 */
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin: 8px 0 4px;
        }
        .step-dot {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #E5E5E5;
          transition: background 0.3s;
          flex-shrink: 0;
        }
        .step-dot.active { background: #EA580C; }
        .step-dot.done { background: #FDB07E; }
        .step-line {
          width: 60px; height: 3px;
          background: #E5E5E5;
          flex-shrink: 0;
        }
        .step-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 4px;
          margin-bottom: 20px;
        }
        .step-labels span {
          font-size: 11px;
          color: #AAAAAA;
          font-family: 'Noto Sans KR', sans-serif;
          width: 60px;
          text-align: center;
        }
        .step-labels span:first-child { text-align: left; }
        .step-labels span:last-child { text-align: right; }

        /* 이미지 영역 */
        .image-section { margin-bottom: 20px; }
        .test-image {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: 24px;
          object-fit: cover;
          display: block;
        }
        .image-placeholder {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: 24px;
          background: linear-gradient(135deg, #FFF5EE 0%, #FFECD9 100%);
          border: 2.5px dashed #F4B88B;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .image-placeholder-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .image-icon { font-size: 48px; }
        .image-placeholder-text {
          font-size: 17px;
          font-weight: 700;
          color: #EA580C;
          font-family: 'Noto Sans KR', sans-serif;
          margin: 0;
        }
        .image-placeholder-sub {
          font-size: 13px;
          color: #BBBBBB;
          font-family: 'Noto Sans KR', sans-serif;
          margin: 0;
        }

        /* 안내 카드 */
        .guide-card {
          background: white;
          border-radius: 24px;
          padding: 24px 22px 20px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          margin-bottom: 20px;
        }
        .guide-badge {
          display: inline-block;
          background: #FFF0E6;
          color: #EA580C;
          font-size: 13px;
          font-weight: 600;
          border-radius: 999px;
          padding: 5px 14px;
          margin-bottom: 12px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .guide-title {
          font-size: 22px;
          font-weight: 700;
          color: #1A1A1A;
          line-height: 1.5;
          letter-spacing: -0.5px;
          margin-bottom: 14px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .guide-highlight { color: #EA580C; }
        .guide-tips {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .guide-tips li {
          font-size: 14px;
          color: #555;
          font-family: 'Noto Sans KR', sans-serif;
        }

        /* 녹음 영역 */
        .record-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
        }

        /* 타이머 */
        .timer-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #FFF5EE;
          border-radius: 16px;
          padding: 14px;
        }
        .timer-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #EA580C;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .timer-text {
          font-size: 26px;
          font-weight: 700;
          color: #EA580C;
          font-family: 'Noto Sans KR', sans-serif;
          letter-spacing: 2px;
        }

        /* 트랜스크립트 */
        .transcript-box {
          background: #F9F9F9;
          border-radius: 16px;
          padding: 16px 18px;
          border: 1.5px solid #F0EAE3;
        }
        .transcript-label {
          font-size: 12px;
          font-weight: 600;
          color: #EA580C;
          margin-bottom: 8px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .transcript-text {
          font-size: 15px;
          color: #333;
          line-height: 1.7;
          font-family: 'Noto Sans KR', sans-serif;
          margin: 0;
        }

        /* 에러 */
        .error-box {
          background: #FFF0F0;
          border: 1.5px solid #FFCCCC;
          border-radius: 14px;
          padding: 14px 16px;
          font-size: 14px;
          color: #CC3333;
          font-family: 'Noto Sans KR', sans-serif;
        }

        /* 버튼 */
        .btn-row {
          display: flex;
          gap: 12px;
        }
        .btn-record {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #EA580C, #F97316);
          color: white;
          border: none;
          border-radius: 18px;
          font-size: 18px;
          font-weight: 700;
          font-family: 'Noto Sans KR', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(234, 88, 12, 0.4);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-record:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(234, 88, 12, 0.5);
        }
        .btn-stop {
          width: 100%;
          padding: 18px;
          background: #1A1A1A;
          color: white;
          border: none;
          border-radius: 18px;
          font-size: 18px;
          font-weight: 700;
          font-family: 'Noto Sans KR', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          transition: transform 0.15s;
          animation: blink-border 1.5s infinite;
        }
        @keyframes blink-border {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
          50% { box-shadow: 0 4px 24px rgba(234, 88, 12, 0.4); }
        }
        .btn-stop:hover { transform: translateY(-2px); }
        .btn-secondary {
          flex: 1;
          padding: 16px;
          background: white;
          color: #EA580C;
          border: 2px solid #EA580C;
          border-radius: 18px;
          font-size: 16px;
          font-weight: 700;
          font-family: 'Noto Sans KR', sans-serif;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-secondary:hover { background: #FFF5EE; }
        .btn-primary {
          flex: 1;
          padding: 16px;
          background: linear-gradient(135deg, #EA580C, #F97316);
          color: white;
          border: none;
          border-radius: 18px;
          font-size: 16px;
          font-weight: 700;
          font-family: 'Noto Sans KR', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(234, 88, 12, 0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(234, 88, 12, 0.45);
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* 스피너 */
        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2.5px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

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