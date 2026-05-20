import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatPerAcre, formatRegion } from "../../utils/format";

function fieldRiskFlags(profile) {
  if (!profile) return [];
  const flags = [];
  if (profile.flood_events_last_5_years >= 3) {
    flags.push(`${profile.flood_events_last_5_years} floods (5 yr)`);
  }
  if (profile.bottomland) flags.push("Bottomland");
  if (profile.drainage === "poor") flags.push("Poor drainage");
  return flags;
}

export default function ScenarioRiskPanel({
  farm,
  regionalRisk,
  yieldContext,
  summaryFields = [],
  results,
  onApplyNassDownside,
  onApplyDownsideYield
}) {
  const sensitivity = results?.sensitivity;
  const summary = sensitivity?.summary;
  const outliers = results?.field_outliers;
  const downsideNegative =
    results?.downside_case?.margin_per_acre != null && Number(results.downside_case.margin_per_acre) < 0;

  const fieldsWithRisk = summaryFields.filter(
    (f) => f.risk_profile || f.risk_suggestion?.suggested_downside_yield != null
  );
  const fieldsMissingProfile = summaryFields.filter((f) => !f.risk_profile);

  const hasContent =
    regionalRisk?.message ||
    yieldContext?.available ||
    downsideNegative ||
    summary?.worst_margin_per_acre != null ||
    fieldsWithRisk.length > 0 ||
    fieldsMissingProfile.length > 0;

  if (!hasContent) return null;

  return (
    <Card className="border-2 border-fm-gold/40">
      <p className="fm-eyebrow">Before you commit</p>
      <h3 className="font-display mt-1 text-lg font-semibold">Risk & downside</h3>
      <p className="mt-1 text-sm text-fm-gray-medium">
        Independent context and field-specific flags — nothing here changes your numbers until you apply it.
      </p>

      {regionalRisk?.message && (
        <div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-fm-charcoal">
              {formatRegion(farm?.region)} Missouri
            </p>
            {regionalRisk.live && (
              <span className="rounded-full bg-fm-teal/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-fm-teal">
                Live research
                {regionalRisk.researched_at && (
                  <span className="font-normal normal-case text-fm-gray-medium">
                    {" "}
                    · {new Date(regionalRisk.researched_at).toLocaleDateString()}
                  </span>
                )}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-fm-charcoal">{regionalRisk.message}</p>
          {regionalRisk.source && (
            <p className="mt-1 text-xs text-fm-gray-medium">
              {regionalRisk.source_url ? (
                <a href={regionalRisk.source_url} target="_blank" rel="noreferrer" className="text-fm-teal hover:underline">
                  {regionalRisk.source}
                </a>
              ) : (
                regionalRisk.source
              )}
              {regionalRisk.note && <> — {regionalRisk.note}</>}
            </p>
          )}
          {regionalRisk.live && Array.isArray(regionalRisk.citations) && regionalRisk.citations.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              <li className="font-bold uppercase tracking-wide text-fm-gray-medium">Sources</li>
              {regionalRisk.citations.slice(0, 4).map((cite) => (
                <li key={cite.url}>
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fm-teal hover:underline"
                  >
                    {cite.title || cite.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {yieldContext?.available && (
        <div className="mt-4 rounded-lg border border-fm-gray-light bg-fm-gray-light/30 p-3 text-sm">
          <p className="font-semibold text-fm-charcoal">USDA NASS Missouri yield history</p>
          <p className="mt-1 text-fm-charcoal">
            5-yr avg {yieldContext.average_yield} bu/ac · 10th percentile {yieldContext.p10_yield} bu/ac
          </p>
          <p className="mt-1 text-xs text-fm-gray-medium">{yieldContext.note}</p>
          {onApplyNassDownside && yieldContext.suggested_downside_yield != null && (
            <Button type="button" variant="secondary" className="mt-2 !py-1.5 text-xs" onClick={onApplyNassDownside}>
              Use NASS p10 for farm downside yield ({yieldContext.suggested_downside_yield} bu/ac)
            </Button>
          )}
        </div>
      )}

      {results && (
        <ul className="mt-4 space-y-2 text-sm">
          {downsideNegative && (
            <li className="rounded-lg border border-fm-alert/40 bg-fm-alert/10 px-3 py-2 text-fm-charcoal">
              Farm downside case is negative at {formatPerAcre(results.downside_case.margin_per_acre)} — review price
              and yield stress before March commitments.
            </li>
          )}
          {summary?.breakeven_price_at_base_yield != null && (
            <li className="text-fm-charcoal">
              Breakeven near <strong>${summary.breakeven_price_at_base_yield}/bu</strong> at your base yield.
            </li>
          )}
          {summary?.worst_margin_per_acre != null && Number(summary.worst_margin_per_acre) < 0 && (
            <li className="text-fm-charcoal">
              Sensitivity grid shows margins below zero in the downside range (worst{" "}
              {formatPerAcre(summary.worst_margin_per_acre)}).
            </li>
          )}
          {outliers?.base_margin_spread_per_acre >= 50 && outliers?.lowest_base_margin_field_id && (
            <li className="text-fm-charcoal">
              Field margin spread is {formatPerAcre(outliers.base_margin_spread_per_acre)} — lowest field may need a
              different decision than the farm average.
            </li>
          )}
        </ul>
      )}

      {fieldsWithRisk.length > 0 && (
        <div>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-fm-gray-medium">Field risk profiles</p>
          <ul className="mt-2 space-y-3">
            {fieldsWithRisk.map((field) => {
              const flags = fieldRiskFlags(field.risk_profile);
              const sug = field.risk_suggestion;
              return (
                <li
                  key={field.field_id}
                  className="rounded-lg border border-fm-gray-light px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-semibold text-fm-ink">{field.name}</span>
                    {flags.length > 0 && (
                      <span className="ml-2 text-xs text-fm-gold font-bold">{flags.join(" · ")}</span>
                    )}
                  </div>
                  {field.risk_profile?.risk_notes && (
                    <p className="mt-1 text-fm-gray-medium">{field.risk_profile.risk_notes}</p>
                  )}
                  {sug?.rationale && <p className="mt-1 text-fm-charcoal">{sug.rationale}</p>}
                  {sug?.suggested_downside_yield != null && onApplyDownsideYield && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-2 !py-1.5 text-xs"
                      onClick={() => onApplyDownsideYield(sug.suggested_downside_yield, field.name)}
                    >
                      Apply {sug.suggested_downside_yield} bu/ac to farm downside
                    </Button>
                  )}
                  <Link
                    to={`/fields/${field.field_id}/costs`}
                    className="mt-2 inline-block text-xs font-bold text-fm-teal hover:underline"
                  >
                    Edit risk on {field.name} →
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {fieldsMissingProfile.length > 0 && (
        <p className="mt-4 text-sm text-fm-gray-medium">
          {fieldsMissingProfile.length === 1 ? (
            <>
              <Link to={`/fields/${fieldsMissingProfile[0].field_id}/costs`} className="font-bold text-fm-teal hover:underline">
                {fieldsMissingProfile[0].name}
              </Link>{" "}
              has no flood or drainage profile yet.
            </>
          ) : (
            <>
              {fieldsMissingProfile.length} fields have no risk profile — add flood history on each field&apos;s costs
              page for tailored downside suggestions.
            </>
          )}
        </p>
      )}
    </Card>
  );
}
