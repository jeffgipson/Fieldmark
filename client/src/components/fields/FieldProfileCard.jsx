import { useState } from "react";
import { MapPin, Pencil } from "lucide-react";
import FieldBoundaryMap from "../map/FieldBoundaryMap";
import Card from "../ui/Card";
import InlineEditable from "../ui/InlineEditable";
import Button from "../ui/Button";
import FieldCoverPhoto from "./FieldCoverPhoto";
import FieldBoundaryEditModal from "./FieldBoundaryEditModal";
import FieldDescription from "./FieldDescription";
import { FIELD_COMMODITIES } from "../../constants/app";
import { formatAcres as formatAcresUtil, formatCommodity, formatRegion } from "../../utils/format";
import { acresFromBoundary } from "../../utils/polygonAcres";

function profileMeta(field) {
  const meta = field?.location_meta || {};
  const geocode = meta.geocode || {};
  return {
    displayName: geocode.display_name || meta.display_name || null,
    county: geocode.county || meta.county || null,
    stateCode: geocode.state_code || meta.state_code || null,
    region: meta.inferred_region || meta.region || null
  };
}

function StatChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-fm-gray-light/90 bg-white/90 px-3 py-1 text-xs font-semibold text-fm-charcoal shadow-sm">
      {children}
    </span>
  );
}

function ReadOnlyFact({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-fm-cream/60 px-3 py-2.5">
      <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-fm-gray-medium">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-fm-ink">{value}</dd>
    </div>
  );
}

export default function FieldProfileCard({ farmId, field, farm, onFieldChange }) {
  const [boundaryOpen, setBoundaryOpen] = useState(false);
  const [boundarySaving, setBoundarySaving] = useState(false);

  const meta = profileMeta(field);
  const polygonAcres = acresFromBoundary(field.boundary);
  const countyLabel =
    meta.county && meta.stateCode
      ? `${meta.county}, ${meta.stateCode}`
      : meta.county || farm?.county || null;
  const regionLabel = meta.region || farm?.region;

  async function saveField(key, rawValue) {
    let value = rawValue;
    if (key === "acres") {
      value = Number(rawValue);
      if (!Number.isFinite(value) || value <= 0) throw new Error("Enter a valid acreage");
    }
    await onFieldChange({ [key]: value });
  }

  async function saveBoundary(updates) {
    setBoundarySaving(true);
    try {
      await onFieldChange(updates);
      setBoundaryOpen(false);
    } finally {
      setBoundarySaving(false);
    }
  }

  return (
    <>
      <Card className="!p-0 overflow-hidden shadow-[var(--shadow-fm-panel)] animate-fm-in" hover={false}>
        <FieldCoverPhoto farmId={farmId} field={field} farm={farm} onUpdated={onFieldChange} />

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div>
            <InlineEditable
              label="Field name"
              value={field.name}
              onSave={(v) => saveField("name", v.trim())}
              placeholder="Name this field"
              definitionList={false}
              inputClassName="!text-xl !font-display !font-bold"
            />
            {meta.displayName && (
              <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-fm-gray-medium">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fm-teal" aria-hidden />
                <span className="line-clamp-2">{meta.displayName}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <StatChip>{field.acres != null ? formatAcresUtil(field.acres) : "—"}</StatChip>
            <StatChip>{formatCommodity(field.primary_commodity)}</StatChip>
            {field.soil_type && <StatChip>{field.soil_type}</StatChip>}
          </div>

          <p className="text-xs text-fm-gray-medium">
            <Pencil className="mr-1 inline h-3 w-3 text-fm-teal" aria-hidden />
            Click any detail below to update
          </p>
        </div>

        <FieldDescription farmId={farmId} field={field} onFieldChange={onFieldChange} />

        <div className="border-t border-fm-gray-light/80 bg-fm-teal-subtle/20 px-5 py-4 sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-fm-gray-medium">
              Field boundary
            </p>
            <Button
              type="button"
              variant="secondary"
              className="!rounded-lg !px-3 !py-1.5 !text-xs"
              onClick={() => setBoundaryOpen(true)}
            >
              Edit map
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl ring-1 ring-fm-gray-light/80">
            <FieldBoundaryMap
              boundary={field.boundary}
              latitude={field.latitude}
              longitude={field.longitude}
              mapClassName="fm-location-map !h-[200px] !rounded-none !border-0"
            />
          </div>
        </div>

        <dl className="grid gap-2.5 px-5 py-5 sm:grid-cols-2 sm:px-6">
          <InlineEditable
            label="Acres"
            type="number"
            value={field.acres != null ? String(field.acres) : ""}
            displayValue={
              field.acres != null
                ? Number(field.acres).toLocaleString(undefined, { maximumFractionDigits: 1 })
                : null
            }
            suffix="ac"
            onSave={(v) => saveField("acres", v)}
          />
          {polygonAcres != null && Number(field.acres) !== polygonAcres && (
            <>
              <ReadOnlyFact label="From boundary" value={formatAcresUtil(polygonAcres)} />
              <p className="col-span-full text-xs text-fm-gray-medium">
                Boundary estimate from your drawn shape; planted acres may differ from FSA records.
              </p>
            </>
          )}
          <InlineEditable
            label="Soil type"
            value={field.soil_type}
            onSave={(v) => saveField("soil_type", v.trim())}
            placeholder="e.g. Silt loam"
          />
          <InlineEditable
            label="Crop"
            type="select"
            value={field.primary_commodity}
            displayValue={formatCommodity(field.primary_commodity)}
            options={FIELD_COMMODITIES}
            onSave={(v) => saveField("primary_commodity", v)}
          />
          <ReadOnlyFact label="County" value={countyLabel} />
          <ReadOnlyFact label="Benchmark region" value={regionLabel ? formatRegion(regionLabel) : null} />
          {field.latitude != null && field.longitude != null && (
            <ReadOnlyFact
              label="Center"
              value={`${Number(field.latitude).toFixed(4)}°, ${Number(field.longitude).toFixed(4)}°`}
            />
          )}
        </dl>
      </Card>

      <FieldBoundaryEditModal
        open={boundaryOpen}
        onClose={() => setBoundaryOpen(false)}
        field={field}
        onSave={saveBoundary}
        saving={boundarySaving}
      />
    </>
  );
}
