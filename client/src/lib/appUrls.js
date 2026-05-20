/** Cross-app URLs in dev / production. See config/local-urls.env.example */

function trim(url) {
  return typeof url === "string" ? url.replace(/\/$/, "") : "";
}

export const APP_URLS = {
  website: trim(import.meta.env.VITE_WEBSITE_URL) || "http://localhost:5174",
  admin: trim(import.meta.env.VITE_ADMIN_URL) || "http://localhost:5175"
};

export function websitePath(path = "") {
  const base = APP_URLS.website;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function adminPath(path = "") {
  const base = APP_URLS.admin;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

/** API docs — always on the dedicated website app (see website/) */
export function developerPath() {
  return websitePath("/developer");
}
