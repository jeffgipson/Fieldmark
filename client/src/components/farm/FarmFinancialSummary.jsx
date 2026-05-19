import { Link } from "react-router-dom";
import Card from "../ui/Card";
import { formatCurrency, formatAcres, formatPerAcre } from "../../utils/format";

export default function FarmFinancialSummary({ summary, primaryScenarioId }) {
  if (!summary) return null;

  const snap = summary.scenario_snapshot;
  const scenarioLink = primaryScenarioId ? `/scenarios/${primaryScenarioId}` : "/scenarios";

  return (
    <Card className="mb-8">
      <p className="fm-eyebrow">This season · {summary.season_year}</p>
      <h2 className="font-display mt-1 text-xl font-semibold text-fm-ink">Farm financial summary</h2>

      {!summary.acres_reconciled && (
        <p className="mt-3 rounded-lg border border-fm-gold bg-fm-gold/10 px-3 py-2 text-sm text-fm-charcoal">
          Field acres total {formatAcres(summary.mapped_acres)}; profile lists{" "}
          {formatAcres(summary.profile_acres)}. Totals resolve when field acres match your profile — add
          remaining fields or update your farm size.
        </p>
      )}

      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem label="Mapped acres" value={formatAcres(summary.mapped_acres)} />
        <SummaryItem
          label="Operating cost"
          value={formatPerAcre(summary.operating_costs?.total_operating)}
        />
        <SummaryItem
          label="Total operating spend"
          value={formatCurrency(summary.total_operating_dollars)}
        />
        {snap?.base_case && (
          <SummaryItem
            label="Base case net (farm)"
            value={formatCurrency(snap.base_case.total_margin)}
            highlight
          />
        )}
        {snap?.downside_case && (
          <SummaryItem
            label="Downside net (farm)"
            value={formatCurrency(snap.downside_case.total_margin)}
          />
        )}
      </dl>

      {summary.peer_headline && (
        <p className="mt-3 text-sm text-fm-gray-medium">{summary.peer_headline}</p>
      )}

      {summary.regional_risk?.message && (
        <p className="mt-2 text-xs text-fm-gray-medium">{summary.regional_risk.message}</p>
      )}

      <Link to={scenarioLink} className="mt-4 inline-block text-sm font-bold text-fm-teal hover:underline">
        {snap ? "View scenario details →" : "Set up scenario →"}
      </Link>
    </Card>
  );
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-fm-gray-medium">{label}</dt>
      <dd className={highlight ? "font-display text-lg font-bold text-fm-teal" : "text-fm-charcoal"}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
