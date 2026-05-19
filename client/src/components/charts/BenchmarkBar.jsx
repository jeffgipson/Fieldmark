import { useEffect, useState } from "react";
import { COST_STATUS } from "../../utils/benchmark";
import { formatPerAcre } from "../../utils/format";

export default function BenchmarkBar({
  label,
  farmCost,
  benchmarkCost,
  status = "at_average",
  delayMs = 0
}) {
  const [width, setWidth] = useState(0);
  const farm = Number(farmCost) || 0;
  const bench = Number(benchmarkCost) || 1;
  const max = Math.max(farm, bench, 1) * 1.15;
  const farmPct = (farm / max) * 100;
  const benchPct = (bench / max) * 100;
  const barClass = (COST_STATUS[status] || COST_STATUS.at_average).barClass;

  useEffect(() => {
    const timer = setTimeout(() => setWidth(farmPct), 50 + delayMs);
    return () => clearTimeout(timer);
  }, [farmPct, delayMs]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-bold text-fm-charcoal">{label}</span>
        <span className="text-fm-gray-medium">
          You {formatPerAcre(farm)} · Avg {formatPerAcre(bench)}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded bg-fm-gray-light">
        <div
          className="absolute top-0 h-2 rounded bg-fm-gray-medium/40 transition-all duration-600 ease-out"
          style={{ width: `${benchPct}%` }}
        />
        <div
          className={`absolute top-0 h-2 rounded transition-all duration-600 ease-out ${barClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
