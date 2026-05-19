import { Link, useNavigate } from "react-router-dom";
import { Calendar, ChevronRight } from "lucide-react";
import { DALE_COPY } from "../../constants/dale";
import { daysUntilMarch1 } from "../../utils/format";
import Button from "../ui/Button";
import Card from "../ui/Card";
import MetricCard from "../ui/MetricCard";
import { MarginChart } from "../charts/MarginChart";
import { CostChart } from "../charts/CostChart";
import { PeerSnapshot } from "../charts/PeerSnapshot";
import DaleBriefingCard from "../dale/DaleBriefingCard";

export default function DashboardWidgetContent({
  widgetId,
  farm,
  primaryScenario,
  findings = [],
  hasData,
  totalCost,
  base,
  down,
  onTalkToDale,
  onRefresh
}) {
  const navigate = useNavigate();
  const days = daysUntilMarch1();

  switch (widgetId) {
    case "setup-prompt":
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

    case "metrics-farm-acres":
      return (
        <MetricCard
          label="Total farm acres"
          value={farm?.total_acres}
          unit="number"
          sentiment="neutral"
          animate={Boolean(farm?.total_acres)}
        />
      );

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
            <Link to="/farm">
              <Button variant="secondary">
                Add Field Costs <ChevronRight size={18} />
              </Button>
            </Link>
            {primaryScenario && (
              <Link to={`/scenarios/${primaryScenario.id}`}>
                <Button variant="secondary">
                  Run Scenario <ChevronRight size={18} />
                </Button>
              </Link>
            )}
            {primaryScenario && (
              <Link to={`/scenarios/${primaryScenario.id}/report`}>
                <Button>
                  Generate Report <ChevronRight size={18} />
                </Button>
              </Link>
            )}
            <Button variant="ghost" onClick={onRefresh}>
              Refresh data
            </Button>
          </div>
        </div>
      );

    default:
      return null;
    case "dashboard-margin-chart":
      return <MarginChart />;
    case "dashboard-cost-chart":
      return <CostChart />;
    case "dashboard-peer-widget":
      return <PeerSnapshot />;
  }
}
