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
