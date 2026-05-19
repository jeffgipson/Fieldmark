import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatPerAcre } from "../../utils/format";
import Card from "../ui/Card";

function caseRow(label, data) {
  if (!data) return null;
  return {
    label,
    revenue: Number(data.revenue_per_acre) || 0,
    cost: Number(data.operating_cost_per_acre) || 0,
    margin: Number(data.margin_per_acre) || 0
  };
}

export function MarginWaterfallChart({ base, down }) {
  const rows = [caseRow("Base", base), caseRow("Downside", down)].filter(Boolean);

  if (rows.length === 0) {
    return (
      <Card className="!p-5">
        <p className="fm-eyebrow">Margin breakdown</p>
        <p className="mt-2 text-fm-gray-medium">Calculate your scenario to see revenue, costs, and net margin per acre.</p>
      </Card>
    );
  }

  const chartData = rows.flatMap((row) => [
    { name: `${row.label} rev`, segment: "Revenue", value: row.revenue, fill: "#0d8b8b" },
    { name: `${row.label} cost`, segment: "Operating cost", value: -row.cost, fill: "#d4a574" },
    {
      name: `${row.label} net`,
      segment: "Net margin",
      value: row.margin,
      fill: row.margin >= 0 ? "#2d6a4f" : "#c1121f"
    }
  ]);

  return (
    <Card className="!p-5">
      <p className="fm-eyebrow">Margin breakdown</p>
      <p className="font-display mt-1 text-lg font-semibold text-fm-ink">Revenue → costs → net ($/ac)</p>
      <div className="mt-4 w-full min-w-0">
        <ResponsiveContainer width="100%" height={220} minWidth={0}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#9b9b9b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9b9b9b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(v, _name, props) => [
                formatPerAcre(Math.abs(v)),
                props.payload?.segment || ""
              ]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 grid gap-2 text-sm text-fm-charcoal sm:grid-cols-2">
        {rows.map((row) => (
          <li key={row.label}>
            <span className="font-semibold">{row.label}:</span> {formatPerAcre(row.revenue)} − {formatPerAcre(row.cost)} ={" "}
            <span className={row.margin >= 0 ? "text-fm-success font-bold" : "text-fm-alert font-bold"}>
              {formatPerAcre(row.margin)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
