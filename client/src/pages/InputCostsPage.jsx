import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as fieldsApi from "../api/fields";
import * as inputCostsApi from "../api/inputCosts";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { DollarInput, Label } from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import LoadingDale from "../components/ui/LoadingDale";
import { BENCHMARK_REFERENCE, INPUT_CATEGORIES, PLANNING_YEAR } from "../constants/app";
import { useFarm } from "../contexts/FarmContext";
import { formatCurrency } from "../utils/format";
import { friendlyError } from "../utils/errors";

export default function InputCostsPage() {
  const { id: fieldId } = useParams();
  const navigate = useNavigate();
  const { farm, primaryScenario, refresh } = useFarm();
  const [field, setField] = useState(null);
  const [costs, setCosts] = useState({});
  const [existing, setExisting] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const ref = BENCHMARK_REFERENCE[farm?.primary_commodity === "soybean" ? "soybean" : "corn"];

  useEffect(() => {
    if (!farm || !fieldId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const f = await fieldsApi.getField(farm.id, fieldId);
        const list = await inputCostsApi.listInputCosts(fieldId);
        const map = {};
        const ids = {};
        (Array.isArray(list) ? list : []).forEach((c) => {
          if (Number(c.season_year) === PLANNING_YEAR) {
            map[c.category] = String(c.amount_per_acre);
            ids[c.category] = c.id;
          }
        });
        if (!cancelled) {
          setField(f);
          setCosts(map);
          setExisting(ids);
        }
      } catch (err) {
        if (!cancelled) setError(friendlyError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [farm, fieldId]);

  const acres = Number(field?.acres) || 0;
  const totalPerAcre = useMemo(
    () => INPUT_CATEGORIES.reduce((sum, { key }) => sum + (Number(costs[key]) || 0), 0),
    [costs]
  );

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      for (const { key } of INPUT_CATEGORIES) {
        const amount = Number(costs[key]);
        if (!amount && amount !== 0) continue;
        const payload = { season_year: PLANNING_YEAR, category: key, amount_per_acre: amount };
        if (existing[key]) {
          await inputCostsApi.updateInputCost(fieldId, existing[key], payload);
        } else {
          await inputCostsApi.createInputCost(fieldId, payload);
        }
      }
      await refresh();
      if (primaryScenario) {
        navigate(`/scenarios/${primaryScenario.id}/benchmark`);
      } else {
        navigate("/scenarios");
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingDale />;
  if (!field) return <p className="text-fm-alert">Field not found.</p>;

  return (
    <div>
      <PageHeader title={field.name} subtitle={`${field.acres} acres · ${field.primary_commodity}`} />
      <Card>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-fm-gray-light text-xs font-bold uppercase text-fm-gray-medium">
              <th className="py-2">Category</th>
              <th className="py-2">$/acre</th>
              <th className="py-2 text-right">Total $</th>
            </tr>
          </thead>
          <tbody>
            {INPUT_CATEGORIES.map(({ key, label }) => {
              const perAcre = Number(costs[key]) || 0;
              return (
                <tr key={key} className="border-b border-fm-gray-light">
                  <td className="py-3 font-medium">{label}</td>
                  <td className="py-3 w-40">
                    <DollarInput
                      value={costs[key] || ""}
                      onChange={(e) => setCosts((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                  </td>
                  <td className="py-3 text-right font-display font-bold">
                    {formatCurrency(perAcre * acres)}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="py-4 font-bold">Total</td>
              <td className="py-4 font-display font-bold">{formatCurrency(totalPerAcre)}/ac</td>
              <td className="py-4 text-right font-display text-lg font-bold">
                {formatCurrency(totalPerAcre * acres)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-sm text-fm-gray-medium">
          Regional average (MU Extension 2026): Seed ${ref.seed}/ac | Fertilizer ${ref.fertilizer}/ac | Chemicals ${ref.chemicals}/ac
        </p>
        <Button className="mt-6" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save & See How I Compare →"}
        </Button>
        {error && <p className="mt-2 text-fm-alert">{error}</p>}
        <Link to="/farm" className="mt-4 inline-block text-sm text-fm-teal font-bold">← Back to fields</Link>
      </Card>
    </div>
  );
}
