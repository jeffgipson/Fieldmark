import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDaleChat } from "../contexts/DaleChatContext";
import * as scenariosApi from "../api/scenarios";
import * as farmsApi from "../api/farms";
import { MarginChart } from "../components/charts/MarginChart";
import { CostChart } from "../components/charts/CostChart";
import { MarginWaterfallChart } from "../components/charts/MarginWaterfallChart";
import { CashTimelineChart } from "../components/charts/CashTimelineChart";
import { SensitivityHeatmap } from "../components/charts/SensitivityHeatmap";
import DaleBriefingCard from "../components/dale/DaleBriefingCard";
import { PeerSnapshot } from "../components/charts/PeerSnapshot";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import LoadingDale from "../components/ui/LoadingDale";
import { useFarm } from "../contexts/FarmContext";
import { formatCurrency, formatPerAcre } from "../utils/format";
import { friendlyError } from "../utils/errors";
import DecisionLogForm from "../components/decisions/DecisionLogForm";
import FieldMarginByField from "../components/scenario/FieldMarginByField";
import MacroPressuresCard from "../components/scenario/MacroPressuresCard";
import ForecastTimelineChart from "../components/forecast/ForecastTimelineChart";
import SeasonSnapshotsPanel from "../components/forecast/SeasonSnapshotsPanel";
import ScenarioRiskPanel from "../components/scenario/ScenarioRiskPanel";
import UnderwritingSummaryPanel from "../components/underwriting/UnderwritingSummaryPanel";
import TargetPlanningPanel from "../components/scenario/TargetPlanningPanel";

function MarginBox({ title, data, variant = "teal" }) {
  if (!data) return null;
  const negative = Number(data.margin_per_acre) < 0;
  const border =
    variant === "downside"
      ? negative
        ? "border-fm-alert"
        : "border-fm-gold"
      : "border-fm-teal";
  return (
    <Card className={`border-2 ${border}`}>
      <h3 className="font-display font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-fm-charcoal">
        <li>Revenue/acre: {formatPerAcre(data.revenue_per_acre)}</li>
        <li>Total cost/acre: {formatPerAcre(data.operating_cost_per_acre)}</li>
        <li className={negative ? "text-fm-alert font-bold" : "text-fm-success font-bold"}>
          Net margin/acre: {formatPerAcre(data.margin_per_acre)}
        </li>
        <li className="font-display text-2xl font-bold">
          Total farm net: {formatCurrency(data.total_margin)}
        </li>
      </ul>
    </Card>
  );
}

function scenarioFindings(results, sensitivity) {
  const findings = [];
  if (results?.base_case) {
    findings.push(
      `Base margin ${formatPerAcre(results.base_case.margin_per_acre)}; downside ${formatPerAcre(results.downside_case?.margin_per_acre)}.`
    );
  }
  const summary = sensitivity?.summary;
  if (summary?.breakeven_price_at_base_yield != null) {
    findings.push(`Breakeven near $${summary.breakeven_price_at_base_yield}/bu at your base yield.`);
  }
  if (summary?.worst_margin_per_acre != null && Number(summary.worst_margin_per_acre) < 0) {
    findings.push(
      `Sensitivity grid shows margins below zero in the downside range (worst ${formatPerAcre(summary.worst_margin_per_acre)}).`
    );
  }
  return findings;
}

export default function ScenarioPage() {
  const { id: scenarioId } = useParams();
  const { farm, fields, refresh } = useFarm();
  const { openChat } = useDaleChat();
  const [scenario, setScenario] = useState(null);
  const [yieldContext, setYieldContext] = useState(null);
  const [form, setForm] = useState({});
  const [carryRate, setCarryRate] = useState(6);
  const [farmSummary, setFarmSummary] = useState(null);
  const [underwriting, setUnderwriting] = useState(null);
  const [macroImpact, setMacroImpact] = useState(null);
  const [applyMacro, setApplyMacro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!farm || !scenarioId) return;
    Promise.all([
      scenariosApi.getScenario(farm.id, scenarioId),
      farmsApi.getYieldContext(farm.id).catch(() => null),
      farmsApi.getFarmSummary(farm.id, { scenarioId }).catch(() => null),
      farmsApi.getFarmUnderwriting(farm.id, { scenarioId }).catch(() => null)
    ])
      .then(([s, yc, summary, uw]) => {
        setScenario(s);
        setYieldContext(yc);
        setFarmSummary(summary);
        setUnderwriting(uw);
        setMacroImpact(summary?.macro_impact || null);
        setApplyMacro(Boolean(s?.results?.macro_adjustments?.applied));
        setForm({
          name: s.name,
          planning_mode: s.planning_mode || "forward",
          commodity_price: s.commodity_price || "4.33",
          yield_assumption: s.yield_assumption || "176",
          downside_commodity_price: s.downside_commodity_price || "3.80",
          downside_yield: s.downside_yield || "160",
          target_total_margin: s.target_total_margin != null ? String(s.target_total_margin) : "",
          target_margin_per_acre: s.target_margin_per_acre != null ? String(s.target_margin_per_acre) : ""
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(friendlyError(err));
        setLoading(false);
      });
  }, [farm, scenarioId]);

  function applyNassDownside() {
    if (!yieldContext?.suggested_downside_yield) return;
    setForm((f) => ({ ...f, downside_yield: String(yieldContext.suggested_downside_yield) }));
  }

  function applyTargetPath(path) {
    if (path.key === "commodity_price") {
      setForm((f) => ({ ...f, commodity_price: String(path.required_value) }));
    } else if (path.key === "yield_assumption") {
      setForm((f) => ({ ...f, yield_assumption: String(path.required_value) }));
    }
  }

  function buildScenarioPayload() {
    const payload = {
      name: form.name,
      planning_mode: form.planning_mode || "forward",
      commodity_price: Number(form.commodity_price),
      yield_assumption: Number(form.yield_assumption),
      downside_commodity_price: Number(form.downside_commodity_price),
      downside_yield: Number(form.downside_yield)
    };
    if (form.planning_mode === "goal") {
      payload.target_total_margin =
        form.target_total_margin === "" ? null : Number(form.target_total_margin);
      payload.target_margin_per_acre =
        form.target_margin_per_acre === "" ? null : Number(form.target_margin_per_acre);
    } else {
      payload.target_total_margin = null;
      payload.target_margin_per_acre = null;
    }
    return payload;
  }

  function applyDownsideYield(value, fieldName) {
    if (value == null) return;
    const label = fieldName ? `Apply ${value} bu/ac from ${fieldName} to farm-wide downside yield?` : `Set downside yield to ${value} bu/ac?`;
    if (!window.confirm(label)) return;
    setForm((f) => ({ ...f, downside_yield: String(value) }));
  }

  async function runCalculate(withMacro = applyMacro) {
    setCalculating(true);
    setError(null);
    try {
      await scenariosApi.updateScenario(farm.id, scenarioId, buildScenarioPayload());
      const updated = await scenariosApi.calculateScenario(farm.id, scenarioId, {
        applyMacro: withMacro
      });
      setScenario(updated);
      setApplyMacro(withMacro);
      const [summary, uw] = await Promise.all([
        farmsApi.getFarmSummary(farm.id, { scenarioId }),
        farmsApi.getFarmUnderwriting(farm.id, { scenarioId })
      ]);
      setFarmSummary(summary);
      setUnderwriting(uw);
      setMacroImpact(summary?.macro_impact || null);
      await refresh();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setCalculating(false);
    }
  }

  async function handleCalculate(e) {
    e.preventDefault();
    if (
      form.planning_mode === "goal" &&
      !form.target_total_margin &&
      !form.target_margin_per_acre
    ) {
      setError("Enter a target farm net or target margin per acre for goal planning.");
      return;
    }
    await runCalculate(applyMacro);
  }

  async function refreshAfterHistoryChange() {
    const updated = await scenariosApi.getScenario(farm.id, scenarioId);
    setScenario(updated);
    const [summary, uw] = await Promise.all([
      farmsApi.getFarmSummary(farm.id, { scenarioId }),
      farmsApi.getFarmUnderwriting(farm.id, { scenarioId })
    ]);
    setFarmSummary(summary);
    setUnderwriting(uw);
    await refresh();
  }

  if (loading) return <LoadingDale />;
  const results = scenario?.results;
  const monthsCarry = 8;
  const regionalRisk = yieldContext?.regional_risk || farmSummary?.regional_risk;

  return (
    <div>
      <Link
        to="/scenarios"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-fm-teal hover:underline"
      >
        ← Scenarios
      </Link>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <Label>Scenario name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>How do you want to plan?</Label>
              <div className="flex max-lg:flex-col lg:flex-row">
                <button
                  type="button"
                  className={`max-lg:rounded-lg lg:rounded-l-lg border px-3 py-2.5 text-sm font-bold ${
                    form.planning_mode !== "goal"
                      ? "border-fm-teal bg-fm-teal text-white"
                      : "border-fm-gray-light bg-white text-fm-charcoal"
                  }`}
                  onClick={() => setForm({ ...form, planning_mode: "forward" })}
                >
                  From assumptions
                </button>
                <button
                  type="button"
                  className={`max-lg:rounded-lg max-lg:border-t-0 lg:rounded-r-lg border lg:border-l-0 px-3 py-2.5 text-sm font-bold ${
                    form.planning_mode === "goal"
                      ? "border-fm-teal bg-fm-teal text-white"
                      : "border-fm-gray-light bg-white text-fm-charcoal"
                  }`}
                  onClick={() => setForm({ ...form, planning_mode: "goal" })}
                >
                  From a goal
                </button>
              </div>
            </div>
            {form.planning_mode === "goal" && (
              <div className="rounded-lg border border-fm-teal/30 bg-fm-teal-subtle/40 p-3 space-y-3">
                <p className="text-sm text-fm-charcoal">
                  What do you need to earn? We will show what price, yield, or cost change gets you there.
                </p>
                <div>
                  <Label>Target farm net ($)</Label>
                  <Input
                    type="number"
                    value={form.target_total_margin}
                    onChange={(e) => setForm({ ...form, target_total_margin: e.target.value })}
                    placeholder="e.g. 75000"
                  />
                </div>
                <div>
                  <Label>Or target margin ($/ac)</Label>
                  <Input
                    type="number"
                    value={form.target_margin_per_acre}
                    onChange={(e) => setForm({ ...form, target_margin_per_acre: e.target.value })}
                    placeholder="e.g. 450"
                  />
                </div>
              </div>
            )}
            <h4 className="font-display font-semibold text-fm-teal">
              {form.planning_mode === "goal" ? "Planning assumptions (hold these)" : "Base case"}
            </h4>
            <div>
              <Label>Commodity price ($/bu)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.commodity_price}
                onChange={(e) => setForm({ ...form, commodity_price: e.target.value })}
              />
            </div>
            <div>
              <Label>Expected yield (bu/ac)</Label>
              <Input
                type="number"
                value={form.yield_assumption}
                onChange={(e) => setForm({ ...form, yield_assumption: e.target.value })}
              />
            </div>
            <h4 className="font-display font-semibold text-fm-gold">Downside case</h4>
            <div>
              <Label>Commodity price ($/bu)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.downside_commodity_price}
                onChange={(e) => setForm({ ...form, downside_commodity_price: e.target.value })}
              />
            </div>
            <div>
              <Label>Expected yield (bu/ac)</Label>
              <Input
                type="number"
                value={form.downside_yield}
                onChange={(e) => setForm({ ...form, downside_yield: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={calculating}>
              {calculating ? "Calculating..." : "Calculate →"}
            </Button>
          </form>
        </Card>
        <div className="space-y-4">
          {results ? (
            <>
              <MarginBox title="Base case" data={results.base_case} />
              <MarginBox title="Downside case" data={results.downside_case} variant="downside" />
              <MarginChart base={results.base_case} down={results.downside_case} />
            </>
          ) : (
            <p className="text-fm-gray-medium">Enter assumptions and calculate to see margins.</p>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <UnderwritingSummaryPanel underwriting={underwriting} />
        <ScenarioRiskPanel
          farm={farm}
          regionalRisk={regionalRisk}
          yieldContext={yieldContext}
          summaryFields={farmSummary?.fields}
          results={results}
          onApplyNassDownside={applyNassDownside}
          onApplyDownsideYield={applyDownsideYield}
        />
      </div>

      {results && (
        <div className="mt-8 space-y-6">
          {results.target_plan && (
            <TargetPlanningPanel targetPlan={results.target_plan} onApplyPath={applyTargetPath} />
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            <CostChart costs={results.weighted_costs_per_acre} />
            <MarginWaterfallChart base={results.base_case} down={results.downside_case} />
          </div>
          <CashTimelineChart
            totalAcres={results.base_case?.total_acres || farm?.total_acres}
            operatingCostPerAcre={results.base_case?.operating_cost_per_acre}
            revenuePerAcre={results.base_case?.revenue_per_acre}
            carryRatePercent={carryRate}
            monthsCarry={monthsCarry}
            onCarryRateChange={setCarryRate}
          />
          <SensitivityHeatmap sensitivity={results.sensitivity} />
          <FieldMarginByField byField={results.by_field} fieldOutliers={results.field_outliers} />
          <MacroPressuresCard
            macroImpact={macroImpact}
            applyMacro={applyMacro}
            onApplyMacroChange={setApplyMacro}
            macroApplied={results.macro_adjustments?.applied}
            calculating={calculating}
            onApplyAndRecalculate={(flag) => runCalculate(flag)}
          />
          <ForecastTimelineChart forecast={results.forecast} />
          <SeasonSnapshotsPanel farmId={farm.id} onChanged={refreshAfterHistoryChange} />
          <DaleBriefingCard
            findings={scenarioFindings(results, results.sensitivity)}
            onTalkToDale={openChat}
          />
        </div>
      )}

      {error && <p className="mt-4 text-fm-alert">{error}</p>}
      {results && (
        <DecisionLogForm scenarioId={scenarioId} fields={fields} fieldRows={results.by_field} />
      )}
      {scenario?.peer_comparison?.summary && (
        <div className="mt-8">
          <PeerSnapshot
            categories={scenario.peer_comparison.summary.categories}
            cohort={scenario.peer_comparison.summary.cohort}
            margin={scenario.peer_comparison.summary.margin_comparison}
            region={farm?.region}
            commodity={farm?.primary_commodity}
            scenarioId={scenarioId}
          />
        </div>
      )}
      {!scenario?.peer_comparison?.summary && results && (
        <Link to={`/scenarios/${scenarioId}/benchmark`} className="mt-6 inline-block font-bold text-fm-teal">
          Compare to regional farms →
        </Link>
      )}
    </div>
  );
}
