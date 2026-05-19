import Card from "../ui/Card";
import { formatCurrency, formatPerAcre } from "../../utils/format";

function YearBar({ row }) {
  const { season_year: seasonYear, margins, downside, operating_cost_per_acre: operating } = row;
  const base = margins?.base?.total_margin;
  const p25 = margins?.p25?.total_margin;
  const p75 = margins?.p75?.total_margin;
  const down = downside?.total_margin;
  const values = [p25, base, p75, down].filter((v) => v != null);
  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pct = (v) => `${(((v ?? 0) - min) / span) * 100}%`;

  return (
    <div>
      <div>
        <p className="font-display font-semibold text-fm-ink">{seasonYear}</p>
        <p className="text-sm text-fm-teal">
          Base {formatCurrency(base)} · {formatPerAcre(margins?.base?.margin_per_acre)}
        </p>
      </div>
      <div className="relative mt-2 h-8 rounded bg-fm-gray-light">
        {p25 != null && p75 != null && (
          <div
            className="absolute top-1/2 h-3 -translate-y-1/2 rounded bg-fm-teal/20"
            style={{ left: pct(p25), width: `calc(${pct(p75)} - ${pct(p25)})` }}
            title={`P25–P75: ${formatCurrency(p25)} – ${formatCurrency(p75)}`}
          />
        )}
        {base != null && (
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-fm-teal shadow"
            style={{ left: pct(base) }}
            title={`Base ${formatCurrency(base)}`}
          />
        )}
        {down != null && (
          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-fm-gold shadow"
            style={{ left: pct(down) }}
            title={`Downside ${formatCurrency(down)}`}
          />
        )}
      </div>
      <p className="mt-1 text-xs text-fm-gray-medium">
        Operating {formatPerAcre(operating)} · Downside net {formatCurrency(down)}
      </p>
    </div>
  );
}

export default function ForecastTimelineChart({ forecast }) {
  if (!forecast?.years?.length) return null;

  return (
    <Card>
      <p className="fm-eyebrow">Multi-year outlook</p>
      <h3 className="font-display mt-1 text-lg font-semibold">Three-year margin forecast</h3>
      <p className="mt-1 text-sm text-fm-gray-medium">
        {forecast.disclaimer}
        {forecast.annual_operating_escalation_pct != null && (
          <> Operating costs roll forward at {forecast.annual_operating_escalation_pct}%/yr (MU trend).</>
        )}
      </p>
      {forecast.feedback?.length > 0 && (
        <p className="mt-3 rounded-lg border border-fm-gold/30 bg-fm-gold/10 px-3 py-2 text-sm text-fm-charcoal">
          {forecast.feedback[0]}
        </p>
      )}
      <div className="mt-6 space-y-6">
        {forecast.years.map((row) => (
          <YearBar key={row.season_year} row={row} />
        ))}
      </div>
      <p className="mt-4 text-xs text-fm-gray-medium">
        Teal dot = base case total farm net. Gold dot = downside. Band = p25–p75 range from price and yield stress.
      </p>
    </Card>
  );
}
