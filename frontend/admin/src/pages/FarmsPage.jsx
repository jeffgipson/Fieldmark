import { useEffect, useState } from "react";
import { listFarms, updateFarm } from "../api/farms";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input, { Label } from "../components/ui/Input";
import Modal from "../components/ui/Modal";

const SELECT_CLASS =
  "w-full rounded-lg border-[1.5px] border-fm-input-border bg-white px-4 py-3 text-base text-fm-charcoal focus:border-fm-teal focus:outline-none focus:ring-[3px] focus:ring-fm-teal/15";

export default function FarmsPage() {
  const [farms, setFarms] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadFarms() {
    try {
      setLoading(true);
      const { data, meta: pagination } = await listFarms({ per_page: 100 });
      setFarms(data);
      setMeta(pagination);
      setError(null);
    } catch {
      setError("Failed to load farms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFarms();
  }, []);

  async function saveFarm() {
    if (!editing) return;
    try {
      setSaving(true);
      await updateFarm(editing.id, {
        name: editing.name,
        county: editing.county,
        region: editing.region,
        total_acres: editing.total_acres,
        primary_commodity: editing.primary_commodity,
      });
      setEditing(null);
      await loadFarms();
    } catch {
      setError("Failed to update farm.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error && !editing) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <PageHeader
        title="Farms"
        subtitle={meta ? `${meta.total} farms in the system` : undefined}
      />
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <div className="space-y-3">
        {farms.map((farm) => (
          <Card key={farm.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display font-semibold">{farm.name}</p>
              <p className="text-sm text-fm-gray-medium">
                {farm.county} · {farm.region} · {farm.total_acres} ac
              </p>
              {farm.user && (
                <p className="mt-1 text-xs text-fm-gray-medium">
                  Owner: {farm.user.first_name} {farm.user.last_name} ({farm.user.email})
                </p>
              )}
            </div>
            <Button variant="secondary" onClick={() => setEditing({ ...farm })}>
              Edit
            </Button>
          </Card>
        ))}
        {farms.length === 0 && (
          <p className="text-fm-gray-medium">
            No farms yet. Run <code className="text-sm">cd api && bin/rails db:seed</code> to load sample data.
          </p>
        )}
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name}` : undefined}
        placement="mainPanel"
      >
        {editing && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="edit-farm-name">Farm name</Label>
                <Input
                  id="edit-farm-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-farm-county">County</Label>
                <Input
                  id="edit-farm-county"
                  value={editing.county}
                  onChange={(e) => setEditing({ ...editing, county: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-farm-acres">Total acres</Label>
                <Input
                  id="edit-farm-acres"
                  type="number"
                  min="0"
                  step="0.1"
                  value={editing.total_acres}
                  onChange={(e) => setEditing({ ...editing, total_acres: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-farm-region">Region</Label>
                <select
                  id="edit-farm-region"
                  className={SELECT_CLASS}
                  value={editing.region}
                  onChange={(e) => setEditing({ ...editing, region: e.target.value })}
                >
                  <option value="northern">northern</option>
                  <option value="central">central</option>
                  <option value="southwest">southwest</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-farm-commodity">Primary commodity</Label>
                <select
                  id="edit-farm-commodity"
                  className={SELECT_CLASS}
                  value={editing.primary_commodity}
                  onChange={(e) => setEditing({ ...editing, primary_commodity: e.target.value })}
                >
                  <option value="corn">corn</option>
                  <option value="soybean">soybean</option>
                  <option value="both">both</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={saveFarm} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
