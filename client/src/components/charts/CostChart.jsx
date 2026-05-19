import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPerAcre } from "../../utils/format";
import Card from "../ui/Card";

const LABELS = {
  seed: "Seed",
  fertilizer: "Fertilizer",
  chemicals: "Chemicals",
  labor: "Labor",
  machinery: "Machinery",
  drying: "Drying",
  insurance: "Insurance",
  interest: "Interest",
  other: "Other"
};

export function CostChart({ costs }) {
  const entries = costs
    ? Object.entries(costs)
        .filter(([, v]) => Number(v) > 0)
        .map(([key, value]) => ({
          name: LABELS[key] || key.replace(/_/g, " "),
          cost: Number(value)
        }))
        .sort((a, b) => b.cost - a.cost)
    : [];

  if (entries.length === 0) {
    return (
      <Card className="!p-5">
        <p className="fm-eyebrow">Operating costs</p>
        <p className="mt-2 text-fm-gray-medium">Add field costs and run your scenario to see the breakdown.</p>
      </Card>
    );
  }

  return (
    <Card className="!p-5">
      <p className="fm-eyebrow">Operating costs</p>
      <p className="font-display mt-1 text-lg font-semibold text-fm-ink">Cost per acre by category</p>
      <div className="mt-4 w-full min-w-0">
        <ResponsiveContainer width="100%" height={260} minWidth={0}>
          <BarChart data={entries} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fill: "#4a4a4a", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(v) => formatPerAcre(v)} />
            <Bar dataKey="cost" fill="#0d8b8b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
