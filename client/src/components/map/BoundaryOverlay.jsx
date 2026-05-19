import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, useMap, useMapEvents } from "react-leaflet";
import * as locationsApi from "../../api/locations";
import { formatAcres } from "../../utils/polygonAcres";
import { mapDebug, mapDebugWarn } from "../../utils/mapDebug";
import { L } from "./leafletSetup";

/** Outlines load at this zoom and above (matches Regrid tile min zoom). */
const MIN_ZOOM = 13;
const DEBOUNCE_MS = 600;

function MapStatus({ zoom, loading, error, emptyHint, candidateCount, trialNote }) {
  if (zoom < MIN_ZOOM) {
    return (
      <span className="text-fm-gray-medium">
        Zoom in a bit more (level {MIN_ZOOM}+) to load selectable field outlines.
      </span>
    );
  }
  if (loading) {
    return <span className="text-fm-gray-medium">Loading field outlines…</span>;
  }
  if (error) {
    return <span className="text-fm-alert">{error}</span>;
  }
  if (emptyHint) {
    return (
      <span className="text-fm-gray-medium">
        {trialNote || (
          <>
            No automatic outlines here (common in rural Missouri). Switch to <strong>Mark field</strong>{" "}
            and click two opposite corners, or use <strong>Draw shape</strong>.
          </>
        )}
      </span>
    );
  }
  return null;
}

export default function BoundaryOverlay({ enabled, onSelect, selectedId, onLoadResult }) {
  const map = useMap();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emptyHint, setEmptyHint] = useState(false);
  const [trialNote, setTrialNote] = useState(null);
  const debounceRef = useRef(null);
  const requestRef = useRef(0);
  const candidatesRef = useRef(candidates);
  candidatesRef.current = candidates;

  const loadForViewport = useCallback(async () => {
    if (!enabled) return;
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const center = map.getCenter();

    if (zoom < MIN_ZOOM) {
      mapDebug("boundaries:skip_zoom", { zoom, minZoom: MIN_ZOOM });
      setCandidates([]);
      setError(null);
      setEmptyHint(false);
      return;
    }

    const requestId = ++requestRef.current;
    const bbox = {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
      latitude: center.lat,
      longitude: center.lng
    };

    mapDebug("boundaries:fetch_start", { requestId, zoom, bbox });
    setLoading(true);
    setError(null);
    setEmptyHint(false);

    try {
      const { data: list, meta } = await locationsApi.fetchBoundariesInBBox(bbox);
      if (requestId !== requestRef.current) {
        mapDebug("boundaries:fetch_stale", { requestId });
        return;
      }

      const normalized = Array.isArray(list) ? list : [];
      setTrialNote(meta?.diagnostics?.regrid_trial_note || null);
      mapDebug("boundaries:fetch_ok", {
        requestId,
        count: normalized.length,
        labels: normalized.map((c) => c.label),
        hint:
          normalized.length === 0
            ? "API OK but no outlines — OSM may have no data here; Regrid may return 0 on trial plans. Use Mark field."
            : "Click a teal outline to select"
      });
      setCandidates(normalized);
      setEmptyHint(normalized.length === 0);
      onLoadResult?.({ count: normalized.length, zoom, diagnostics: meta?.diagnostics });
    } catch (err) {
      if (requestId !== requestRef.current) return;
      mapDebugWarn("boundaries:fetch_error", { requestId, message: err?.message });
      setCandidates([]);
      setEmptyHint(false);
      setError("Could not load field outlines. Try again or use Draw manually.");
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [enabled, map, onLoadResult]);

  const scheduleLoad = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(loadForViewport, DEBOUNCE_MS);
  }, [loadForViewport]);

  useMapEvents({
    moveend: () => {
      if (!enabled) return;
      mapDebug("map:moveend", { zoom: map.getZoom(), center: map.getCenter() });
      scheduleLoad();
    },
    zoomend: () => {
      if (!enabled) return;
      mapDebug("map:zoomend", { zoom: map.getZoom() });
    }
  });

  useEffect(() => {
    if (enabled) {
      mapDebug("boundaries:enabled");
      scheduleLoad();
    } else {
      setCandidates([]);
      setError(null);
      setEmptyHint(false);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [enabled, scheduleLoad]);

  const featureCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: candidates.map((c) => ({
        type: "Feature",
        id: c.id,
        properties: {
          id: c.id,
          label: c.label,
          acres: c.acres,
          source: c.source
        },
        geometry: c.boundary
      }))
    }),
    [candidates]
  );

  function style(feature) {
    const id = feature?.properties?.id;
    const selected = id && id === selectedId;
    const isRegrid = feature?.properties?.source === "regrid";
    const stroke = isRegrid ? "#e8c840" : "#0d8b8b";
    const fill = isRegrid ? "#e8c840" : "#0d8b8b";
    return {
      color: selected ? "#2563eb" : stroke,
      weight: selected ? 5 : isRegrid ? 3.5 : 3,
      fillColor: selected ? "#2563eb" : fill,
      fillOpacity: selected ? 0.3 : isRegrid ? 0.18 : 0.2,
      dashArray: selected || isRegrid ? null : "6 4"
    };
  }

  function onEachFeature(feature, layer) {
    const props = feature.properties || {};
    const acres = props.acres != null ? formatAcres(props.acres) : "";
    layer.bindTooltip(`${props.label || "Field"}${acres ? ` · ${acres}` : ""} — click to select`, {
      sticky: true
    });

    layer.on({
      mouseover: () => {
        layer.setStyle({ weight: 4, fillOpacity: 0.35 });
        map.getContainer().style.cursor = "pointer";
      },
      mouseout: () => {
        if (typeof layer.resetStyle === "function") {
          layer.resetStyle();
        } else {
          layer.setStyle(style(feature));
        }
        map.getContainer().style.cursor = "";
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        if (e.originalEvent) {
          e.originalEvent.boundaryLayerClick = true;
        }
        const match = candidatesRef.current.find((c) => c.id === props.id);
        mapDebug("boundaries:outline_click", { id: props.id, found: Boolean(match), label: props.label });
        if (match) onSelect?.(match);
      }
    });
  }

  if (!enabled) return null;

  const zoom = map.getZoom();
  const showStatus =
    zoom < MIN_ZOOM ||
    error ||
    (emptyHint && candidates.length === 0) ||
    (loading && candidates.length === 0);

  return (
    <>
      {candidates.length > 0 && (
        <GeoJSON
          key={candidates.map((c) => c.id).join(",")}
          data={featureCollection}
          style={style}
          onEachFeature={onEachFeature}
          pane="overlayPane"
          pathOptions={{ interactive: true }}
        />
      )}
      {loading && candidates.length > 0 && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-[1000] rounded-lg bg-fm-surface/95 px-2 py-1 text-xs text-fm-gray-medium shadow-md">
          Updating outlines…
        </div>
      )}
      {showStatus && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] max-w-xs rounded-lg bg-fm-surface/95 px-3 py-2 text-xs shadow-md">
          <MapStatus
            zoom={zoom}
            loading={loading}
            error={error}
            emptyHint={emptyHint}
            candidateCount={candidates.length}
            trialNote={trialNote}
          />
        </div>
      )}
    </>
  );
}
