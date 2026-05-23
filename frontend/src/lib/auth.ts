const TOKEN_KEY = "access_token";
const NAME_KEY = "user_name";
const EMAIL_KEY = "user_email";
const PROFILES_KEY = "user_profiles";

type ProfileMap = Record<string, string>;

function readProfiles(): ProfileMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) ?? "{}") as ProfileMap;
  } catch {
    return {};
  }
}

function writeProfile(email: string, name: string) {
  const profiles = readProfiles();
  profiles[email] = name;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NAME_KEY);
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function getNameByEmail(email: string): string | undefined {
  return readProfiles()[email];
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function saveAuth(data: {
  access_token: string;
  name?: string;
  email?: string;
}) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.email) localStorage.setItem(EMAIL_KEY, data.email);
  if (data.name && data.email) {
    localStorage.setItem(NAME_KEY, data.name);
    writeProfile(data.email, data.name);
  } else if (data.email) {
    const cached = getNameByEmail(data.email);
    if (cached) localStorage.setItem(NAME_KEY, cached);
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
