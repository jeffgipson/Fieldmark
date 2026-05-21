import { formatPerAcre } from "./format";
import { primaryCategoryDiff } from "./benchmark";

export function buildDashboardFindings(scenario) {
  const summary = scenario?.peer_comparison?.summary;
  const pc = summary?.categories;
  const cohortAvailable = summary?.cohort?.available;
  const cohortSize = summary?.cohort?.size;
  if (!pc) return [];
  const items = [];

  const margin = summary?.margin_comparison;
  if (margin?.available && margin.user_base_margin_per_acre != null && cohortAvailable) {
    items.push(
      `Among ${cohortSize} farms like yours, base margin ${formatPerAcre(margin.user_base_margin_per_acre)} vs typical ${formatPerAcre(margin.peer_median_base_margin_per_acre)} (${Math.round(margin.base_margin_peer_percentile || 0)}th percentile).`
    );
  }

  const fert = pc.fertilizer;
  const fertDiff = primaryCategoryDiff(fert, cohortAvailable);
  if (fertDiff && fertDiff.diff > 0) {
    items.push(
      `Fertilizer runs $${Math.abs(fertDiff.diff).toFixed(0)}/ac above the ${fertDiff.reference} — about $${Math.abs(fertDiff.impact || 0).toLocaleString()} across the farm.`
    );
  }

  const base = scenario?.results?.base_case;
  const down = scenario?.results?.downside_case;
  if (down?.margin_per_acre != null && base?.margin_per_acre != null) {
    items.push(
      `Downside scenario leaves ${formatPerAcre(down.margin_per_acre)} margin vs ${formatPerAcre(base.margin_per_acre)} base case — worth validating before March.`
    );
  }
  if (items.length === 0 && scenario?.results) {
    items.push(
      "Your scenario is calculated. Review your cost comparison and talk to Dale before March commitments."
    );
  }
  return items.slice(0, 3);
}
