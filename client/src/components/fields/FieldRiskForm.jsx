import { useEffect, useState } from "react";
import * as fieldRiskApi from "../../api/fieldRiskProfiles";
import * as scenariosApi from "../../api/scenarios";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input, { Label } from "../ui/Input";
import { friendlyError } from "../../utils/errors";

const DRAINAGE_OPTIONS = [
  { value: "good", label: "Good" },
  { value: "moderate", label: "Moderate" },
  { value: "poor", label: "Poor" }
];

export default function FieldRiskForm({ farmId, fieldId, primaryScenarioId, onSaved }) {
  const [form, setForm] = useState({
    flood_events_last_5_years: "",
    drainage: "moderate",
    bottomland: false,
    risk_notes: ""
  });
  const [suggestion, setSuggestion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!farmId || !fieldId) return;
    fieldRiskApi
      .getFieldRiskProfile(farmId, fieldId)
      .then((data) => {
        setForm({
          flood_events_last_5_years:
            data.flood_events_last_5_years != null ? String(data.flood_events_last_5_years) : "",
          drainage: data.drainage || "moderate",
          bottomland: Boolean(data.bottomland),
          risk_notes: data.risk_notes || ""
        });
        setSuggestion(data.risk_suggestion || null);
      })
      .catch(() => {});
  }, [farmId, fieldId]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        flood_events_last_5_years:
          form.flood_events_last_5_years === "" ? null : Number(form.flood_events_last_5_years),
        drainage: form.drainage,
        bottomland: form.bottomland,
        risk_notes: form.risk_notes
      };
      const updated = await fieldRiskApi.updateFieldRiskProfile(farmId, fieldId, payload);
      setSuggestion(updated.risk_suggestion || null);
      onSaved?.();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  async function applySuggestedYield() {
    if (!primaryScenarioId || !suggestion?.suggested_downside_yield) return;
    if (
      !window.confirm(
        "This updates the farm-wide scenario downside yield. Per-field yields are coming later."
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      await scenariosApi.updateScenario(farmId, primaryScenarioId, {
        downside_yield: suggestion.suggested_downside_yield
      });
      await scenariosApi.calculateScenario(farmId, primaryScenarioId);
      onSaved?.();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-6">
      <h3 className="font-display font-semibold">Field risk</h3>
      <p className="mt-1 text-sm text-fm-gray-medium">
        Flood history and drainage help stress-test margins — nothing changes until you apply it.
      </p>
      <form onSubmit={handleSave} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Flood events (last 5 years)</Label>
          <Input
            type="number"
            min="0"
            max="5"
            value={form.flood_events_last_5_years}
            onChange={(e) => setForm({ ...form, flood_events_last_5_years: e.target.value })}
          />
        </div>
        <div>
          <Label>Drainage</Label>
          <select
            className="w-full rounded-lg border px-4 py-3"
            value={form.drainage}
            onChange={(e) => setForm({ ...form, drainage: e.target.value })}
          >
            {DRAINAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.bottomland}
              onChange={(e) => setForm({ ...form, bottomland: e.target.checked })}
            />
            Bottomland / flood-prone
          </label>
        </div>
        <div>
          <Label>Notes</Label>
          <Input
            value={form.risk_notes}
            onChange={(e) => setForm({ ...form, risk_notes: e.target.value })}
            placeholder="e.g. Went under in 2022 and 2024"
          />
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save risk profile"}
          </Button>
        </div>
      </form>

      {suggestion?.suggested_downside_yield != null && (
        <div>
          <p className="mt-4 text-sm text-fm-charcoal">{suggestion.rationale}</p>
          <p className="mt-1 text-sm">
            Suggested downside yield: <strong>{suggestion.suggested_downside_yield} bu/ac</strong>{" "}
            (farm scenario is {suggestion.farm_downside_yield} bu/ac)
          </p>
          {primaryScenarioId && (
            <Button type="button" variant="secondary" className="mt-2" onClick={applySuggestedYield}>
              Apply to scenario downside yield
            </Button>
          )}
          <p className="mt-1 text-xs text-fm-gray-medium">{suggestion.disclaimer}</p>
        </div>
      )}

      {error && <p className="mt-2 text-fm-alert">{error}</p>}
    </Card>
  );
}
