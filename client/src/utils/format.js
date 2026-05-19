export function formatCurrency(value, { decimals = 0 } = {}) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(n);
}

export function formatPerAcre(value) {
  return `${formatCurrency(value, { decimals: 2 })}/ac`;
}

export function formatNumber(value, decimals = 0) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/** Whole numbers without trailing .0 — e.g. 1,240 not 1240.0 */
export function formatInteger(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}

/** Acres with smart decimal — e.g. 65 ac, 65.2 ac, 1,240 ac */
export function formatAcres(value, { suffix = true } = {}) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  const rounded = Math.round(n * 10) / 10;
  const formatted =
    rounded % 1 === 0
      ? Math.round(rounded).toLocaleString("en-US")
      : rounded.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return suffix ? `${formatted} ac` : formatted;
}

export function formatCategory(key) {
  if (!key) return "";
  const labels = {
    seed: "Seed",
    fertilizer: "Fertilizer",
    chemicals: "Chemicals",
    labor: "Labor",
    total: "Total"
  };
  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

/** Mapped field acres vs farm profile acres */
export function acreageReconciliation(fields, profileAcres) {
  const mapped = (fields || []).reduce((sum, f) => sum + Number(f.acres || 0), 0);
  const profile = Number(profileAcres) || 0;
  const delta = Math.round((mapped - profile) * 100) / 100;
  return {
    mappedAcres: mapped,
    profileAcres: profile,
    reconciled: profile > 0 ? Math.abs(delta) < 0.01 : mapped === 0
  };
}

export function formatRegion(region) {
  const labels = {
    northern: "Northern",
    central: "Central",
    southwest: "Southwest"
  };
  return labels[region] || region;
}

export function formatCommodity(commodity) {
  const labels = {
    corn: "Corn",
    soybean: "Soybean",
    both: "Corn + Soybean"
  };
  return labels[commodity] || commodity;
}

export function daysUntilMarch1() {
  const now = new Date();
  const march = new Date(now.getFullYear(), 2, 1);
  if (now > march) march.setFullYear(march.getFullYear() + 1);
  return Math.ceil((march - now) / (1000 * 60 * 60 * 24));
}

/** Friendlier margin percentile copy — avoids bare "0th percentile" */
export function formatMarginPercentile(percentile) {
  if (percentile == null || Number.isNaN(Number(percentile))) return null;
  const rounded = Math.round(Number(percentile));
  if (rounded <= 10) {
    return `Lower than ${100 - rounded}% of peer farms`;
  }
  if (rounded >= 90) {
    return `Higher than ${rounded}% of peer farms`;
  }
  return `${rounded}th percentile among peers`;
}
