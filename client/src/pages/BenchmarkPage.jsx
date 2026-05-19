import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { useDaleChat } from "../contexts/DaleChatContext";
import * as scenariosApi from "../api/scenarios";
import BenchmarkBar from "../components/charts/BenchmarkBar";
import DaleAvatar from "../components/dale/DaleAvatar";
import Card from "../components/ui/Card";
import CostStatusBadge from "../components/ui/CostStatusBadge";
import LoadingDale from "../components/ui/LoadingDale";
import PageHeader from "../components/ui/PageHeader";
import { BRAND } from "../constants/brand";
import { useFarm } from "../contexts/FarmContext";
import { diffLabel } from "../utils/benchmark";
import { formatCommodity, formatPerAcre, formatRegion } from "../utils/format";
import { friendlyError } from "../utils/errors";

const ROWS = ["seed", "fertilizer", "chemicals", "labor", "total"];

export default function BenchmarkPage() {
  const { id: scenarioId } = useParams();
  const { farm } = useFarm();
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
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(friendlyError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [farm, scenarioId]);

  if (loading) return <LoadingDale message="Comparing your costs to regional peers..." />;
  if (error) return <p className="text-fm-alert">{error}</p>;

  const categories = data?.peer_comparison?.summary?.categories || {};
  const acres = data?.peer_comparison?.summary?.total_acres || farm?.total_acres || 0;
  const worst = Object.entries(categories)
    .filter(([k]) => k !== "total")
    .sort((a, b) => (b[1]?.difference_per_acre || 0) - (a[1]?.difference_per_acre || 0))[0];

  return (
    <div>
      <PageHeader
        title="Your Cost Position"
        subtitle={`${formatRegion(farm?.region)} Missouri | ${formatCommodity(farm?.primary_commodity)} | 2026`}
      />
      <p className="mb-6 text-sm text-fm-gray-medium">{BRAND.attribution.benchmark}</p>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-bold uppercase text-fm-gray-medium">
              <th className="py-2">Category</th>
              <th className="py-2">Your Farm</th>
              <th className="py-2">Regional Avg</th>
              <th className="py-2">Difference</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((key) => {
              const row = categories[key];
              if (!row) return null;
              return (
                <tr key={key} className="border-b border-fm-gray-light">
                  <td className="py-3 capitalize font-medium">{key}</td>
                  <td className="py-3">{formatPerAcre(row.user_per_acre)}</td>
                  <td className="py-3">{formatPerAcre(row.benchmark_per_acre)}</td>
                  <td className="py-3">{diffLabel(row.difference_per_acre)}</td>
                  <td className="py-3"><CostStatusBadge status={row.flag} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {worst && worst[1]?.difference_per_acre > 0 && (
        <Card variant="alert" className="mt-6">
          <p className="font-bold text-fm-charcoal">
            {worst[0].charAt(0).toUpperCase() + worst[0].slice(1)} stands out
          </p>
          <p className="mt-2 text-fm-charcoal">
            At {acres} acres, your {worst[0]} cost is $
            {Math.abs(worst[1].total_farm_dollar_impact).toLocaleString()} above regional average.
          </p>
        </Card>
      )}

      <div className="mt-8 space-y-4">
        {ROWS.filter((k) => categories[k]).map((key, i) => (
          <BenchmarkBar
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            farmCost={categories[key].user_per_acre}
            benchmarkCost={categories[key].benchmark_per_acre}
            status={categories[key].flag}
            delayMs={i * 100}
          />
        ))}
      </div>

      <Card variant="dale" className="mt-8 flex gap-4 items-center">
        <DaleAvatar variant="analyzing" size="md" />
        <div className="flex-1">
          <p className="text-fm-charcoal">
            {worst
              ? `Your ${worst[0]} spend is the biggest gap vs MU Extension — worth a conversation before March.`
              : "You're in a solid position relative to regional benchmarks on operating costs."}
          </p>
          <Button variant="secondary" className="mt-3 !py-2" onClick={openChat}>
            Talk to Dale →
          </Button>
        </div>
      </Card>
    </div>
  );
}
