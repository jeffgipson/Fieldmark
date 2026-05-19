import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import * as farmsApi from "../api/farms";
import * as fieldsApi from "../api/fields";
import LocationMapPicker from "../components/map/LocationMapPicker";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import { FIELD_COMMODITIES } from "../constants/app";
import { useFarm } from "../contexts/FarmContext";
import { applyLocationInsights } from "../utils/applyLocationInsights";
import { acresFromBoundary } from "../utils/polygonAcres";
import { formatCommodity, formatRegion } from "../utils/format";
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

export default function FarmPage() {
  const { farm, fields, refresh, setFarm } = useFarm();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fieldLocationMeta, setFieldLocationMeta] = useState(null);
  const [newField, setNewField] = useState(EMPTY_FIELD);

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

  if (!farm) {
    return (
      <PageHeader title="My Farm" subtitle="Create your farm from registration or add one below." />
    );
  }

  const p = profile || farm;

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
      setNewField(EMPTY_FIELD);
      setFieldLocationMeta(null);
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
          <Button variant="ghost" onClick={() => { setProfile(farm); setEditing(!editing); }}>
            {editing ? "Cancel" : "Edit profile"}
          </Button>
        }
      />

      <Card className="mb-8">
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
            <div><dt className="text-xs font-bold uppercase text-fm-gray-medium">Acres</dt><dd>{farm.total_acres}</dd></div>
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
      </Card>

      <h2 className="font-display mb-4 text-xl font-semibold">Fields</h2>
      <div className="mb-6 space-y-3">
        {fields.map((field) => (
          <Card key={field.id} className="!p-4 flex justify-between items-center">
            <div>
              <p className="font-bold">{field.name}</p>
              <p className="text-sm text-fm-gray-medium">
                {field.acres} ac · {formatCommodity(field.primary_commodity)}
                {field.boundary ? " · mapped" : ""}
              </p>
            </div>
            <Link to={`/fields/${field.id}/costs`} className="text-fm-teal font-bold text-sm hover:underline">
              Enter costs →
            </Link>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-display mb-4 font-semibold">Add field</h3>
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
          <div className="sm:col-span-2"><Button type="submit">Add field</Button></div>
        </form>
      </Card>
      {error && <p className="mt-4 text-fm-alert">{error}</p>}
    </div>
  );
}
