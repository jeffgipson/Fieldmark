import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatPerAcre } from "../../utils/format";

export default function MacroPressuresCard({
  macroImpact,
  applyMacro,
  onApplyMacroChange,
  macroApplied,
  onApplyAndRecalculate,
  calculating
}) {
  if (!macroImpact?.drivers?.length) return null;

  const bump = macroImpact.total_suggested_bump_per_acre;

  return (
    <Card>
      <h3 className="font-display font-semibold">Outside pressures this season</h3>
      <p className="mt-1 text-sm text-fm-gray-medium">{macroImpact.disclaimer}</p>

      <ul className="mt-3 space-y-2 text-sm">
        {macroImpact.drivers.map((d) => (
          <li key={d.driver_key}>
            <span className="font-medium">{driverKeyLabel(d.driver_key)}:</span>{" "}
            {formatDriverValue(d)}
            {d.source_url && (
              <a
                href={d.source_url}
                target="_blank"
                rel="noreferrer"
                className="ml-1 text-fm-teal hover:underline"
              >
                Source
              </a>
            )}
          </li>
        ))}
      </ul>

      {bump > 0 && (
        <p className="mt-3 text-sm font-semibold text-fm-charcoal">
          Suggested stress-test bump: {formatPerAcre(bump)} operating cost
        </p>
      )}

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={applyMacro}
          onChange={(e) => onApplyMacroChange(e.target.checked)}
        />
        Apply suggested macro adjustments when calculating
      </label>

      {macroApplied && (
        <p className="mt-2 text-xs text-fm-teal">Macro adjustments are included in the margins above.</p>
      )}

      <Button
        type="button"
        variant="secondary"
        className="mt-3"
        disabled={calculating}
        onClick={() => onApplyAndRecalculate(applyMacro)}
      >
        {calculating ? "Calculating…" : "Recalculate with selection"}
      </Button>
    </Card>
  );
}

function driverKeyLabel(key) {
  const labels = {
    diesel_price_per_gallon: "Diesel",
    fertilizer_yoy_pct: "Fertilizer YoY"
  };
  return labels[key] || key;
}

function formatDriverValue(driver) {
  if (driver.driver_key === "diesel_price_per_gallon") {
    return `$${Number(driver.value).toFixed(2)}/gal`;
  }
  if (driver.driver_key === "fertilizer_yoy_pct") {
    return `${Number(driver.value).toFixed(1)}%`;
  }
  return String(driver.value);
}

