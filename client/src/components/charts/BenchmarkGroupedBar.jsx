import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatPerAcre } from "../../utils/format";
import Card from "../ui/Card";

const ROWS = ["seed", "fertilizer", "chemicals", "labor", "total"];

export function BenchmarkGroupedBar({ categories, cohortAvailable }) {
  if (!categories || Object.keys(categories).length === 0) {
    return null;
  }

  const data = ROWS.filter((key) => categories[key]).map((key) => {
    const row = categories[key];
    const entry = {
      category: key.charAt(0).toUpperCase() + key.slice(1),
      you: Number(row.user_per_acre) || 0,
      mu: Number(row.benchmark_per_acre) || 0
    };
    if (cohortAvailable && row.peer_median_per_acre != null) {
      entry.peers = Number(row.peer_median_per_acre) || 0;
    }
    return entry;
  });

  return (
    <Card className="!p-5">
      <p className="fm-eyebrow">Cost comparison</p>
      <p className="font-display mt-1 text-lg font-semibold text-fm-ink">You vs peers vs benchmark ($/ac)</p>
      <div className="mt-4 w-full min-w-0">
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="category" tick={{ fill: "#9b9b9b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#9b9b9b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip formatter={(v) => formatPerAcre(v)} />
            <Legend />
            <Bar dataKey="you" name="Your farm" fill="#0d8b8b" radius={[4, 4, 0, 0]} />
            {cohortAvailable && <Bar dataKey="peers" name="Peer median" fill="#5caaa8" radius={[4, 4, 0, 0]} />}
            <Bar dataKey="mu" name="Extension" fill="#9b9b9b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
