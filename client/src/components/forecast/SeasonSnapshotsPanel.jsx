import { useCallback, useEffect, useState } from "react";
import * as seasonSnapshotsApi from "../../api/seasonSnapshots";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input, { Label } from "../ui/Input";
import { PLANNING_YEAR } from "../../constants/app";
import { friendlyError } from "../../utils/errors";
import HistoryCsvUploadPanel from "./HistoryCsvUploadPanel";

const EMPTY = {
  season_year: String(PLANNING_YEAR - 1),
  actual_yield: "",
  actual_price: "",
  actual_total_operating_per_acre: "",
  notes: ""
};

export default function SeasonSnapshotsPanel({ farmId, onChanged }) {
  const [snapshots, setSnapshots] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!farmId) return;
    try {
      const list = await seasonSnapshotsApi.listSeasonSnapshots(farmId);
      setSnapshots(Array.isArray(list) ? list : []);
    } catch {
      setSnapshots([]);
    }
  }, [farmId]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(snapshot) {
    setEditingId(snapshot.id);
    setForm({
      season_year: String(snapshot.season_year),
      actual_yield: snapshot.actual_yield != null ? String(snapshot.actual_yield) : "",
      actual_price: snapshot.actual_price != null ? String(snapshot.actual_price) : "",
      actual_total_operating_per_acre:
        snapshot.actual_total_operating_per_acre != null
          ? String(snapshot.actual_total_operating_per_acre)
          : "",
      notes: snapshot.notes || ""
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      season_year: Number(form.season_year),
      actual_yield: form.actual_yield === "" ? null : Number(form.actual_yield),
      actual_price: form.actual_price === "" ? null : Number(form.actual_price),
      actual_total_operating_per_acre:
        form.actual_total_operating_per_acre === "" ? null : Number(form.actual_total_operating_per_acre),
      notes: form.notes || null,
      source: "farmer_entered"
    };
    try {
      if (editingId) {
        await seasonSnapshotsApi.updateSeasonSnapshot(farmId, editingId, payload);
      } else {
        await seasonSnapshotsApi.createSeasonSnapshot(farmId, payload);
      }
      resetForm();
      await load();
      onChanged?.();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this season record?")) return;
    setSaving(true);
    try {
      await seasonSnapshotsApi.deleteSeasonSnapshot(farmId, id);
      if (editingId === id) resetForm();
      await load();
      onChanged?.();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
  <>
    <HistoryCsvUploadPanel farmId={farmId} onImported={load} />
    <Card className="mt-6">
      <p className="fm-eyebrow">After harvest</p>
      <h3 className="font-display mt-1 text-lg font-semibold">Season actuals</h3>
      <p className="mt-1 text-sm text-fm-gray-medium">
        Record what actually happened so next year&apos;s forecast can compare plan vs reality.
      </p>

      {snapshots.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm">
          {snapshots.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-fm-gray-light px-3 py-2"
            >
              <span>
                <strong>{s.season_year}</strong>
                {s.actual_total_operating_per_acre != null && (
                  <> · ${Number(s.actual_total_operating_per_acre).toFixed(0)}/ac operating</>
                )}
                {s.actual_yield != null && <> · {s.actual_yield} bu/ac</>}
              </span>
              <span className="flex gap-2">
                <button type="button" className="text-fm-teal font-bold text-xs" onClick={() => startEdit(s)}>
                  Edit
                </button>
                <button type="button" className="text-fm-alert text-xs" onClick={() => handleDelete(s.id)}>
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Season year</Label>
          <Input
            type="number"
            value={form.season_year}
            onChange={(e) => setForm({ ...form, season_year: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Actual yield (bu/ac)</Label>
          <Input
            type="number"
            value={form.actual_yield}
            onChange={(e) => setForm({ ...form, actual_yield: e.target.value })}
          />
        </div>
        <div>
          <Label>Actual price ($/bu)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.actual_price}
            onChange={(e) => setForm({ ...form, actual_price: e.target.value })}
          />
        </div>
        <div>
          <Label>Operating cost ($/ac)</Label>
          <Input
            type="number"
            value={form.actual_total_operating_per_acre}
            onChange={(e) => setForm({ ...form, actual_total_operating_per_acre: e.target.value })}
          />
        </div>
        <div>
          <Label>Notes</Label>
          <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Update season" : "Add season record"}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" className="ml-2" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>
      {error && <p className="mt-2 text-sm text-fm-alert">{error}</p>}
    </Card>
  </>
  );
}
