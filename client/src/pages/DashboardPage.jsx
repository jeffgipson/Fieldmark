import { useMemo, useState } from "react";
import DaleWelcome from "../components/dale/DaleWelcome";
import PrioritiesOnboarding from "../components/priorities/PrioritiesOnboarding";
import DashboardCustomizePanel, {
  DashboardCustomizeToggle
} from "../components/dashboard/DashboardCustomizeBar";
import CompactToolbar from "../components/ui/CompactToolbar";
import DashboardWidgetGrid from "../components/dashboard/DashboardWidgetGrid";
import LoadingDale from "../components/ui/LoadingDale";
import { useAuth } from "../contexts/AuthContext";
import { useDaleChat } from "../contexts/DaleChatContext";
import { useFarm } from "../contexts/FarmContext";
import useDashboardLayout from "../hooks/useDashboardLayout";
import { buildDashboardFindings } from "../utils/dashboardFindings";

export default function DashboardPage() {
  const { openChat } = useDaleChat();
  const { user, welcomeFlash, clearWelcomeFlash } = useAuth();
  const {
    farm,
    fields,
    primaryScenario,
    loading,
    refresh,
    needsPrioritiesCapture,
    syncPriorities,
    skipPrioritiesOnboarding,
    priorities,
    setPriorities
  } = useFarm();
  const [prioritiesSaving, setPrioritiesSaving] = useState(false);
  const hasData = fields.length > 0 && primaryScenario?.results;
  const findings = buildDashboardFindings(primaryScenario);

  const layoutDefaults = useMemo(
    () => ({
      hasFields: fields.length > 0,
      hasFindings: findings.length > 0,
      hasMetrics: Boolean(hasData),
      hasPriorities: !needsPrioritiesCapture
    }),
    [fields.length, findings.length, hasData, needsPrioritiesCapture]
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

  async function completePrioritiesOnboarding(items) {
    setPrioritiesSaving(true);
    try {
      await syncPriorities(items);
    } finally {
      setPrioritiesSaving(false);
    }
  }

  const showPrioritiesOnboarding = needsPrioritiesCapture;

  if (showPrioritiesOnboarding) {
    return (
      <PrioritiesOnboarding
        saving={prioritiesSaving}
        onComplete={completePrioritiesOnboarding}
        onSkip={skipPrioritiesOnboarding}
      />
    );
  }

  const results = primaryScenario?.results;
  const base = results?.base_case;
  const down = results?.downside_case;
  const totalCost = results?.weighted_costs_per_acre
    ? Object.values(results.weighted_costs_per_acre).reduce((a, b) => a + Number(b), 0)
    : null;

  const contentProps = {
    farm,
    fields,
    primaryScenario,
    findings,
    hasData,
    totalCost,
    base,
    down,
    onTalkToDale: openChat,
    onRefresh: refresh,
    priorities,
    onPrioritiesChange: setPriorities,
    farmId: farm?.id
  };

  return (
    <div className="relative">
      <CompactToolbar>
        <DashboardCustomizeToggle
          customizing={customizing}
          onToggleCustomize={() => setCustomizing((v) => !v)}
        />
      </CompactToolbar>

      <DashboardCustomizePanel
        customizing={customizing}
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
