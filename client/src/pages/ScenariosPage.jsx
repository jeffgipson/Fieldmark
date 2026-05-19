import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import * as reportsApi from "../api/reports";
import * as scenariosApi from "../api/scenarios";
import DaleAvatar from "../components/dale/DaleAvatar";
import ScenarioCard from "../components/scenarios/ScenarioCard";
import ScenarioJourneySteps from "../components/scenarios/ScenarioJourneySteps";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import LoadingDale from "../components/ui/LoadingDale";
import PageHeader from "../components/ui/PageHeader";
import { SCENARIO_COPY } from "../constants/scenarios";
import { useFarm } from "../contexts/FarmContext";
import { buildJourneySteps } from "../utils/scenarioProgress";
import { daysUntilMarch1 } from "../utils/format";
import { friendlyError } from "../utils/errors";

const DEFAULT_ASSUMPTIONS = {
  commodity_price: 4.33,
  yield_assumption: 176,
  downside_commodity_price: 3.8,
  downside_yield: 160
};

export default function ScenariosPage() {
  const navigate = useNavigate();
  const { farm, fields, scenarios, loading, refresh } = useFarm();
  const [name, setName] = useState(SCENARIO_COPY.create.defaultName);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [reportComplete, setReportComplete] = useState(false);

  useEffect(() => {
    const scenarioId = scenarios[0]?.id;
    if (!scenarioId) {
      setReportComplete(false);
      return;
    }
    let cancelled = false;
    reportsApi
      .getReport(scenarioId)
      .then((data) => {
        if (!cancelled) setReportComplete(data?.status === "completed");
      })
      .catch(() => {
        if (!cancelled) setReportComplete(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scenarios]);

  const journey = useMemo(
    () => buildJourneySteps({ fields, primaryScenario: scenarios[0], reportComplete }),
    [fields, scenarios, reportComplete]
  );

  const daysToMarch = daysUntilMarch1();

  async function createScenario(andNavigate = true) {
    if (!farm?.id || !name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await scenariosApi.createScenario(farm.id, {
        name: name.trim(),
        ...DEFAULT_ASSUMPTIONS
      });
      await refresh();
      setName(SCENARIO_COPY.create.downsideName);
      setShowCreate(false);
      if (andNavigate && created?.id) {
        navigate(`/scenarios/${created.id}`);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <LoadingDale />;

  const hasScenarios = scenarios.length > 0;

  return (
    <div className="mx-auto max-w-4xl animate-fm-in">
      <PageHeader
        eyebrow={SCENARIO_COPY.page.eyebrow}
        title={SCENARIO_COPY.page.title}
        subtitle={SCENARIO_COPY.page.subtitle}
        action={
          <p className="rounded-xl border border-fm-gold/40 bg-fm-gold-muted px-4 py-2 text-sm font-semibold text-fm-charcoal">
            {daysToMarch} days until March 1
          </p>
        }
      />

      <ScenarioJourneySteps
        steps={journey.steps}
        nextHref={journey.nextHref}
        nextLabel={journey.nextLabel}
      />

      {!hasScenarios ? (
        <Card variant="dale" className="mb-8 text-center" hover={false}>
          <DaleAvatar variant="analyzing" size="lg" className="mx-auto" />
          <h2 className="mt-6 font-display text-2xl font-semibold text-fm-ink">
            {SCENARIO_COPY.empty.title}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-fm-charcoal">
            {SCENARIO_COPY.empty.body}
          </p>
          <div className="mx-auto mt-8 max-w-md text-left">
            <Label>{SCENARIO_COPY.create.label}</Label>
            <Input
              className="mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-describedby="scenario-name-hint"
            />
            <p id="scenario-name-hint" className="mt-2 text-sm text-fm-gray-medium">
              {SCENARIO_COPY.create.hint}
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => createScenario(true)}
              disabled={creating || !name.trim()}
            >
              {creating ? "Creating…" : SCENARIO_COPY.empty.cta}
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-fm-ink">Your plans</h2>
            {!showCreate && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-fm-teal hover:underline"
              >
                <Plus className="h-4 w-4" aria-hidden />
                {SCENARIO_COPY.create.addAnother}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {scenarios.map((s) => (
              <ScenarioCard key={s.id} scenario={s} farmAcres={farm?.total_acres} />
            ))}
          </div>

          {showCreate && (
            <Card className="mt-6 border-dashed border-2 border-fm-teal/30">
              <Label>{SCENARIO_COPY.create.label}</Label>
              <p className="mt-1 text-sm text-fm-gray-medium">{SCENARIO_COPY.create.hint}</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Input
                  className="flex-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => createScenario(true)}
                    disabled={creating || !name.trim()}
                  >
                    {creating ? "Creating…" : SCENARIO_COPY.create.submit}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {fields.length === 0 && (
        <Card variant="alert" className="mt-8" hover={false}>
          <p className="font-semibold text-fm-ink">Add fields before you model margins</p>
          <p className="mt-2 text-sm text-fm-charcoal">
            Scenarios use your per-acre input costs from each field. Head to My Farm to add fields
            and enter costs first.
          </p>
          <Link
            to="/farm"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-fm-teal hover:underline"
          >
            Go to My Farm
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </Card>
      )}

      {error && <p className="mt-4 text-fm-alert">{error}</p>}
    </div>
  );
}
