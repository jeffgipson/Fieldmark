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

export function MarginChart({ base, down }) {
  const data = [
    { name: "Base case", margin: Number(base?.margin_per_acre) || 0 },
    { name: "Downside", margin: Number(down?.margin_per_acre) || 0 }
  ];

  if (!base && !down) {
    return (
      <Card className="!p-5">
        <p className="fm-eyebrow">Margin comparison</p>
        <p className="mt-2 text-fm-gray-medium">Run your scenario to compare base and downside margins.</p>
      </Card>
    );
  }

  return (
    <Card className="!p-5">
      <p className="fm-eyebrow">Margin comparison</p>
      <p className="font-display mt-1 text-lg font-semibold text-fm-ink">Base vs downside ($/ac)</p>
      <div className="mt-4 w-full min-w-0">
        <ResponsiveContainer width="100%" height={220} minWidth={0}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#9b9b9b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9b9b9b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip formatter={(v) => formatPerAcre(v)} />
            <Bar dataKey="margin" radius={[6, 6, 0, 0]}>
              <Cell fill="#0d8b8b" />
              <Cell fill="#d4a574" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
