import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "../../utils/format";
import Card from "../ui/Card";
import { Label } from "../ui/Input";

const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

export function CashTimelineChart({
  totalAcres = 0,
  operatingCostPerAcre = 0,
  revenuePerAcre = 0,
  carryRatePercent = 6,
  monthsCarry = 8,
  onCarryRateChange
}) {
  const acres = Number(totalAcres) || 0;
  const commitment = operatingCostPerAcre * acres;
  const revenue = revenuePerAcre * acres;
  const carryCost = commitment * (Number(carryRatePercent) / 100) * (monthsCarry / 12);

  const data = MONTHS.map((month) => {
    if (month === "Mar") {
      return { month, commitment: -commitment, carry: 0, revenue: 0 };
    }
    if (month === "Nov") {
      return { month, commitment: 0, carry: 0, revenue };
    }
    if (month === "Oct") {
      return { month, commitment: 0, carry: -carryCost, revenue: 0 };
    }
    return { month, commitment: 0, carry: 0, revenue: 0 };
  });

  if (acres <= 0 || commitment <= 0) {
    return (
      <Card className="!p-5">
        <p className="fm-eyebrow">Cash timing</p>
        <p className="mt-2 text-fm-gray-medium">Calculate your scenario to see March commitments vs November revenue.</p>
      </Card>
    );
  }

  return (
    <Card className="!p-5">
      <p className="fm-eyebrow">Cash timing</p>
      <p className="font-display mt-1 text-lg font-semibold text-fm-ink">March commitment → November revenue</p>
      <p className="mt-1 text-sm text-fm-gray-medium">
        Revenue arrives ~{monthsCarry} months after March input commitments — carrying cost is an assumption, not a quote.
      </p>
      {onCarryRateChange && (
        <div className="mt-4 max-w-xs">
          <Label>Carrying cost rate (% annual)</Label>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={carryRatePercent}
            onChange={(e) => onCarryRateChange(Number(e.target.value))}
            className="mt-1 w-full accent-fm-teal"
          />
          <p className="text-sm text-fm-charcoal">{carryRatePercent}% → est. {formatCurrency(carryCost)} over {monthsCarry} months</p>
        </div>
      )}
      <div className="mt-4 w-full min-w-0">
        <ResponsiveContainer width="100%" height={240} minWidth={0}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} stackOffset="sign">
            <XAxis dataKey="month" tick={{ fill: "#9b9b9b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#9b9b9b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(v) => formatCurrency(Math.abs(v))} />
            <Legend />
            <Bar dataKey="commitment" name="Input commitment" stackId="cash" fill="#d4a574" />
            <Bar dataKey="carry" name="Carrying cost (est.)" stackId="cash" fill="#9b9b9b" />
            <Bar dataKey="revenue" name="Harvest revenue" stackId="cash" fill="#0d8b8b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-fm-charcoal">
        <li>March: commit ~{formatCurrency(commitment)} in operating inputs</li>
        <li>October (est.): ~{formatCurrency(carryCost)} carrying cost at {carryRatePercent}%</li>
        <li>November: ~{formatCurrency(revenue)} revenue at base-case assumptions</li>
      </ul>
    </Card>
  );
}
