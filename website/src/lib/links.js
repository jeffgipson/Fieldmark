import { BRAND } from "../constants/brand";

const base = BRAND.appUrl.replace(/\/$/, "");

export function appPath(path = "") {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
