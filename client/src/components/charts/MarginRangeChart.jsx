import { formatMarginPercentile, formatPerAcre } from "../../utils/format";
import Card from "../ui/Card";

function RangeRow({ label, user, p25, median, p75, color }) {
  if (median == null && user == null) return null;
  const min = Math.min(p25 ?? median ?? user ?? 0, user ?? 0, median ?? 0) - 20;
  const max = Math.max(p75 ?? median ?? user ?? 0, user ?? 0, median ?? 0) + 20;
  const span = max - min || 1;
  const pct = (v) => `${(((v ?? 0) - min) / span) * 100}%`;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-fm-charcoal">{label}</p>
      <div className="relative h-10 rounded bg-fm-gray-light">
        {p25 != null && p75 != null && (
          <div
            className="absolute top-1/2 h-3 -translate-y-1/2 rounded bg-fm-teal/25"
            style={{ left: pct(p25), width: `calc(${pct(p75)} - ${pct(p25)})` }}
            title={`Peer p25–p75: ${formatPerAcre(p25)} – ${formatPerAcre(p75)}`}
          />
        )}
        {median != null && (
          <div
            className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-fm-gray-medium"
            style={{ left: pct(median) }}
            title={`Peer median ${formatPerAcre(median)}`}
          />
        )}
        {user != null && (
          <div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ left: pct(user), backgroundColor: color }}
            title={`You ${formatPerAcre(user)}`}
          />
        )}
      </div>
      <p className="text-xs text-fm-gray-medium">
        {user != null && <>You {formatPerAcre(user)}</>}
        {median != null && <> · Peer median {formatPerAcre(median)}</>}
        {p25 != null && p75 != null && <> · Peer range {formatPerAcre(p25)}–{formatPerAcre(p75)}</>}
      </p>
    </div>
  );
}

export function MarginRangeChart({ margin }) {
  if (!margin?.available) return null;

  const percentileLabel = formatMarginPercentile(margin.base_margin_peer_percentile);
  const showCoaching =
    margin.base_margin_peer_percentile != null && margin.base_margin_peer_percentile <= 10;

  return (
    <Card className="!p-5">
      <p className="fm-eyebrow">Margin distribution</p>
      <p className="font-display mt-1 text-lg font-semibold text-fm-ink">You vs peer farm margins ($/ac)</p>
      <p className="mt-1 text-xs text-fm-gray-medium">
        Among {margin.cohort_size} anonymized farms in your region
        {percentileLabel && <> · Base case: {percentileLabel}</>}
      </p>
      {showCoaching && (
        <p className="mt-3 rounded-lg border border-fm-teal/20 bg-fm-teal-subtle/30 px-3 py-2 text-sm text-fm-charcoal">
          A low percentile usually means higher costs, conservative yield assumptions, or incomplete
          field data — not a judgment on your operation. Review your highest cost category, rerun your
          downside scenario, and confirm all fields have costs entered.
        </p>
      )}
      <div className="mt-6 space-y-8">
        <RangeRow
          label="Base case"
          user={margin.user_base_margin_per_acre}
          p25={margin.peer_p25_base_margin_per_acre}
          median={margin.peer_median_base_margin_per_acre}
          p75={margin.peer_p75_base_margin_per_acre}
          color="#0d8b8b"
        />
        {margin.user_downside_margin_per_acre != null && (
          <RangeRow
            label="Downside case"
            user={margin.user_downside_margin_per_acre}
            p25={margin.peer_p25_downside_margin_per_acre}
            median={margin.peer_median_downside_margin_per_acre}
            p75={margin.peer_p75_downside_margin_per_acre}
            color="#d4a574"
          />
        )}
      </div>
    </Card>
  );
}
