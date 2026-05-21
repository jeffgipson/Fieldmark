import { useNavigate } from "react-router-dom";
import BenchmarkBar from "./BenchmarkBar";
import { MarginRangeChart } from "./MarginRangeChart";
import Card from "../ui/Card";
import Button from "../ui/Button";
import PeerCohortBanner from "../peers/PeerCohortBanner";
import { peerStatusFromRow } from "../../utils/benchmark";
import { formatCohortDescription } from "../../utils/cohort";
import { formatMarginPercentile } from "../../utils/format";

const SKIP = new Set(["total"]);

export function PeerSnapshot({ categories, cohort, margin, region, commodity, scenarioId }) {
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

  const percentileLabel = margin?.available
    ? formatMarginPercentile(margin.base_margin_peer_percentile)
    : null;

  if (rows.length === 0) {
    return (
      <Card className="!p-5">
        <p className="fm-eyebrow">Regional comparison</p>
        <p className="mt-2 text-fm-gray-medium">
          Run your scenario and compare costs to see where you stand among farms like yours.
        </p>
        {scenarioId && (
          <Button
            variant="secondary"
            className="mt-4 !py-2.5"
            onClick={() => navigate(`/scenarios/${scenarioId}/benchmark`)}
          >
            Compare to regional farms
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {cohortAvailable ? (
        <Card className="!p-5 border-2 border-fm-teal/20">
          <p className="fm-eyebrow">Where you stand</p>
          {percentileLabel ? (
            <>
              <p className="font-display mt-1 text-2xl font-bold text-fm-teal">{percentileLabel}</p>
              <p className="mt-1 text-sm text-fm-charcoal">Base-case margin vs farms in your region</p>
            </>
          ) : (
            <p className="font-display mt-1 text-lg font-semibold text-fm-ink">
              Your costs vs farms like yours
            </p>
          )}
          <p className="mt-2 text-xs text-fm-gray-medium">
            {formatCohortDescription(cohort, { region, commodity })}
          </p>
        </Card>
      ) : (
        <PeerCohortBanner cohort={cohort} region={region} commodity={commodity} variant="compact" />
      )}

      {cohortAvailable && margin?.available && (
        <MarginRangeChart margin={margin} compact />
      )}

      <Card className="!p-5">
        <p className="fm-eyebrow">Cost gaps</p>
        <p className="font-display mt-1 text-lg font-semibold text-fm-ink">
          {cohortAvailable ? "Biggest gaps vs regional farms" : "Biggest gaps vs Extension"}
        </p>
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
            Full regional comparison
          </Button>
        )}
      </Card>
    </div>
  );
}
