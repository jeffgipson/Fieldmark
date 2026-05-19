import Card from "../ui/Card";
import { formatCommodity, formatPerAcre } from "../../utils/format";

export default function FieldMarginByField({ byField, fieldOutliers }) {
  if (!byField?.length) return null;

  const lowest = byField.find((r) => r.field_id === fieldOutliers?.lowest_base_margin_field_id);
  const spread = fieldOutliers?.base_margin_spread_per_acre;

  return (
    <Card>
      <h3 className="font-display font-semibold">Margin by field</h3>
      <p className="mt-1 text-sm text-fm-gray-medium">
        Each field uses its own operating costs; farm totals above use acre-weighted averages.
      </p>

      {spread != null && spread >= 50 && lowest && (
        <p className="mt-3 rounded-lg border border-fm-gold bg-fm-gold/10 px-3 py-2 text-sm">
          <span className="font-semibold">{lowest.field_name}</span> is your lowest base margin at{" "}
          {formatPerAcre(lowest.base_case?.margin_per_acre)} — spread across fields is{" "}
          {formatPerAcre(spread)}.
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-fm-gray-medium">
              <th className="py-2 pr-2">Field</th>
              <th className="py-2 pr-2">Acres</th>
              <th className="py-2 pr-2">Cost/ac</th>
              <th className="py-2 pr-2">Base margin</th>
              <th className="py-2 pr-2">Downside</th>
              <th className="py-2">Share</th>
            </tr>
          </thead>
          <tbody>
            {byField.map((row) => (
              <tr key={row.field_id} className="border-b border-fm-gray-light/50">
                <td className="py-2 pr-2 font-medium">
                  {row.field_name}
                  <span className="block text-xs font-normal text-fm-gray-medium">
                    {formatCommodity(row.primary_commodity)}
                  </span>
                </td>
                <td className="py-2 pr-2">{row.acres}</td>
                <td className="py-2 pr-2">{formatPerAcre(row.operating_cost_per_acre)}</td>
                <td className="py-2 pr-2">{formatPerAcre(row.base_case?.margin_per_acre)}</td>
                <td className="py-2 pr-2">{formatPerAcre(row.downside_case?.margin_per_acre)}</td>
                <td className="py-2">{row.share_of_farm_base_margin}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-3">
        {byField.map((row) => {
          const share = row.share_of_farm_base_margin || 0;
          return (
            <div key={row.field_id} className="mt-3">
              <div className="flex justify-between text-xs">
                <span className="text-fm-gray-medium">{row.field_name}</span>
                <span className="font-medium">{share}% of base margin</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-fm-gray-light">
                <div
                  className="h-full bg-fm-teal"
                  style={{ width: `${Math.min(100, Math.max(0, share))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
