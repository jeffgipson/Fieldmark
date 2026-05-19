import { SCENARIO_COPY } from "../constants/scenarios";

export function scenarioStatus(scenario) {
  if (!scenario) return "no_scenario";
  if (!scenario.results?.base_case) return "needs_calculation";
  if (!scenario.peer_comparison?.summary) return "needs_benchmark";
  return "ready";
}

/**
 * @returns {{ steps: Array<{ id, label, description, done, active, href? }>, nextHref: string|null, nextLabel: string|null }}
 */
export function buildJourneySteps({ fields, primaryScenario, reportComplete = false }) {
  const primary = primaryScenario || null;
  const status = scenarioStatus(primary);
  const firstField = fields[0];
  const scenarioId = primary?.id;

  const hasFields = fields.length > 0;
  const hasMargins = Boolean(primary?.results?.base_case);
  const hasBenchmark = Boolean(primary?.peer_comparison?.summary);

  const steps = SCENARIO_COPY.journey.steps.map((step) => {
    switch (step.id) {
      case "costs":
        return {
          ...step,
          done: hasFields,
          active: !hasFields,
          href: hasFields && firstField ? `/fields/${firstField.id}/costs` : "/farm"
        };
      case "margins":
        return {
          ...step,
          done: hasMargins,
          active: hasFields && !hasMargins,
          href: scenarioId ? `/scenarios/${scenarioId}` : "/scenarios"
        };
      case "benchmark":
        return {
          ...step,
          done: hasBenchmark,
          active: hasMargins && !hasBenchmark,
          href: scenarioId ? `/scenarios/${scenarioId}/benchmark` : null
        };
      case "report":
        return {
          ...step,
          done: reportComplete,
          active: hasBenchmark && !reportComplete,
          href: scenarioId ? `/scenarios/${scenarioId}/report` : null
        };
      default:
        return { ...step, done: false, active: false, href: null };
    }
  });

  let nextHref = null;
  let nextLabel = null;

  if (!hasFields) {
    nextHref = "/farm";
    nextLabel = "Go to My Farm";
  } else if (status === "no_scenario") {
    nextHref = null;
    nextLabel = null;
  } else if (status === "needs_calculation") {
    nextHref = `/scenarios/${scenarioId}`;
    nextLabel = "Run margin model";
  } else if (status === "needs_benchmark") {
    nextHref = `/scenarios/${scenarioId}/benchmark`;
    nextLabel = "Compare to peers";
  } else if (!reportComplete) {
    nextHref = `/scenarios/${scenarioId}/report`;
    nextLabel = "Generate lender report";
  } else {
    nextHref = `/scenarios/${scenarioId}/report`;
    nextLabel = "View lender report";
  }

  return { steps, nextHref, nextLabel, status };
}
