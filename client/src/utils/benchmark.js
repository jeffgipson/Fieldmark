export const COST_STATUS = {
  below_average: {
    label: "Below Average ✓",
    badgeClass: "bg-[#E8F8EF] text-fm-success",
    barClass: "bg-fm-success"
  },
  at_average: {
    label: "At Average",
    badgeClass: "bg-[#E8F4F4] text-fm-teal",
    barClass: "bg-fm-teal"
  },
  above_average: {
    label: "Above Average ↑",
    badgeClass: "bg-[#FFF8F0] text-fm-gold",
    barClass: "bg-fm-gold"
  },
  significantly_above: {
    label: "High ↑↑",
    badgeClass: "bg-[#FFF5F5] text-fm-alert",
    barClass: "bg-fm-alert"
  }
};

export function statusFromDifference(diffPerAcre, benchmarkPerAcre) {
  const bench = Number(benchmarkPerAcre);
  const diff = Number(diffPerAcre);
  if (!bench) return "at_average";
  const pct = (diff / bench) * 100;
  if (pct <= -5) return "below_average";
  if (Math.abs(pct) <= 5) return "at_average";
  if (pct <= 15) return "above_average";
  return "significantly_above";
}

export function diffLabel(diff) {
  const n = Number(diff);
  if (Number.isNaN(n) || n === 0) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}
