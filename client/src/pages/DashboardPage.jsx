import { useMemo } from "react";
import DaleWelcome from "../components/dale/DaleWelcome";
import DashboardCustomizeBar from "../components/dashboard/DashboardCustomizeBar";
import DashboardWidgetGrid from "../components/dashboard/DashboardWidgetGrid";
import LoadingDale from "../components/ui/LoadingDale";
import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import { useDaleChat } from "../contexts/DaleChatContext";
import { useFarm } from "../contexts/FarmContext";
import useDashboardLayout from "../hooks/useDashboardLayout";
import { buildDashboardFindings } from "../utils/dashboardFindings";
import { daysUntilMarch1 } from "../utils/format";

export default function DashboardPage() {
  const { openChat } = useDaleChat();
  const { user, welcomeFlash, clearWelcomeFlash } = useAuth();
  const { farm, fields, primaryScenario, loading, refresh } = useFarm();
  const days = daysUntilMarch1();
  const hasData = fields.length > 0 && primaryScenario?.results;
  const findings = buildDashboardFindings(primaryScenario);

  const layoutDefaults = useMemo(
    () => ({
      hasFields: fields.length > 0,
      hasFindings: findings.length > 0,
      hasMetrics: Boolean(hasData)
    }),
    [fields.length, findings.length, hasData]
  );

  const {
    widgetIds,
    customizing,
    setCustomizing,
    reorder,
    addWidget,
    removeWidget,
    resetLayout,
    availableToAdd
  } = useDashboardLayout(user?.id, layoutDefaults, !loading);

  if (welcomeFlash) {
    return <DaleWelcome onContinue={clearWelcomeFlash} />;
  }

  if (loading) return <LoadingDale />;

  const results = primaryScenario?.results;
  const base = results?.base_case;
  const down = results?.downside_case;
  const totalCost = results?.weighted_costs_per_acre
    ? Object.values(results.weighted_costs_per_acre).reduce((a, b) => a + Number(b), 0)
    : null;

  const contentProps = {
    farm,
    primaryScenario,
    findings,
    hasData,
    totalCost,
    base,
    down,
    onTalkToDale: openChat,
    onRefresh: refresh
  };

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title={`Good morning, ${user?.first_name || "farmer"}.`}
        subtitle={`${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · ${days} days until March 1`}
      />

      <DashboardCustomizeBar
        customizing={customizing}
        onToggleCustomize={() => setCustomizing((v) => !v)}
        availableToAdd={availableToAdd}
        onAddWidget={addWidget}
        onReset={resetLayout}
      />

      <DashboardWidgetGrid
        widgetIds={widgetIds}
        customizing={customizing}
        onReorder={reorder}
        onRemoveWidget={removeWidget}
        contentProps={contentProps}
      />
    </div>
  );
}
