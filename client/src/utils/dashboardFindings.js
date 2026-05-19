import { formatPerAcre } from "./format";

export function buildDashboardFindings(scenario) {
  const pc = scenario?.peer_comparison?.summary?.categories;
  if (!pc) return [];
  const items = [];
  const fert = pc.fertilizer;
  if (fert && fert.difference_per_acre > 0) {
    items.push(
      `Fertilizer runs $${Math.abs(fert.difference_per_acre).toFixed(0)}/ac above regional average — about $${Math.abs(fert.total_farm_dollar_impact).toLocaleString()} across the farm.`
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
      "Your scenario is calculated. Review benchmarks and talk to Dale before March commitments."
    );
  }
  return items.slice(0, 3);
}
