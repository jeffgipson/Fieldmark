import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as farmsApi from "../api/farms";
import * as fieldsApi from "../api/fields";
import FarmCoverPhoto from "../components/farm/FarmCoverPhoto";
import FarmFinancialSummary from "../components/farm/FarmFinancialSummary";
import LocationMapPicker from "../components/map/LocationMapPicker";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { COMMODITIES, FIELD_COMMODITIES, REGIONS } from "../constants/app";
import { useFarm } from "../contexts/FarmContext";
import { applyLocationInsights } from "../utils/applyLocationInsights";
import { acresFromBoundary } from "../utils/polygonAcres";
import { formatCommodity, formatCurrency, formatAcres, formatPerAcre, formatRegion } from "../utils/format";
import { friendlyError } from "../utils/errors";

const EMPTY_FIELD = {
  name: "",
  acres: "",
  soil_type: "Silt loam",
  primary_commodity: "corn",
  latitude: null,
  longitude: null,
  boundary: null
};

const EMPTY_FARM = {
  name: "",
  total_acres: "",
  county: "",
  region: "central",
  primary_commodity: "corn"
};

export default function FarmPage() {
  const {
    farm,
    farms,
    fields,
    refresh,
    setFarm,
    loading,
    error: loadError,
    canCreateFarm,
    canAddField,
    plan,
    limits,
    primaryScenario
  } = useFarm();
  const [summary, setSummary] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fieldLocationMeta, setFieldLocationMeta] = useState(null);
  const [newField, setNewField] = useState(EMPTY_FIELD);
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [addFarmModalOpen, setAddFarmModalOpen] = useState(false);
  const [newFarm, setNewFarm] = useState(EMPTY_FARM);

  function resetAddFieldForm() {
    setNewField({
      ...EMPTY_FIELD,
      ...(farm?.latitude != null && farm?.longitude != null
        ? { latitude: farm.latitude, longitude: farm.longitude }
        : {})
    });
    setFieldLocationMeta(null);
  }

  function closeAddFieldModal() {
    setAddFieldOpen(false);
    resetAddFieldForm();
  }

  function openAddFieldModal() {
    resetAddFieldForm();
    setAddFieldOpen(true);
  }

  useEffect(() => {
    if (farm?.latitude == null || farm?.longitude == null) return;
    setNewField((prev) => {
      if (prev.latitude != null && prev.longitude != null) return prev;
      return { ...prev, latitude: farm.latitude, longitude: farm.longitude };
    });
  }, [farm?.latitude, farm?.longitude]);

  useEffect(() => {
    if (!farm?.id) {
      setSummary(null);
      return;
    }
    farmsApi
      .getFarmSummary(farm.id, { scenarioId: primaryScenario?.id })
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [farm?.id, primaryScenario?.id, primaryScenario?.results]);

  const summaryFieldsById = useMemo(() => {
    const map = {};
    (summary?.fields || []).forEach((f) => {
      map[f.field_id] = f;
    });
    return map;
  }, [summary]);

  const handleProfileLocation = useCallback(({ latitude, longitude, boundary }) => {
    setProfile((prev) => ({
      ...(prev || farm),
      latitude,
      longitude,
      boundary
    }));
  }, [farm]);

  const handleProfileInsights = useCallback((insights) => {
    setProfile((prev) => ({
      ...applyLocationInsights(prev || farm, insights),
      location_meta: insights.location_meta
    }));
  }, [farm]);

  const handleFieldLocation = useCallback(({ latitude, longitude, boundary, acres }) => {
    setNewField((prev) => ({
      ...prev,
      latitude,
      longitude,
      boundary,
      ...(acres != null ? { acres: String(acres) } : {})
    }));
  }, []);

  const polygonAcres = acresFromBoundary(newField.boundary);

  const handleFieldInsights = useCallback((insights) => {
    setFieldLocationMeta(insights.location_meta);
    setNewField((prev) => applyLocationInsights(prev, insights, { includeAcres: true }));
  }, []);

  async function createFarm(e) {
    e.preventDefault();
    try {
      await farmsApi.createFarm({
        name: newFarm.name,
        total_acres: Number(newFarm.total_acres),
        county: newFarm.county,
        region: newFarm.region,
        primary_commodity: newFarm.primary_commodity
      });
      setNewFarm(EMPTY_FARM);
      refresh();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  if (!farm) {
    return (
      <div>
        <PageHeader title="My Farm" subtitle="Set up your farm to start planning margins." />
        {loading ? (
          <p className="text-fm-gray-medium">Loading farm…</p>
        ) : (
          <div className="mt-4 space-y-3">
            {loadError && <p className="text-fm-alert">{loadError}</p>}
            {error && <p className="text-fm-alert">{error}</p>}
            {canCreateFarm ? (
              <Card>
                <form onSubmit={createFarm} className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Farm name</Label>
                    <Input value={newFarm.name} onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Total acres</Label>
                    <Input type="number" value={newFarm.total_acres} onChange={(e) => setNewFarm({ ...newFarm, total_acres: e.target.value })} required />
                  </div>
                  <div>
                    <Label>County</Label>
                    <Input value={newFarm.county} onChange={(e) => setNewFarm({ ...newFarm, county: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Region</Label>
                    <select className="w-full rounded-lg border px-4 py-3" value={newFarm.region} onChange={(e) => setNewFarm({ ...newFarm, region: e.target.value })}>
                      {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Primary commodity</Label>
                    <select className="w-full rounded-lg border px-4 py-3" value={newFarm.primary_commodity} onChange={(e) => setNewFarm({ ...newFarm, primary_commodity: e.target.value })}>
                      {COMMODITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit">Create farm</Button>
                  </div>
                </form>
              </Card>
            ) : (
              <p className="text-sm text-fm-gray-medium">
                Your plan includes one farm. <Link to="/profile#billing" className="font-bold text-fm-teal hover:underline">Upgrade to Pro</Link> to add another.
              </p>
            )}
            <Button variant="secondary" onClick={refresh}>
              Refresh data
            </Button>
          </div>
        )}
      </div>
    );
  }

  const p = profile || farm;
  const showAddFarm = canCreateFarm && plan === "pro" && farms.length >= 1;
  const fieldLimit = limits?.max_fields_per_farm;

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const updated = await farmsApi.updateFarm(farm.id, {
        name: p.name,
        total_acres: p.total_acres,
        county: p.county,
        region: p.region,
        primary_commodity: p.primary_commodity,
        latitude: p.latitude,
        longitude: p.longitude,
        location_meta: p.location_meta
      });
      setFarm(updated);
      setEditing(false);
      refresh();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  async function addField(e) {
    e.preventDefault();
    try {
      await fieldsApi.createField(farm.id, {
        name: newField.name,
        acres: Number(newField.acres),
        soil_type: newField.soil_type,
        primary_commodity: newField.primary_commodity,
        latitude: newField.latitude,
        longitude: newField.longitude,
        boundary: newField.boundary,
        location_meta: fieldLocationMeta || {}
      });
      closeAddFieldModal();
      refresh();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="My Farm"
        subtitle={`${farm.name} · ${formatRegion(farm.region)} Missouri`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canAddField ? (
              <Button type="button" onClick={openAddFieldModal}>
                Add field
              </Button>
            ) : (
              <Button type="button" variant="secondary" disabled>
                Field limit reached
              </Button>
            )}
            {showAddFarm && (
              <Button type="button" variant="secondary" onClick={() => setAddFarmModalOpen(true)}>
                Add farm
              </Button>
            )}
            <Button variant="ghost" onClick={() => { setProfile(farm); setEditing(!editing); }}>
              {editing ? "Cancel" : "Edit profile"}
            </Button>
          </div>
        }
      />

      <Card className="mb-8 !p-0 overflow-hidden" hover={false}>
        <FarmCoverPhoto
          farm={farm}
          onUpdated={(updated) => {
            setFarm(updated);
            refresh();
          }}
        />
        <div className="p-6">
        {editing ? (
          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Farm location</Label>
              <LocationMapPicker
                mode="point"
                latitude={p.latitude}
                longitude={p.longitude}
                onLocationChange={handleProfileLocation}
                onInsights={handleProfileInsights}
              />
            </div>
            <div><Label>Name</Label><Input value={p.name} onChange={(e) => setProfile({ ...p, name: e.target.value })} /></div>
            <div><Label>Total acres</Label><Input type="number" value={p.total_acres} onChange={(e) => setProfile({ ...p, total_acres: e.target.value })} /></div>
            <div><Label>County</Label><Input value={p.county} onChange={(e) => setProfile({ ...p, county: e.target.value })} /></div>
            <div><Label>Commodity</Label><Input value={p.primary_commodity} onChange={(e) => setProfile({ ...p, primary_commodity: e.target.value })} /></div>
            <div className="sm:col-span-2"><Button type="submit">Save profile</Button></div>
          </form>
        ) : (
          <dl className="grid gap-2 sm:grid-cols-2 text-fm-charcoal">
            <div><dt className="text-xs font-bold uppercase text-fm-gray-medium">Acres</dt><dd>{formatAcres(farm.total_acres)}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-fm-gray-medium">County</dt><dd>{farm.county}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-fm-gray-medium">Region</dt><dd>{formatRegion(farm.region)}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-fm-gray-medium">Commodity</dt><dd>{formatCommodity(farm.primary_commodity)}</dd></div>
            {farm.latitude != null && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase text-fm-gray-medium">Location</dt>
                <dd className="text-sm">
                  {Number(farm.latitude).toFixed(4)}°, {Number(farm.longitude).toFixed(4)}°
                </dd>
              </div>
            )}
          </dl>
        )}
        </div>
      </Card>

      {!canAddField && fieldLimit != null && (
        <p className="mb-4 text-sm text-fm-gray-medium">
          Basic plan includes up to {fieldLimit} fields.{" "}
          <Link to="/profile#billing" className="font-bold text-fm-teal hover:underline">
            Upgrade to Pro
          </Link>{" "}
          to add more.
        </p>
      )}

      <FarmFinancialSummary summary={summary} primaryScenarioId={primaryScenario?.id} />

      <h2 className="font-display mb-4 text-xl font-semibold">Fields</h2>
      <div className="mb-6 space-y-3">
        {fields.length === 0 && (
          <p className="text-sm text-fm-gray-medium">
            No fields yet. Add your first field to start entering costs.
          </p>
        )}
        {fields.map((field) => {
          const fin = summaryFieldsById[field.id];
          const hasRisk = fin?.risk_profile?.flood_events_last_5_years >= 3 || fin?.risk_profile?.bottomland;
          return (
            <Card key={field.id} className="!p-4 flex justify-between items-start gap-4">
              <div>
                <p className="font-bold">
                  {field.name}
                  {hasRisk && (
                    <span className="ml-2 rounded bg-fm-gold/20 px-2 py-0.5 text-xs font-bold text-fm-charcoal">
                      Risk
                    </span>
                  )}
                </p>
                <p className="text-sm text-fm-gray-medium">
                  {formatAcres(field.acres)} · {formatCommodity(field.primary_commodity)}
                  {field.boundary ? " · mapped" : ""}
                </p>
                {fin?.operating_cost_per_acre > 0 && (
                  <p className="mt-1 text-sm text-fm-charcoal">
                    {formatPerAcre(fin.operating_cost_per_acre)} · {formatCurrency(fin.total_operating_dollars)} total
                  </p>
                )}
                {fin?.margin?.base_margin_per_acre != null && (
                  <p className="text-sm text-fm-teal">
                    Base margin {formatPerAcre(fin.margin.base_margin_per_acre)}
                    {fin.margin.share_of_farm_base_margin != null &&
                      ` · ${fin.margin.share_of_farm_base_margin}% of farm`}
                  </p>
                )}
              </div>
              <Link to={`/fields/${field.id}/costs`} className="shrink-0 text-fm-teal font-bold text-sm hover:underline">
                View details →
              </Link>
            </Card>
          );
        })}
      </div>

      <Modal open={addFarmModalOpen} onClose={() => setAddFarmModalOpen(false)} title="Add farm">
        <form
          onSubmit={async (e) => {
            await createFarm(e);
            setAddFarmModalOpen(false);
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label>Farm name</Label>
            <Input value={newFarm.name} onChange={(ev) => setNewFarm({ ...newFarm, name: ev.target.value })} required />
          </div>
          <div>
            <Label>Total acres</Label>
            <Input type="number" value={newFarm.total_acres} onChange={(ev) => setNewFarm({ ...newFarm, total_acres: ev.target.value })} required />
          </div>
          <div>
            <Label>County</Label>
            <Input value={newFarm.county} onChange={(ev) => setNewFarm({ ...newFarm, county: ev.target.value })} required />
          </div>
          <div>
            <Label>Region</Label>
            <select className="w-full rounded-lg border px-4 py-3" value={newFarm.region} onChange={(ev) => setNewFarm({ ...newFarm, region: ev.target.value })}>
              {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Primary commodity</Label>
            <select className="w-full rounded-lg border px-4 py-3" value={newFarm.primary_commodity} onChange={(ev) => setNewFarm({ ...newFarm, primary_commodity: ev.target.value })}>
              {COMMODITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <Button type="submit">Create farm</Button>
            <Button type="button" variant="ghost" onClick={() => setAddFarmModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal open={addFieldOpen} onClose={closeAddFieldModal} title="Add field">
        <form onSubmit={addField} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Field boundary</Label>
            <LocationMapPicker
              mode="polygon"
              latitude={newField.latitude}
              longitude={newField.longitude}
              boundary={newField.boundary}
              onLocationChange={handleFieldLocation}
              onInsights={handleFieldInsights}
            />
          </div>
          <div><Label>Field name</Label><Input value={newField.name} onChange={(e) => setNewField({ ...newField, name: e.target.value })} required /></div>
          <div>
            <Label>Acres</Label>
            <Input
              type="number"
              step="0.1"
              value={newField.acres}
              onChange={(e) => setNewField({ ...newField, acres: e.target.value })}
              required
            />
            {polygonAcres != null && (
              <p className="mt-1 text-xs text-fm-teal">
                From polygon: {polygonAcres.toLocaleString(undefined, { maximumFractionDigits: 1 })} ac (editable)
              </p>
            )}
          </div>
          <div><Label>Soil type</Label><Input value={newField.soil_type} onChange={(e) => setNewField({ ...newField, soil_type: e.target.value })} /></div>
          <div>
            <Label>Commodity</Label>
            <select className="w-full rounded-lg border px-4 py-3" value={newField.primary_commodity} onChange={(e) => setNewField({ ...newField, primary_commodity: e.target.value })}>
              {FIELD_COMMODITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button type="submit">Add field</Button>
            <Button type="button" variant="ghost" onClick={closeAddFieldModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      {error && <p className="mt-4 text-fm-alert">{error}</p>}
    </div>
  );
}
