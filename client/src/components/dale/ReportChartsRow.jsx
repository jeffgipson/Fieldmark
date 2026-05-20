import { MarginChart } from "../charts/MarginChart";
import { CostChart } from "../charts/CostChart";

export default function ReportChartsRow({ results }) {
  if (!results?.base_case && !results?.weighted_costs_per_acre) return null;

  return (
    <section aria-label="Financial charts">
      <div className="grid gap-4 lg:grid-cols-2">
        <MarginChart base={results.base_case} down={results.downside_case} />
        <CostChart costs={results.weighted_costs_per_acre} />
      </div>
    </section>
  );
}
