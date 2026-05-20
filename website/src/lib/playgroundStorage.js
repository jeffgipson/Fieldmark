const BASE_KEY = "fieldmark_dev_base_url";
const TOKEN_KEY = "fieldmark_dev_token";

function defaultBaseUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  // Client dev: Vite proxies /api → Rails (same origin, no CORS)
  if (import.meta.env.DEV && typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

export function getBaseUrl() {
  try {
    return localStorage.getItem(BASE_KEY) || defaultBaseUrl();
  } catch {
    return defaultBaseUrl();
  }
}

export function setBaseUrl(url) {
  localStorage.setItem(BASE_KEY, url.replace(/\/$/, ""));
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}
