import { useEffect, useState } from "react";
import { listBenchmarkRegions, updateBenchmarkRegion } from "../api/benchmarks";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input, { Label } from "../components/ui/Input";
import Modal from "../components/ui/Modal";

const COST_FIELDS = [
  { key: "seed_cost_per_acre", label: "Seed ($/ac)" },
  { key: "fertilizer_cost_per_acre", label: "Fertilizer ($/ac)" },
  { key: "chemicals_cost_per_acre", label: "Chemicals ($/ac)" },
  { key: "labor_cost_per_acre", label: "Labor ($/ac)" },
  { key: "total_operating_cost_per_acre", label: "Total operating ($/ac)" },
  { key: "total_cost_per_acre", label: "Total w/ ownership ($/ac)" }
];

function benchmarkTitle(r) {
  const parts = [r.region, r.commodity, r.season_year].filter(Boolean);
  if (r.irrigation && r.irrigation !== "dryland") parts.push(r.irrigation);
  return parts.join(" · ");
}

export default function BenchmarksPage() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await listBenchmarkRegions();
      setRegions(data);
    } catch (err) {
      setError(err?.message || "Failed to load benchmarks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openEdit(region) {
    setEditing({
      ...region,
      retrieved_on: region.retrieved_on ? String(region.retrieved_on).slice(0, 10) : ""
    });
  }

  function setField(key, value) {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        seed_cost_per_acre: Number(editing.seed_cost_per_acre),
        fertilizer_cost_per_acre: Number(editing.fertilizer_cost_per_acre),
        chemicals_cost_per_acre: Number(editing.chemicals_cost_per_acre),
        labor_cost_per_acre: Number(editing.labor_cost_per_acre),
        total_operating_cost_per_acre: Number(editing.total_operating_cost_per_acre),
        total_cost_per_acre: Number(editing.total_cost_per_acre),
        assumed_yield: Number(editing.assumed_yield),
        assumed_price: Number(editing.assumed_price),
        source: editing.source,
        source_url: editing.source_url || "",
        retrieved_on: editing.retrieved_on || null
      };
      await updateBenchmarkRegion(editing.id, payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err?.message || "Failed to save benchmark.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error && !editing && regions.length === 0) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <PageHeader
        title="Benchmarks"
        subtitle="MU Extension reference costs — edit per-acre values used for peer comparison"
      />
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <div className="space-y-3">
        {regions.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display font-semibold capitalize">{benchmarkTitle(r)}</p>
              <p className="text-sm text-fm-gray-medium">
                Operating ${r.total_operating_cost_per_acre}/ac · Total ${r.total_cost_per_acre}/ac
                {" · "}
                {r.assumed_yield} bu @ ${r.assumed_price}
              </p>
              <p className="text-xs text-fm-gray-medium mt-1">{r.source}</p>
            </div>
            <Button variant="secondary" onClick={() => openEdit(r)}>
              Edit
            </Button>
          </Card>
        ))}
        {regions.length === 0 && (
          <p className="text-fm-gray-medium">
            No benchmarks. Run <code className="text-sm">cd api && bin/rails db:seed</code>.
          </p>
        )}
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing ? `Edit ${benchmarkTitle(editing)}` : undefined}
        placement="mainPanel"
        className="max-w-2xl"
      >
        {editing && (
          <>
            <p className="mb-4 text-sm text-fm-gray-medium">
              Region, commodity, and year are fixed for this row. Update costs and assumptions below.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {COST_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <Label htmlFor={`bm-${key}`}>{label}</Label>
                  <Input
                    id={`bm-${key}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={editing[key] ?? ""}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                </div>
              ))}
              <div>
                <Label htmlFor="bm-yield">Assumed yield (bu/ac)</Label>
                <Input
                  id="bm-yield"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editing.assumed_yield ?? ""}
                  onChange={(e) => setField("assumed_yield", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bm-price">Assumed price ($/bu)</Label>
                <Input
                  id="bm-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editing.assumed_price ?? ""}
                  onChange={(e) => setField("assumed_price", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="bm-source">Source</Label>
                <Input
                  id="bm-source"
                  value={editing.source ?? ""}
                  onChange={(e) => setField("source", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="bm-source-url">Source URL</Label>
                <Input
                  id="bm-source-url"
                  type="url"
                  value={editing.source_url ?? ""}
                  onChange={(e) => setField("source_url", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bm-retrieved">Retrieved on</Label>
                <Input
                  id="bm-retrieved"
                  type="date"
                  value={editing.retrieved_on ?? ""}
                  onChange={(e) => setField("retrieved_on", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
