import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, useMap, useMapEvents } from "react-leaflet";
import * as locationsApi from "../../api/locations";
import { formatAcres } from "../../utils/polygonAcres";
import { L } from "./leafletSetup";

const MIN_ZOOM = 15;
const DEBOUNCE_MS = 600;

function MapStatus({ zoom, loading, error, emptyHint }) {
  if (zoom < MIN_ZOOM) {
    return <span className="text-fm-gray-medium">Zoom in closer to load selectable field outlines.</span>;
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
        No mapped outlines in this view. Pan to another field or use <strong>Draw manually</strong>.
      </span>
    );
  }
  return null;
}

export default function BoundaryOverlay({ enabled, onSelect, selectedId }) {
  const map = useMap();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emptyHint, setEmptyHint] = useState(false);
  const debounceRef = useRef(null);
  const requestRef = useRef(0);

  const loadForViewport = useCallback(async () => {
    if (!enabled) return;
    const zoom = map.getZoom();
    if (zoom < MIN_ZOOM) {
      setCandidates([]);
      setError(null);
      setEmptyHint(false);
      return;
    }

    const bounds = map.getBounds();
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    setEmptyHint(false);

    try {
      const list = await locationsApi.fetchBoundariesInBBox({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast()
      });
      if (requestId !== requestRef.current) return;

      const normalized = Array.isArray(list) ? list : [];
      setCandidates(normalized);
      setEmptyHint(normalized.length === 0);
    } catch {
      if (requestId !== requestRef.current) return;
      setCandidates([]);
      setEmptyHint(false);
      setError("Could not load field outlines. Try again or use Draw manually.");
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [enabled, map]);

  const scheduleLoad = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(loadForViewport, DEBOUNCE_MS);
  }, [loadForViewport]);

  useMapEvents({
    moveend: () => {
      if (enabled) scheduleLoad();
    }
  });

  useEffect(() => {
    if (enabled) scheduleLoad();
    else {
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
    return {
      color: selected ? "#0a7474" : "#0d8b8b",
      weight: selected ? 3 : 2,
      fillColor: "#0d8b8b",
      fillOpacity: selected ? 0.28 : 0.12,
      dashArray: selected ? null : "4 4"
    };
  }

  function onEachFeature(feature, layer) {
    const props = feature.properties || {};
    const acres = props.acres != null ? formatAcres(props.acres) : "";
    layer.bindTooltip(`${props.label || "Field"}${acres ? ` · ${acres}` : ""}`, {
      sticky: true
    });
    layer.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      const match = candidates.find((c) => c.id === props.id);
      if (match) onSelect?.(match);
    });
  }

  if (!enabled) return null;

  const zoom = map.getZoom();
  const showStatus = loading || error || emptyHint || zoom < MIN_ZOOM;

  return (
    <>
      {candidates.length > 0 && (
        <GeoJSON
          key={candidates.map((c) => c.id).join(",")}
          data={featureCollection}
          style={style}
          onEachFeature={onEachFeature}
        />
      )}
      {showStatus && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] max-w-xs rounded-lg bg-fm-surface/95 px-3 py-2 text-xs shadow-md">
          <MapStatus zoom={zoom} loading={loading} error={error} emptyHint={emptyHint} />
        </div>
      )}
    </>
  );
}
