import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatCurrency, formatPerAcre } from "../../utils/format";

export default function TargetPlanningPanel({ targetPlan, onApplyPath }) {
  if (!targetPlan) return null;

  if (!targetPlan.paths?.length && targetPlan.disclaimer) {
    return (
      <Card className="border-2 border-fm-gold/40">
        <p className="fm-eyebrow">Work backward from a goal</p>
        <p className="mt-2 text-sm text-fm-charcoal">{targetPlan.disclaimer}</p>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-fm-teal/40">
      <p className="fm-eyebrow">Work backward from a goal</p>
      <h3 className="font-display mt-1 text-lg font-semibold">What it takes to hit your target</h3>
      {targetPlan.target_margin_per_acre != null && (
        <p className="mt-1 text-sm text-fm-gray-medium">
          Target {formatPerAcre(targetPlan.target_margin_per_acre)} net
          {targetPlan.target_total_margin != null && (
            <> ({formatCurrency(targetPlan.target_total_margin)} farm-wide)</>
          )}{" "}
          {targetPlan.operating_cost_per_acre != null && (
            <>at {formatPerAcre(targetPlan.operating_cost_per_acre)} operating.</>
          )}
        </p>
      )}

      {targetPlan.gap_margin_per_acre != null && (
        <p className="mt-3 rounded-lg border border-fm-gold/30 bg-fm-gold/10 px-3 py-2 text-sm text-fm-charcoal">
          {targetPlan.gap_margin_per_acre > 0 ? (
            <>
              You are <strong>{formatPerAcre(targetPlan.gap_margin_per_acre)}</strong> short of target per acre (
              {formatCurrency(targetPlan.gap_total_margin)} on the farm).
            </>
          ) : targetPlan.gap_margin_per_acre < 0 ? (
            <>
              Your base case already beats this goal by{" "}
              <strong>{formatPerAcre(Math.abs(targetPlan.gap_margin_per_acre))}</strong>/ac.
            </>
          ) : (
            <>Your base case matches this target.</>
          )}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {targetPlan.paths.map((path) => (
          <li
            key={path.key}
            className={`rounded-lg border px-3 py-3 text-sm ${
              path.feasible ? "border-fm-gray-light" : "border-fm-alert/40 bg-fm-alert/5"
            }`}
          >
            <p className="font-semibold text-fm-ink">{path.label}</p>
            <p className="mt-1 text-fm-charcoal">{path.detail}</p>
            {path.required_value != null && (
              <p className="mt-1 font-display text-lg font-bold text-fm-teal">
                {path.unit === "$/bu" && `$${path.required_value}/bu`}
                {path.unit === "bu/ac" && `${path.required_value} bu/ac`}
                {path.unit === "$/ac" && `$${path.required_value}/ac operating`}
              </p>
            )}
            {onApplyPath && path.key !== "operating_cost" && path.feasible && (
              <Button
                type="button"
                variant="secondary"
                className="mt-2 !py-1.5 text-xs"
                onClick={() => onApplyPath(path)}
              >
                Use in scenario
              </Button>
            )}
          </li>
        ))}
      </ul>

      {targetPlan.yield_reference?.note && (
        <p className="mt-3 text-xs text-fm-gray-medium">{targetPlan.yield_reference.note}</p>
      )}

      <p className="mt-3 text-xs text-fm-gray-medium">{targetPlan.disclaimer}</p>
    </Card>
  );
}
