import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import Card from "../ui/Card";
import { SCENARIO_COPY } from "../../constants/scenarios";
import { scenarioStatus } from "../../utils/scenarioProgress";
import { formatCurrency, formatPerAcre } from "../../utils/format";

function StatusPill({ status }) {
  const styles = {
    needs_calculation: "bg-fm-gold-muted text-fm-charcoal border-fm-gold/40",
    needs_benchmark: "bg-fm-teal-subtle text-fm-teal border-fm-teal/30",
    ready: "bg-fm-success/10 text-fm-success border-fm-success/30"
  };
  const labels = {
    needs_calculation: "Needs margin run",
    needs_benchmark: "Ready to compare costs",
    ready: "Up to date"
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${styles[status] || styles.needs_calculation}`}
    >
      {labels[status] || labels.needs_calculation}
    </span>
  );
}

function MarginStat({ label, value, variant = "base" }) {
  const n = Number(value);
  const negative = !Number.isNaN(n) && n < 0;
  const border = variant === "downside" ? "border-fm-gold/50" : "border-fm-teal/40";
  const icon =
    variant === "downside" ? (
      <TrendingDown className="h-4 w-4 text-fm-gold" aria-hidden />
    ) : (
      <TrendingUp className="h-4 w-4 text-fm-teal" aria-hidden />
    );

  return (
    <div className={`rounded-xl border bg-fm-surface p-4 ${border}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fm-gray-medium">
        {icon}
        {label}
      </div>
      <p
        className={`fm-stat mt-2 text-2xl font-bold ${
          value == null ? "text-fm-gray-medium" : negative ? "text-fm-alert" : "text-fm-ink"
        }`}
      >
        {value != null ? formatPerAcre(value) : "Not calculated"}
      </p>
    </div>
  );
}

export default function ScenarioCard({ scenario, farmAcres }) {
  const status = scenarioStatus(scenario);
  const base = scenario.results?.base_case;
  const down = scenario.results?.downside_case;
  const copy = SCENARIO_COPY.card;
  const acres = base?.total_acres || down?.total_acres || farmAcres;
  const baseMargin = base?.margin_per_acre;
  const downMargin = down?.margin_per_acre;
  const baseTotal = base?.total_margin;
  const downTotal = down?.total_margin;

  const primaryCta =
    status === "needs_calculation" ? copy.needsCalculation.cta : copy.ready.ctaMargins;
  const benchmarkCta =
    status === "needs_benchmark" ? copy.needsBenchmark.cta : copy.ready.ctaBenchmark;

  return (
    <Card className="!p-0 overflow-hidden" hover={false}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-fm-gray-light/80 px-6 py-4">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold text-fm-ink">{scenario.name}</h3>
          {scenario.commodity_price != null && (
            <p className="mt-1 text-sm text-fm-gray-medium">
              Base: ${Number(scenario.commodity_price).toFixed(2)}/bu @ {scenario.yield_assumption}{" "}
              bu/ac · Downside: ${Number(scenario.downside_commodity_price).toFixed(2)}/bu @{" "}
              {scenario.downside_yield} bu/ac
            </p>
          )}
        </div>
        <StatusPill status={status} />
      </div>

      {status === "needs_calculation" && (
        <div className="mx-6 mt-4 flex gap-3 rounded-xl border border-fm-gold/40 bg-fm-gold-muted px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-fm-gold" aria-hidden />
          <div>
            <p className="font-semibold text-fm-ink">{copy.needsCalculation.title}</p>
            <p className="mt-1 text-sm text-fm-charcoal">{copy.needsCalculation.body}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <MarginStat label="Base case margin" value={baseMargin} variant="base" />
        <MarginStat label="Downside margin" value={downMargin} variant="downside" />
      </div>

      {baseTotal != null && downTotal != null && acres ? (
        <p className="border-t border-fm-gray-light/80 px-6 pb-4 text-sm text-fm-charcoal">
          At {acres} acres, base case net is{" "}
          <strong className="text-fm-ink">{formatCurrency(baseTotal)}</strong>; downside net is{" "}
          <strong className={Number(downTotal) < 0 ? "text-fm-alert" : "text-fm-ink"}>
            {formatCurrency(downTotal)}
          </strong>
          .
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-fm-gray-light/80 bg-fm-gray-light/30 px-6 py-4">
        <Link
          to={`/scenarios/${scenario.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-fm-teal px-6 py-3 text-base font-bold text-white shadow-sm hover:bg-fm-teal-hover"
        >
          {primaryCta}
          <ChevronRight className="h-5 w-5" aria-hidden />
        </Link>
        {status !== "needs_calculation" && (
          <Link
            to={`/scenarios/${scenario.id}/benchmark`}
            className="inline-flex items-center gap-2 rounded-xl border border-fm-teal/30 bg-fm-surface px-6 py-3 text-base font-bold text-fm-teal hover:border-fm-teal hover:bg-fm-teal-subtle"
          >
            {benchmarkCta}
          </Link>
        )}
        {status === "ready" && (
          <Link
            to={`/scenarios/${scenario.id}/report`}
            className="inline-flex items-center self-center px-2 py-3 text-sm font-bold text-fm-teal hover:underline"
          >
            {copy.ready.ctaReport} →
          </Link>
        )}
      </div>
    </Card>
  );
}
