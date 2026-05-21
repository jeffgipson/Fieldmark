import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { useDaleChat } from "../contexts/DaleChatContext";
import * as scenariosApi from "../api/scenarios";
import BenchmarkBar from "../components/charts/BenchmarkBar";
import { BenchmarkGroupedBar } from "../components/charts/BenchmarkGroupedBar";
import { MarginRangeChart } from "../components/charts/MarginRangeChart";
import { TrendStrip } from "../components/charts/TrendStrip";
import DaleAvatar from "../components/dale/DaleAvatar";
import Card from "../components/ui/Card";
import CostStatusBadge from "../components/ui/CostStatusBadge";
import LoadingDale from "../components/ui/LoadingDale";
import { useFarm } from "../contexts/FarmContext";
import {
  cohortSizeLabel,
  diffLabel,
  peerStatusFromRow,
  primaryCategoryDiff,
  rowStatus
} from "../utils/benchmark";
import {
  acreageReconciliation,
  formatAcres,
  formatCategory,
  formatCommodity,
  formatMarginPercentile,
  formatPerAcre,
  formatRegion
} from "../utils/format";
import { friendlyError } from "../utils/errors";
import RecommendationsPanel from "../components/vendors/RecommendationsPanel";
import PeerCohortBanner from "../components/peers/PeerCohortBanner";
import PageHeader from "../components/ui/PageHeader";

const ROWS = ["seed", "fertilizer", "chemicals", "labor", "total"];

export default function BenchmarkPage() {
  const { id: scenarioId } = useParams();
  const { farm, fields, mergeScenarioPeerComparison } = useFarm();
  const { openChat } = useDaleChat();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!farm || !scenarioId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await scenariosApi.compareScenario(farm.id, scenarioId);
        if (!cancelled) {
          setData(result);
          mergeScenarioPeerComparison(result);
        }
      } catch (err) {
        if (!cancelled) setError(friendlyError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [farm, scenarioId, mergeScenarioPeerComparison]);

  const acreage = useMemo(
    () => acreageReconciliation(fields, farm?.total_acres),
    [fields, farm?.total_acres]
  );

  if (loading) return <LoadingDale message="Comparing your costs to regional peers and benchmarks..." />;
  if (error) return <p className="text-fm-alert">{error}</p>;

  const summary = data?.peer_comparison?.summary || {};
  const categories = summary.categories || {};
  const cohort = summary.cohort;
  const cohortAvailable = cohort?.available;
  const mappedAcres = summary.total_acres || acreage.mappedAcres || 0;
  const margin = summary.margin_comparison;
  const costTrends = summary.cost_trends;
  const fieldComparisons = summary.field_comparisons || [];

  const worst = Object.entries(categories)
    .filter(([k]) => k !== "total")
    .sort((a, b) => {
      const diffA = primaryCategoryDiff(a[1], cohortAvailable)?.diff || 0;
      const diffB = primaryCategoryDiff(b[1], cohortAvailable)?.diff || 0;
      return diffB - diffA;
    })[0];

  const worstDiff = worst ? primaryCategoryDiff(worst[1], cohortAvailable) : null;
  const cohortLabel = cohortSizeLabel(cohort);

  const contextLine = [
    `${formatRegion(farm?.region)} Missouri`,
    formatCommodity(farm?.primary_commodity),
    "2026",
    cohortLabel
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <PageHeader
        title="Your cost position"
        subtitle={contextLine}
      />

      <PeerCohortBanner cohort={cohort} region={farm?.region} commodity={farm?.primary_commodity} />

      {!acreage.reconciled && (
        <Card variant="alert" className="mb-6">
          <p className="text-sm text-fm-charcoal">
            Dollar totals below use <strong>{formatAcres(mappedAcres)}</strong> (fields with boundaries). Your
            profile lists {formatAcres(acreage.profileAcres)} — add remaining fields or update your profile so
            farm-wide numbers match.
          </p>
        </Card>
      )}

      {cohortAvailable && margin?.available && (
        <div className="mb-6">
          <MarginRangeChart margin={margin} />
        </div>
      )}

      <BenchmarkGroupedBar categories={categories} cohortAvailable={cohortAvailable} />

      {costTrends?.years?.length > 0 && (
        <div className="mt-6">
          <TrendStrip trends={costTrends} />
        </div>
      )}

      <Card className="mt-6 overflow-x-auto -mx-1 max-lg:rounded-lg lg:mx-0">
        <p className="fm-eyebrow mb-3">Detail</p>
        <p className="font-display mb-4 text-lg font-semibold text-fm-ink">
          {cohortAvailable ? "Your farm vs regional farms vs Extension" : "Your farm vs MU Extension"}
        </p>
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-bold uppercase text-fm-gray-medium">
              <th className="py-2">Category</th>
              <th className="py-2">Your Farm</th>
              {cohortAvailable && <th className="py-2">Typical farm</th>}
              <th className="py-2">Extension</th>
              <th className="py-2">Difference</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((key) => {
              const row = categories[key];
              if (!row) return null;
              const primary = primaryCategoryDiff(row, cohortAvailable);
              return (
                <tr key={key} className="border-b border-fm-gray-light">
                  <td className="py-3 capitalize font-medium">{formatCategory(key)}</td>
                  <td className="py-3">{formatPerAcre(row.user_per_acre)}</td>
                  {cohortAvailable && (
                    <td className="py-3">{formatPerAcre(row.peer_median_per_acre)}</td>
                  )}
                  <td className="py-3">{formatPerAcre(row.benchmark_per_acre)}</td>
                  <td className="py-3">{diffLabel(primary?.diff)}</td>
                  <td className="py-3">
                    <CostStatusBadge status={rowStatus(row, primary)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {worst && worstDiff && worstDiff.diff > 0 && (
        <Card variant="alert" className="mt-6">
          <p className="font-bold text-fm-charcoal">
            {worst[0].charAt(0).toUpperCase() + worst[0].slice(1)} stands out
          </p>
          <p className="mt-2 text-fm-charcoal">
            At {formatAcres(mappedAcres)}, your {formatCategory(worst[0]).toLowerCase()} cost is $
            {Math.abs(worstDiff.impact || 0).toLocaleString()} above the {worstDiff.reference}.
          </p>
        </Card>
      )}

      {margin?.available && !cohortAvailable && (
        <Card className="mt-6">
          <p className="fm-eyebrow">Margin position</p>
          <p className="font-display mt-1 text-lg font-semibold text-fm-ink">Base case vs peer farms</p>
          <p className="mt-3 text-fm-charcoal">
            Your base margin {formatPerAcre(margin.user_base_margin_per_acre)} vs peer median{" "}
            {formatPerAcre(margin.peer_median_base_margin_per_acre)}
            {margin.base_margin_peer_percentile != null && (
              <> ({formatMarginPercentile(margin.base_margin_peer_percentile)} among {margin.cohort_size} farms)</>
            )}
            .
          </p>
          {margin.base_margin_peer_percentile != null && margin.base_margin_peer_percentile <= 10 && (
            <p className="mt-3 rounded-lg border border-fm-teal/20 bg-fm-teal-subtle/30 px-3 py-2 text-sm text-fm-charcoal">
              A low percentile usually means higher costs, conservative yield assumptions, or incomplete field
              data — not a judgment on your operation. Review your highest cost category, rerun your downside
              scenario, and confirm all fields have costs entered.
            </p>
          )}
          {margin.user_downside_margin_per_acre != null && (
            <p className="mt-2 text-sm text-fm-gray-medium">
              Downside: {formatPerAcre(margin.user_downside_margin_per_acre)} vs peer median{" "}
              {formatPerAcre(margin.peer_median_downside_margin_per_acre)}
            </p>
          )}
        </Card>
      )}

      {(fieldComparisons.length > 0 || fields.length > 0) && cohortAvailable && (
        <Card className="mt-6 overflow-x-auto -mx-1 max-lg:rounded-lg lg:mx-0">
          <p className="fm-eyebrow">Field breakdown</p>
          <p className="font-display mt-1 text-lg font-semibold text-fm-ink">Per-field vs regional fields</p>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-bold uppercase text-fm-gray-medium">
                <th className="py-2">Field</th>
                <th className="py-2">Category</th>
                <th className="py-2">Your cost</th>
                <th className="py-2">Typical field</th>
                <th className="py-2">Percentile</th>
              </tr>
            </thead>
            <tbody>
              {fieldComparisons.flatMap((field) => {
                if (field.excluded_reason === "no_cost_data") {
                  const message = cohortAvailable
                    ? "No cost data entered — add costs to include this field."
                    : "Regional field comparison available once your peer group is large enough.";
                  return (
                    <tr key={field.field_id} className="border-b border-fm-gray-light">
                      <td className="py-2 font-medium">{field.field_name}</td>
                      <td colSpan={4} className="py-2 italic text-fm-gray-medium">
                        {message}
                      </td>
                    </tr>
                  );
                }
                return Object.entries(field.categories || {}).map(([category, row]) => (
                  <tr key={`${field.field_id}-${category}`} className="border-b border-fm-gray-light">
                    <td className="py-2 font-medium">{field.field_name}</td>
                    <td className="py-2">{formatCategory(category)}</td>
                    <td className="py-2">{formatPerAcre(row.user_per_acre)}</td>
                    <td className="py-2">{formatPerAcre(row.peer_median_per_acre)}</td>
                    <td className="py-2">
                      {row.peer_percentile != null ? `${Math.round(row.peer_percentile)}th` : "—"}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </Card>
      )}

      <RecommendationsPanel farmId={farm?.id} scenarioId={scenarioId} county={farm?.county} />

      <div className="mt-8 space-y-4">
        {ROWS.filter((k) => categories[k]).map((key, i) => (
          <BenchmarkBar
            key={key}
            label={formatCategory(key)}
            farmCost={categories[key].user_per_acre}
            benchmarkCost={categories[key].benchmark_per_acre}
            peerCost={cohortAvailable ? categories[key].peer_median_per_acre : null}
            status={peerStatusFromRow(categories[key])}
            delayMs={i * 100}
          />
        ))}
      </div>

      <Card variant="dale" className="mt-8 flex gap-4 items-center">
        <DaleAvatar variant="analyzing" size="md" />
        <div className="flex-1">
          <p className="text-fm-charcoal">
            {worst && worstDiff && worstDiff.diff > 0
              ? `Your ${worst[0]} spend is the biggest gap vs ${worstDiff.reference} — worth a conversation before March.`
              : "You're in a solid position on operating costs relative to peers and benchmarks."}
          </p>
          <Button variant="secondary" className="mt-3 !py-2" onClick={openChat}>
            Talk to Dale →
          </Button>
        </div>
      </Card>
    </div>
  );
}
