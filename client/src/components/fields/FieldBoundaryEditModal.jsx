import { useCallback, useEffect, useState } from "react";
import LocationMapPicker from "../map/LocationMapPicker";
import Button from "../ui/Button";
import { Label } from "../ui/Input";
import Modal from "../ui/Modal";
import { applyLocationInsights } from "../../utils/applyLocationInsights";
import { acresFromBoundary } from "../../utils/polygonAcres";

export default function FieldBoundaryEditModal({ open, onClose, field, onSave, saving }) {
  const [draft, setDraft] = useState(() => initialDraft(field));

  useEffect(() => {
    if (open) setDraft(initialDraft(field));
  }, [open, field.id]);

  const handleLocation = useCallback(({ latitude, longitude, boundary, acres }) => {
    setDraft((prev) => ({
      ...prev,
      latitude,
      longitude,
      boundary,
      ...(acres != null ? { acres } : {})
    }));
  }, []);

  const handleInsights = useCallback((insights) => {
    setDraft((prev) => ({
      ...applyLocationInsights(
        { ...prev, acres: prev.acres != null ? String(prev.acres) : "" },
        insights,
        { includeAcres: true }
      ),
      location_meta: {
        ...(prev.location_meta || {}),
        ...(insights.location_meta || {})
      }
    }));
  }, []);

  const polygonAcres = acresFromBoundary(draft.boundary);

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave({
      latitude: draft.latitude,
      longitude: draft.longitude,
      boundary: draft.boundary,
      acres: draft.acres != null ? Number(draft.acres) : field.acres,
      location_meta: draft.location_meta
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit field boundary">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Field boundary</Label>
          <LocationMapPicker
            mode="polygon"
            latitude={draft.latitude}
            longitude={draft.longitude}
            boundary={draft.boundary}
            onLocationChange={handleLocation}
            onInsights={handleInsights}
          />
        </div>
        {polygonAcres != null && (
          <p className="text-sm text-fm-teal">
            From polygon: {polygonAcres.toLocaleString(undefined, { maximumFractionDigits: 1 })} ac
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save boundary"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function initialDraft(field) {
  return {
    latitude: field.latitude,
    longitude: field.longitude,
    boundary: field.boundary,
    acres: field.acres,
    location_meta: field.location_meta || {}
  };
}
