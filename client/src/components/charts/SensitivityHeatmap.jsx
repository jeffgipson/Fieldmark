import Card from "../ui/Card";
import { formatPerAcre } from "../../utils/format";

function cellColor(margin, min, max) {
  if (margin == null || Number.isNaN(margin)) return "bg-fm-gray-light";
  const range = Math.max(Math.abs(max), Math.abs(min), 1);
  const t = (margin - min) / (max - min || 1);
  if (margin < 0) {
    const intensity = Math.min(1, Math.abs(margin) / range);
    return intensity > 0.5 ? "bg-red-200 text-fm-alert" : "bg-red-50 text-fm-charcoal";
  }
  const intensity = Math.min(1, margin / range);
  return intensity > 0.5 ? "bg-teal-100 text-fm-success" : "bg-teal-50 text-fm-charcoal";
}

export function SensitivityHeatmap({ sensitivity }) {
  if (!sensitivity?.grid?.length) {
    return (
      <Card className="!p-5">
        <p className="fm-eyebrow">Sensitivity</p>
        <p className="mt-2 text-fm-gray-medium">Calculate your scenario to see how margin shifts with price and yield.</p>
      </Card>
    );
  }

  const { price_labels: priceLabels, yield_labels: yieldLabels, grid, summary } = sensitivity;
  const margins = grid.flatMap((row) => row.map((c) => c.margin_per_acre));
  const min = Math.min(...margins);
  const max = Math.max(...margins);

  return (
    <Card className="!p-5">
      <p className="fm-eyebrow">Sensitivity</p>
      <p className="font-display mt-1 text-lg font-semibold text-fm-ink">Margin at price × yield ($/ac)</p>
      <p className="mt-1 text-xs text-fm-gray-medium">
        Base: {formatPerAcre(summary?.base_margin_per_acre)} · Worst cell: {formatPerAcre(summary?.worst_margin_per_acre)}
        {summary?.breakeven_price_at_base_yield != null && (
          <> · Breakeven ~${summary.breakeven_price_at_base_yield}/bu at base yield</>
        )}
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-fm-gray-medium">Yield \ Price</th>
              {priceLabels.map((p) => (
                <th key={p} className="p-2 font-medium text-fm-charcoal">
                  ${Number(p).toFixed(2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, yi) => (
              <tr key={yieldLabels[yi]}>
                <td className="p-2 text-left font-medium text-fm-charcoal">{yieldLabels[yi]} bu</td>
                {row.map((cell, xi) => {
                  const margin = cell.margin_per_acre ?? cell["margin_per_acre"];
                  const isBase = cell.is_base ?? cell["is_base"];
                  return (
                    <td
                      key={`${xi}-${yi}`}
                      className={`p-2 font-semibold ${cellColor(margin, min, max)} ${isBase ? "ring-2 ring-fm-teal ring-inset" : ""}`}
                      title={`$${priceLabels[xi]}/bu × ${yieldLabels[yi]} bu`}
                    >
                      {formatPerAcre(margin)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
