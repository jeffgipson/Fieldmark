import { LOGO_STACKED_SRC } from "../constants/brand";

export const HUNTER_LOGOS_BASE = "https://logos.hunter.io";

/** Integration slugs that use a local mark instead of Hunter. */
const LOCAL_INTEGRATION_LOGOS = {
  fieldmark_api: LOGO_STACKED_SRC
};

/**
 * @param {string | null | undefined} domain
 * @returns {string | null}
 */
export function hunterLogoUrl(domain) {
  if (!domain) return null;
  const normalized = String(domain).trim().toLowerCase().replace(/^www\./, "");
  if (!normalized) return null;
  return `${HUNTER_LOGOS_BASE}/${encodeURIComponent(normalized)}`;
}

/**
 * @param {string | null | undefined} website
 * @returns {string | null}
 */
export function logoDomainFromWebsite(website) {
  if (!website) return null;
  try {
    const host = new URL(website).hostname.replace(/^www\./i, "");
    return host || null;
  } catch {
    return null;
  }
}

/**
 * @param {{ logo_url?: string | null, logo_domain?: string | null, website?: string | null }} item
 * @returns {string | null}
 */
export function brandLogoUrl(item) {
  if (!item) return null;
  if (item.logo_url) return item.logo_url;
  if (item.logo_domain) return hunterLogoUrl(item.logo_domain);
  if (item.website) return hunterLogoUrl(logoDomainFromWebsite(item.website));
  return null;
}

/**
 * @param {{ slug?: string, logo_url?: string | null }} integration
 * @returns {string | null}
 */
export function integrationLogoUrl(integration) {
  if (!integration) return null;
  const fromApi = brandLogoUrl(integration);
  if (fromApi) return fromApi;
  return LOCAL_INTEGRATION_LOGOS[integration.slug] || null;
}

/**
 * @param {{ logo_url?: string | null, logo_domain?: string | null, website?: string | null }} vendor
 * @returns {string | null}
 */
export function vendorLogoUrl(vendor) {
  return brandLogoUrl(vendor);
}
