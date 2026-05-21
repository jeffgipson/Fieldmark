import {
  formatAcres,
  formatCurrency,
  formatMarginPercentile,
  formatPerAcre
} from "../../utils/format";

function MetricCard({ label, value, sub, highlight }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        highlight
          ? "border-fm-teal/40 bg-fm-teal-subtle/30"
          : "border-fm-gray-light/80 bg-fm-cream/40"
      }`}
    >
      <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-fm-gray-medium">{label}</dt>
      <dd
        className={`mt-1 font-display text-xl font-bold ${
          highlight ? "text-fm-teal" : "text-fm-charcoal"
        }`}
      >
        {value ?? "—"}
      </dd>
      {sub && <p className="mt-0.5 text-xs text-fm-gray-medium">{sub}</p>}
    </div>
  );
}

export default function ReportKeyMetrics({ farm, fields, results, peerSummary }) {
  const base = results?.base_case;
  const down = results?.downside_case;
  const sensitivity = results?.sensitivity?.summary;
  const margin = peerSummary?.margin_comparison;

  if (!base) return null;

  const totalAcres = base?.total_acres ?? farm?.total_acres;
  const breakeven = sensitivity?.breakeven_price_at_base_yield;

  return (
    <section aria-label="Key financial metrics">
      <p className="fm-eyebrow">At a glance</p>
      <h2 className="font-display mt-1 text-lg font-semibold text-fm-ink">Key numbers for your lender</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Total acres"
          value={formatAcres(totalAcres)}
          sub={`${fields?.length || 0} field${fields?.length === 1 ? "" : "s"}`}
        />
        <MetricCard
          label="Operating cost"
          value={formatPerAcre(base?.operating_cost_per_acre)}
          sub={base?.total_acres ? `${formatCurrency(base.operating_cost_per_acre * base.total_acres)} total` : null}
        />
        <MetricCard
          label="Base margin"
          value={formatPerAcre(base?.margin_per_acre)}
          sub={base?.total_margin != null ? `${formatCurrency(base.total_margin)} farm total` : null}
          highlight
        />
        <MetricCard
          label="Downside margin"
          value={formatPerAcre(down?.margin_per_acre)}
          sub={
            down?.total_margin != null
              ? `${formatCurrency(down.total_margin)} farm total`
              : null
          }
        />
        {breakeven != null && (
          <MetricCard label="Breakeven price" value={`$${Number(breakeven).toFixed(2)}/bu`} sub="At base yield" />
        )}
        {margin?.available && margin.base_margin_peer_percentile != null && (
          <MetricCard
            label="Peer position"
            value={formatMarginPercentile(margin.base_margin_peer_percentile)}
            sub={`Among ${margin.cohort_size || "—"} regional farms`}
          />
        )}
      </dl>
    </section>
  );
}
