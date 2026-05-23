export const HOME_FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap');";

export const HOME_BASE_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .page-root {
    font-family: 'Noto Sans KR', sans-serif;
    min-height: 100vh;
    background: #FFFAF6;
  }

  .content-wrapper {
    max-width: 480px;
    margin: 0 auto;
    padding: 32px 24px 56px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .logo-area { flex: 1; min-width: 0; }

  .app-name {
    font-size: 26px;
    font-weight: 900;
    color: #1A1A1A;
    letter-spacing: -0.8px;
    line-height: 1;
  }

  .app-sub {
    font-size: 13px;
    color: #AAAAAA;
    font-weight: 400;
    margin-top: 5px;
  }

  .header-action {
    flex-shrink: 0;
    font-size: 15px;
    font-weight: 600;
    color: #EA580C;
    background: #FFF0E6;
    border: none;
    border-radius: 999px;
    padding: 10px 16px;
    cursor: pointer;
    font-family: 'Noto Sans KR', sans-serif;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.15s;
  }

  .header-action:hover { background: #FFE4D0; }

  .user-greeting {
    flex-shrink: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1A1A1A;
    white-space: nowrap;
  }

  .user-greeting span { color: #EA580C; }

  .hero-card {
    background: white;
    border-radius: 24px;
    padding: 32px 28px 28px;
    box-shadow: 0 4px 32px rgba(234,88,12,0.14), 0 2px 8px rgba(0,0,0,0.07);
    display: flex;
    flex-direction: column;
  }

  .hero-badge {
    display: inline-block;
    background: #FFF0E6;
    color: #EA580C;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 999px;
    margin-bottom: 20px;
    width: fit-content;
  }

  .hero-title {
    font-size: 28px;
    font-weight: 800;
    color: #1A1A1A;
    line-height: 1.35;
    margin-bottom: 10px;
    letter-spacing: -0.8px;
  }

  .hero-desc {
    font-size: 17px;
    color: #AAAAAA;
    line-height: 1.7;
    margin-bottom: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 18px;
  }

  .form-label {
    font-size: 15px;
    font-weight: 600;
    color: #1A1A1A;
  }

  .form-input,
  .form-select {
    width: 100%;
    padding: 16px 18px;
    font-size: 18px;
    font-family: 'Noto Sans KR', sans-serif;
    border: 2px solid #F0EAE3;
    border-radius: 14px;
    background: #FFFAF6;
    color: #1A1A1A;
    outline: none;
    transition: border-color 0.15s;
  }

  .form-input:focus,
  .form-select:focus {
    border-color: #F97316;
    background: white;
  }

  .form-input::placeholder { color: #CCCCCC; }

  .form-error {
    font-size: 15px;
    color: #DC2626;
    background: #FEF2F2;
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .btn-primary {
    width: 100%;
    padding: 22px;
    background: #F97316;
    color: white;
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 20px;
    font-weight: 700;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    letter-spacing: -0.3px;
    box-shadow: 0 8px 24px rgba(249,115,22,0.32);
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    background: #FB923C;
    box-shadow: 0 12px 32px rgba(249,115,22,0.4);
  }

  .btn-primary:active:not(:disabled) { transform: translateY(0); }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .auth-link-row {
    text-align: center;
    font-size: 16px;
    color: #AAAAAA;
    margin-top: 8px;
  }

  .auth-link-row a {
    color: #EA580C;
    font-weight: 700;
    text-decoration: none;
  }

  .auth-link-row a:hover { text-decoration: underline; }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 15px;
    color: #AAAAAA;
    text-decoration: none;
    margin-bottom: 4px;
  }

  .back-link:hover { color: #EA580C; }

  @media (max-width: 380px) {
    .btn-primary { font-size: 18px; padding: 20px; }
    .hero-title { font-size: 24px; }
    .user-greeting, .header-action { font-size: 14px; }
  }
`;
