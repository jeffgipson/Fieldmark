import { useNavigate } from "react-router-dom";
import { Calendar, ChevronRight } from "lucide-react";
import { DALE_COPY } from "../../constants/dale";
import {
  acreageReconciliation,
  daysUntilMarch1,
  formatAcres,
  formatMarginPercentile
} from "../../utils/format";
import { formatCohortHeadline } from "../../utils/cohort";
import Button from "../ui/Button";
import Card from "../ui/Card";
import MetricCard from "../ui/MetricCard";
import { MarginChart } from "../charts/MarginChart";
import { CostChart } from "../charts/CostChart";
import { PeerSnapshot } from "../charts/PeerSnapshot";
import DaleBriefingCard from "../dale/DaleBriefingCard";
import FarmPrioritiesEditor from "../priorities/FarmPrioritiesEditor";

export default function DashboardWidgetContent({
  widgetId,
  farm,
  fields = [],
  primaryScenario,
  findings = [],
  hasData,
  totalCost,
  base,
  down,
  onTalkToDale,
  onRefresh,
  priorities = [],
  onPrioritiesChange,
  farmId
}) {
  const navigate = useNavigate();
  const days = daysUntilMarch1();

  switch (widgetId) {
    case "farm-priorities":
      if (!farmId) return null;
      return (
        <Card variant="flat" className="!p-5">
          <p className="fm-eyebrow">This season</p>
          <h3 className="font-display mt-1 text-lg font-bold text-fm-ink">Your priorities</h3>
          <p className="mt-1 text-sm text-fm-gray-medium">
            Dale and local resources use these to focus on what matters to your operation.
          </p>
          <div className="mt-4">
            <FarmPrioritiesEditor
              farmId={farmId}
              priorities={priorities}
              onChange={onPrioritiesChange}
              compact
            />
          </div>
        </Card>
      );

    case "setup-prompt":
      if (hasData) {
        return (
          <Card variant="flat" className="!p-5">
            <p className="fm-eyebrow">Before March</p>
            <p className="mt-2 text-lg leading-relaxed text-fm-charcoal">
              Costs entered — run your margin model to see where you stand vs peers.
            </p>
            {primaryScenario && (
              <Button className="mt-4" onClick={() => navigate(`/scenarios/${primaryScenario.id}`)}>
                Run margin model
              </Button>
            )}
          </Card>
        );
      }
      return (
        <Card variant="flat" className="!p-5">
          <p className="fm-eyebrow">Before March</p>
          <p className="mt-2 text-lg leading-relaxed text-fm-charcoal">
            {DALE_COPY.emptyState.message}
          </p>
          <Button className="mt-4" onClick={() => navigate("/farm")}>
            {DALE_COPY.emptyState.cta}
          </Button>
        </Card>
      );

    case "dale-briefing":
      return <DaleBriefingCard findings={findings} onTalkToDale={onTalkToDale} />;

    case "metrics-operating-cost":
      return (
        <MetricCard
          label="Total operating cost"
          value={hasData ? totalCost : null}
          sentiment="neutral"
          animate={hasData}
        />
      );

    case "metrics-base-margin":
      return (
        <MetricCard
          label="Base case margin"
          value={base?.margin_per_acre}
          sentiment={Number(base?.margin_per_acre) >= 0 ? "down" : "up"}
          animate={hasData}
        />
      );

    case "metrics-downside-margin":
      return (
        <MetricCard
          label="Downside margin"
          value={down?.margin_per_acre}
          sentiment={Number(down?.margin_per_acre) >= 0 ? "down" : "up"}
          animate={hasData}
        />
      );

    case "metrics-peer-position": {
      const margin = primaryScenario?.peer_comparison?.summary?.margin_comparison;
      const cohort = primaryScenario?.peer_comparison?.summary?.cohort;
      const percentileLabel = margin?.available
        ? formatMarginPercentile(margin.base_margin_peer_percentile)
        : null;
      const cohortDetail = cohort?.available
        ? formatCohortHeadline(cohort, { region: farm?.region, commodity: farm?.primary_commodity })
        : "Compare costs to join your regional group";

      return (
        <MetricCard
          label="Regional position"
          value={percentileLabel || "—"}
          unit="text"
          sentiment="neutral"
          animate={false}
          detail={cohortDetail}
        />
      );
    }

    case "metrics-farm-acres": {
      const { mappedAcres, profileAcres, reconciled } = acreageReconciliation(fields, farm?.total_acres);
      return (
        <MetricCard
          label={reconciled ? "Total farm acres" : "Farm acres (mapped / profile)"}
          value={reconciled ? profileAcres : `${formatAcres(mappedAcres, { suffix: false })} / ${formatAcres(profileAcres, { suffix: false })}`}
          unit={reconciled ? "number" : "text"}
          sentiment="neutral"
          animate={Boolean(profileAcres || mappedAcres)}
        />
      );
    }

    case "countdown-march":
      return (
        <div className="fm-card relative overflow-hidden p-5">
          <div className="flex items-start gap-3">
            <span className="fm-icon-ring shrink-0">
              <Calendar size={20} strokeWidth={2.25} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-fm-gray-medium">
                Until March 1
              </p>
              <p className="fm-stat mt-2 text-3xl font-bold text-fm-teal">{days}</p>
              <p className="mt-1 text-sm text-fm-gray-medium">days to lock in input costs</p>
            </div>
          </div>
        </div>
      );

    case "quick-actions":
      return (
        <div className="fm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-fm-gray-medium">
            Quick actions
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate("/farm")}>
              Add Field Costs <ChevronRight size={18} />
            </Button>
            {primaryScenario && (
              <Button variant="secondary" onClick={() => navigate(`/scenarios/${primaryScenario.id}`)}>
                Run Scenario <ChevronRight size={18} />
              </Button>
            )}
            {primaryScenario && (
              <Button onClick={() => navigate(`/scenarios/${primaryScenario.id}/report`)}>
                Generate lender report <ChevronRight size={18} />
              </Button>
            )}
            <Button variant="ghost" onClick={onRefresh}>
              Refresh data
            </Button>
          </div>
        </div>
      );

    case "dashboard-margin-chart":
      return <MarginChart base={base} down={down} />;
    case "dashboard-cost-chart":
      return <CostChart costs={primaryScenario?.results?.weighted_costs_per_acre} />;
    case "dashboard-peer-widget":
      return (
        <PeerSnapshot
          categories={primaryScenario?.peer_comparison?.summary?.categories}
          cohort={primaryScenario?.peer_comparison?.summary?.cohort}
          margin={primaryScenario?.peer_comparison?.summary?.margin_comparison}
          region={farm?.region}
          commodity={farm?.primary_commodity}
          scenarioId={primaryScenario?.id}
        />
      );

    default:
      return null;
  }
}
