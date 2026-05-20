/** Local / deployed URLs for cross-app navigation. See config/local-urls.env.example */

function trim(url) {
  return typeof url === "string" ? url.replace(/\/$/, "") : "";
}

export const APP_URLS = {
  api: trim(import.meta.env.VITE_API_URL) || "http://localhost:3000",
  website: trim(import.meta.env.VITE_WEBSITE_URL) || "http://localhost:5174",
  app: trim(import.meta.env.VITE_APP_URL) || "http://localhost:5173",
  admin: trim(import.meta.env.VITE_ADMIN_URL) || "http://localhost:5175"
};

function withPath(base, path = "") {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

/** Farmer app (sign up, sign in, dashboard) */
export function appPath(path = "") {
  const configured = trim(import.meta.env.VITE_APP_URL);
  if (configured) return withPath(configured, path);
  if (typeof window !== "undefined" && !import.meta.env.VITE_WEBSITE_URL) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  return withPath(APP_URLS.app, path);
}

export function websitePath(path = "") {
  const configured = trim(import.meta.env.VITE_WEBSITE_URL);
  if (configured) return withPath(configured, path);
  if (typeof window !== "undefined") {
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return suffix;
  }
  return withPath(APP_URLS.website, path);
}

export function adminPath(path = "") {
  return withPath(APP_URLS.admin, path);
}

/** API docs route — only served by this app (website/) */
export function developerPath() {
  return websitePath("/developer");
}
