import { useNavigate } from "react-router-dom";
import BenchmarkBar from "./BenchmarkBar";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { peerStatusFromRow } from "../../utils/benchmark";

const SKIP = new Set(["total"]);

export function PeerSnapshot({ categories, cohort, scenarioId }) {
  const navigate = useNavigate();
  const cohortAvailable = cohort?.available;
  const rows = categories
    ? Object.entries(categories)
        .filter(([key]) => !SKIP.has(key))
        .sort((a, b) => {
          const diffA = cohortAvailable
            ? a[1]?.difference_vs_peer_per_acre ?? a[1]?.difference_per_acre
            : a[1]?.difference_vs_benchmark_per_acre ?? a[1]?.difference_per_acre;
          const diffB = cohortAvailable
            ? b[1]?.difference_vs_peer_per_acre ?? b[1]?.difference_per_acre
            : b[1]?.difference_vs_benchmark_per_acre ?? b[1]?.difference_per_acre;
          return (diffB || 0) - (diffA || 0);
        })
        .slice(0, 3)
    : [];

  if (rows.length === 0) {
    return (
      <Card className="!p-5">
        <p className="fm-eyebrow">Peer position</p>
        <p className="mt-2 text-fm-gray-medium">
          Run your scenario to see how your costs compare.
        </p>
      </Card>
    );
  }

  return (
    <Card className="!p-5">
      <p className="fm-eyebrow">Peer position</p>
      <p className="font-display mt-1 text-lg font-semibold text-fm-ink">
        Top categories vs peers and benchmark
      </p>
      {cohortAvailable && cohort?.size && (
        <p className="mt-1 text-xs text-fm-gray-medium">
          Based on {cohort.size} anonymized farms in your region
        </p>
      )}
      <div className="mt-5 space-y-5">
        {rows.map(([key, row], index) => (
          <BenchmarkBar
            key={key}
            label={key}
            farmCost={row.user_per_acre}
            benchmarkCost={row.benchmark_per_acre}
            peerCost={cohortAvailable ? row.peer_median_per_acre : null}
            status={peerStatusFromRow(row)}
            delayMs={index * 50}
          />
        ))}
      </div>
      {scenarioId && (
        <Button
          variant="secondary"
          className="mt-5 !py-2.5"
          onClick={() => navigate(`/scenarios/${scenarioId}/benchmark`)}
        >
          See all benchmarks
        </Button>
      )}
    </Card>
  );
}
