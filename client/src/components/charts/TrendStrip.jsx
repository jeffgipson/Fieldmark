import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCategory, formatPerAcre } from "../../utils/format";
import Card from "../ui/Card";

export function TrendStrip({ trends }) {
  if (!trends?.years?.length) return null;

  const muData = trends.years.map((y) => ({
    year: String(y.season_year),
    mu: y.mu_total_operating_per_acre,
    you: y.user_total_operating_per_acre
  }));

  const userYearsWithData = muData.filter((d) => d.you != null).length;
  const categoryRows = trends.category_yoy?.slice(0, 4) || [];
  const muChanges = categoryRows.map((r) => r.mu_pct_change).filter((v) => v != null);
  const allMuSame =
    muChanges.length > 1 && muChanges.every((v) => v === muChanges[0]);

  return (
    <Card className="!p-5">
      <p className="fm-eyebrow">Cost trends</p>
      <p className="font-display mt-1 text-lg font-semibold text-fm-ink">Total operating cost over time ($/ac)</p>
      {trends.yoy_mu_total_operating_pct != null && (
        <p className="mt-1 text-sm text-fm-charcoal">
          Extension total operating: {trends.yoy_mu_total_operating_pct > 0 ? "+" : ""}
          {trends.yoy_mu_total_operating_pct}% vs prior year ({trends.source})
        </p>
      )}
      <div className="mt-4 w-full min-w-0">
        <ResponsiveContainer width="100%" height={200} minWidth={0}>
          <LineChart data={muData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fill: "#9b9b9b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#9b9b9b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip formatter={(v) => formatPerAcre(v)} />
            <Line
              type="monotone"
              dataKey="mu"
              name="Extension"
              stroke="#9b9b9b"
              strokeWidth={2}
              dot
              connectNulls
            />
            {muData.some((d) => d.you != null) && (
              <Line
                type="monotone"
                dataKey="you"
                name="Your farm"
                stroke="#0d8b8b"
                strokeWidth={2}
                dot={{ r: 5 }}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {userYearsWithData === 1 && (
        <p className="mt-2 text-xs text-fm-gray-medium">
          Your farm: {muData.find((d) => d.you != null)?.year} only — prior years not entered.
        </p>
      )}
      {categoryRows.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-fm-gray-medium">
          {allMuSame ? (
            <li>
              Extension budgets rose ~{muChanges[0] > 0 ? "+" : ""}
              {muChanges[0]}% overall across input categories ({trends.source})
            </li>
          ) : (
            categoryRows.map((row) => (
              <li key={row.category}>
                {formatCategory(row.category)}: Benchmark {row.mu_pct_change > 0 ? "+" : ""}
                {row.mu_pct_change}% YoY
                {row.user_pct_change != null && (
                  <> · You {row.user_pct_change > 0 ? "+" : ""}{row.user_pct_change}%</>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </Card>
  );
}
