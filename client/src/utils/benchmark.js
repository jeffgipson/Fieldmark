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
  },
  not_entered: {
    label: "Not entered",
    badgeClass: "bg-fm-gray-light text-fm-gray-medium",
    barClass: "bg-fm-gray-medium"
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

export function cohortSizeLabel(cohort) {
  if (!cohort?.available || !cohort?.size) return null;
  return `${cohort.size} peer farms`;
}

export function primaryCategoryDiff(row, cohortAvailable) {
  if (!row) return null;

  const user = Number(row.user_per_acre) || 0;
  const peer = Number(row.peer_median_per_acre) || 0;
  const bench = Number(row.benchmark_per_acre) || 0;

  if (cohortAvailable && row.difference_vs_peer_per_acre != null) {
    const peerDiff = row.difference_vs_peer_per_acre;
    if (user === 0 && peer === 0 && bench > 0) {
      const diff = (0 - bench).toFixed(2);
      return {
        diff: Number(diff),
        impact: row.total_farm_dollar_impact_vs_benchmark ?? row.total_farm_dollar_impact,
        flag: "not_entered",
        reference: "Extension"
      };
    }
    return {
      diff: peerDiff,
      impact: row.total_farm_dollar_impact_vs_peer ?? row.total_farm_dollar_impact,
      flag: row.flag_vs_peer ?? row.flag,
      reference: "peer median"
    };
  }
  return {
    diff: row.difference_vs_benchmark_per_acre ?? row.difference_per_acre,
    impact: row.total_farm_dollar_impact_vs_benchmark ?? row.total_farm_dollar_impact,
    flag: row.flag_vs_benchmark ?? row.flag,
    reference: "Extension"
  };
}

export function rowStatus(row, primary) {
  if (!row) return "at_average";
  const user = Number(row.user_per_acre) || 0;
  const bench = Number(row.benchmark_per_acre) || 0;
  if (user === 0 && bench > 0) return "not_entered";
  return primary?.flag || peerStatusFromRow(row);
}

export function peerStatusFromRow(row) {
  return row?.flag_vs_peer ?? row?.flag ?? "at_average";
}

export function benchmarkStatusFromRow(row) {
  return row?.flag_vs_benchmark ?? row?.flag ?? "at_average";
}
