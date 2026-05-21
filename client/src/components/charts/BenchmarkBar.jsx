import { useEffect, useState } from "react";
import { COST_STATUS } from "../../utils/benchmark";
import { formatPerAcre } from "../../utils/format";

export default function BenchmarkBar({
  label,
  farmCost,
  benchmarkCost,
  peerCost,
  status = "at_average",
  delayMs = 0
}) {
  const [width, setWidth] = useState(0);
  const farm = Number(farmCost) || 0;
  const bench = Number(benchmarkCost) || 0;
  const peer = peerCost != null ? Number(peerCost) : null;
  const max = Math.max(farm, bench, peer || 0, 1) * 1.15;
  const farmPct = (farm / max) * 100;
  const benchPct = bench ? (bench / max) * 100 : 0;
  const peerPct = peer != null ? (peer / max) * 100 : 0;
  const barClass = (COST_STATUS[status] || COST_STATUS.at_average).barClass;

  useEffect(() => {
    const timer = setTimeout(() => setWidth(farmPct), 50 + delayMs);
    return () => clearTimeout(timer);
  }, [farmPct, delayMs]);

  const labelParts = [`You ${formatPerAcre(farm)}`];
  if (peer != null) labelParts.push(`Regional ${formatPerAcre(peer)}`);
  if (bench) labelParts.push(`Extension ${formatPerAcre(bench)}`);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 text-sm max-lg:items-start lg:flex-row lg:justify-between lg:gap-2">
        <span className="font-bold text-fm-charcoal">{label}</span>
        <span className="text-fm-gray-medium max-lg:text-xs lg:text-right">{labelParts.join(" · ")}</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded bg-fm-gray-light">
        {bench > 0 && (
          <div
            className="absolute top-0 h-2 rounded bg-fm-gray-medium/40 transition-all duration-600 ease-out"
            style={{ width: `${benchPct}%` }}
            title={`Extension ${formatPerAcre(bench)}`}
          />
        )}
        {peer != null && (
          <div
            className="absolute top-0 h-2 rounded bg-fm-teal/30 transition-all duration-600 ease-out"
            style={{ width: `${peerPct}%` }}
            title={`Typical regional farm ${formatPerAcre(peer)}`}
          />
        )}
        <div
          className={`absolute top-0 h-2 rounded transition-all duration-600 ease-out ${barClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
