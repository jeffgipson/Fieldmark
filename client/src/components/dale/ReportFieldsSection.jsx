import FieldBoundaryMap from "../map/FieldBoundaryMap";
import { formatAcres, formatCommodity, formatPerAcre } from "../../utils/format";

function mergeFieldRows(fields, byField) {
  const marginsById = Object.fromEntries((byField || []).map((row) => [row.field_id, row]));
  return (fields || []).map((field) => ({
    field,
    margin: marginsById[field.id] || null
  }));
}

function FieldReportCard({ field, margin }) {
  const hasMap = Boolean(field.boundary?.coordinates?.[0]?.length || (field.latitude != null && field.longitude != null));

  return (
    <article className="overflow-hidden rounded-xl border border-fm-gray-light/80 bg-white print:break-inside-avoid">
      {hasMap ? (
        <FieldBoundaryMap
          boundary={field.boundary}
          latitude={field.latitude}
          longitude={field.longitude}
          readOnly
          defaultBasemap="satellite"
          mapClassName="fm-location-map !h-[150px] !rounded-none !border-0"
        />
      ) : (
        <div className="flex h-[150px] items-center justify-center bg-fm-gray-light/30 px-4 text-center text-xs text-fm-gray-medium">
          No boundary on file
        </div>
      )}
      <div className="space-y-2 px-4 py-3">
        <div>
          <h3 className="font-display font-semibold text-fm-charcoal">{field.name}</h3>
          <p className="text-xs text-fm-gray-medium">
            {formatAcres(field.acres)} · {formatCommodity(field.primary_commodity)}
            {field.soil_type ? ` · ${field.soil_type}` : ""}
          </p>
        </div>
        {margin && (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <div>
              <dt className="text-fm-gray-medium">Cost/ac</dt>
              <dd className="font-semibold">{formatPerAcre(margin.operating_cost_per_acre)}</dd>
            </div>
            <div>
              <dt className="text-fm-gray-medium">Base margin</dt>
              <dd className="font-semibold text-fm-teal">
                {formatPerAcre(margin.base_case?.margin_per_acre)}
              </dd>
            </div>
            <div>
              <dt className="text-fm-gray-medium">Downside</dt>
              <dd className="font-semibold">{formatPerAcre(margin.downside_case?.margin_per_acre)}</dd>
            </div>
            <div>
              <dt className="text-fm-gray-medium">Share of margin</dt>
              <dd className="font-semibold">
                {margin.share_of_farm_base_margin != null
                  ? `${margin.share_of_farm_base_margin}%`
                  : "—"}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </article>
  );
}

export default function ReportFieldsSection({ fields, byField }) {
  const rows = mergeFieldRows(fields, byField);
  if (!rows.length) return null;

  return (
    <section aria-label="Field breakdown">
      <p className="fm-eyebrow">Your operation</p>
      <h2 className="font-display mt-1 text-lg font-semibold text-fm-ink">Fields on this farm</h2>
      <p className="mt-1 text-sm text-fm-gray-medium">
        Satellite imagery and per-field margins from your scenario assumptions.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {rows.map(({ field, margin }) => (
          <FieldReportCard key={field.id} field={field} margin={margin} />
        ))}
      </div>

      {byField?.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-fm-gray-light/80">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fm-gray-light bg-fm-cream/50 text-left text-xs uppercase text-fm-gray-medium">
                <th className="px-4 py-2.5 font-bold">Field</th>
                <th className="px-4 py-2.5 font-bold">Acres</th>
                <th className="px-4 py-2.5 font-bold">Crop</th>
                <th className="px-4 py-2.5 font-bold">Cost/ac</th>
                <th className="px-4 py-2.5 font-bold">Base margin</th>
                <th className="px-4 py-2.5 font-bold">Downside</th>
                <th className="px-4 py-2.5 font-bold">Farm share</th>
              </tr>
            </thead>
            <tbody>
              {byField.map((row) => (
                <tr key={row.field_id} className="border-b border-fm-gray-light/60 last:border-0">
                  <td className="px-4 py-2.5 font-medium">{row.field_name}</td>
                  <td className="px-4 py-2.5">{row.acres}</td>
                  <td className="px-4 py-2.5">{formatCommodity(row.primary_commodity)}</td>
                  <td className="px-4 py-2.5">{formatPerAcre(row.operating_cost_per_acre)}</td>
                  <td className="px-4 py-2.5 font-medium text-fm-teal">
                    {formatPerAcre(row.base_case?.margin_per_acre)}
                  </td>
                  <td className="px-4 py-2.5">{formatPerAcre(row.downside_case?.margin_per_acre)}</td>
                  <td className="px-4 py-2.5">{row.share_of_farm_base_margin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
