import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import * as fieldsApi from "../api/fields";
import * as inputCostsApi from "../api/inputCosts";
import FieldProfileCard from "../components/fields/FieldProfileCard";
import FieldRiskForm from "../components/fields/FieldRiskForm";
import InputCostsPanel from "../components/fields/InputCostsPanel";
import LoadingDale from "../components/ui/LoadingDale";
import { BENCHMARK_REFERENCE, INPUT_CATEGORIES, PLANNING_YEAR } from "../constants/app";
import { useFarm } from "../contexts/FarmContext";
import { formatAcres, formatCommodity } from "../utils/format";
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

  const ref = BENCHMARK_REFERENCE[farm?.primary_commodity === "soybean" ? "soybean" : "corn"];

  const acres = Number(field?.acres) || 0;
  const totalPerAcre = useMemo(
    () => INPUT_CATEGORIES.reduce((sum, { key }) => sum + (Number(costs[key]) || 0), 0),
    [costs]
  );

  async function handleFieldChange(updates) {
    const updated =
      updates?.id != null
        ? updates
        : await fieldsApi.updateField(farm.id, fieldId, updates);
    setField(updated);
    await refresh();
    return updated;
  }

  function handleCostChange(key, value) {
    setCosts((prev) => ({ ...prev, [key]: value }));
  }

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
    <div className="mx-auto max-w-6xl animate-fm-in">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        <Link to="/farm" className="font-medium text-fm-gray-medium transition hover:text-fm-teal">
          My Farm
        </Link>
        <ChevronRight className="h-4 w-4 text-fm-gray-medium" aria-hidden />
        <span className="font-semibold text-fm-ink">{field.name}</span>
        <span className="hidden text-fm-gray-medium sm:inline">·</span>
        <span className="hidden text-fm-gray-medium sm:inline">
          {formatAcres(field.acres)} · {formatCommodity(field.primary_commodity)}
        </span>
      </nav>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,22rem)_1fr] xl:items-start">
        <FieldProfileCard
          farmId={farm.id}
          field={field}
          farm={farm}
          onFieldChange={handleFieldChange}
        />
        <div>
          <InputCostsPanel
            categories={INPUT_CATEGORIES}
            costs={costs}
            onCostChange={handleCostChange}
            acres={acres}
            totalPerAcre={totalPerAcre}
            benchmarkRef={ref}
            saving={saving}
            error={error}
            onSave={handleSave}
          />
          <FieldRiskForm
            farmId={farm.id}
            fieldId={fieldId}
            primaryScenarioId={primaryScenario?.id}
            onSaved={refresh}
          />
        </div>
      </div>
    </div>
  );
}
