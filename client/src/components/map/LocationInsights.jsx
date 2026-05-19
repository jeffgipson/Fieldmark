import { formatCommodity, formatRegion } from "../../utils/format";

export default function LocationInsights({ insights, loading, error }) {
  if (error) {
    return <p className="mt-3 text-sm text-fm-alert">{error}</p>;
  }

  if (loading) {
    return <p className="mt-3 text-sm text-fm-gray-medium">Looking up location data…</p>;
  }

  if (!insights) return null;

  const rows = [
    insights.county && {
      label: "County",
      value: `${insights.county}${insights.state_code ? `, ${insights.state_code}` : ""}`
    },
    insights.region && { label: "Region", value: formatRegion(insights.region) },
    insights.acres != null && {
      label: "Calculated acres",
      value: `${Number(insights.acres).toLocaleString(undefined, { maximumFractionDigits: 1 })} ac`
    },
    insights.suggested_soil_type && { label: "Typical soil", value: insights.suggested_soil_type },
    insights.suggested_primary_commodity && {
      label: "Suggested crop",
      value: formatCommodity(insights.suggested_primary_commodity)
    }
  ].filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-fm-teal/20 bg-fm-teal-subtle/50 p-4">
      <p className="fm-eyebrow">From this location</p>
      {!insights.in_missouri && (
        <p className="mt-2 text-sm text-fm-gold">
          This point looks outside Missouri — planning tools are tuned for MO farms.
        </p>
      )}
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <InsightRow key={row.label} row={row} />
        ))}
      </dl>
      {insights.display_name && (
        <p className="mt-3 text-xs text-fm-gray-medium line-clamp-2">{insights.display_name}</p>
      )}
    </div>
  );
}

function InsightRow({ row }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-fm-gray-medium">{row.label}</dt>
      <dd className="font-semibold text-fm-charcoal">{row.value}</dd>
    </div>
  );
}
