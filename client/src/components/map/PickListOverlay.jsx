import { useEffect } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { formatAcres } from "../../utils/polygonAcres";
import { mapDebug } from "../../utils/mapDebug";
import { L } from "./leafletSetup";

/** Renders click-to-select parcel candidates on the map (yellow outlines). */
export default function PickListOverlay({ candidates, selectedId, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!candidates?.length) return;
    const layers = candidates
      .map((c) => c.boundary?.coordinates?.[0])
      .filter(Boolean)
      .map((ring) => ring.map(([lng, lat]) => [lat, lng]));
    if (layers.length === 0) return;
    const bounds = L.latLngBounds(layers.flat());
    mapDebug("pick_list:fit_bounds", { count: candidates.length });
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 });
  }, [candidates, map]);

  if (!candidates?.length) return null;

  const collection = {
    type: "FeatureCollection",
    features: candidates.map((c) => ({
      type: "Feature",
      id: c.id,
      properties: { id: c.id, label: c.label, acres: c.acres, source: c.source },
      geometry: c.boundary
    }))
  };

  function style(feature) {
    const id = feature?.properties?.id;
    const selected = id && id === selectedId;
    return {
      color: selected ? "#2563eb" : "#f0c419",
      weight: selected ? 5 : 3.5,
      fillColor: selected ? "#2563eb" : "#f0c419",
      fillOpacity: selected ? 0.35 : 0.22
    };
  }

  function onEachFeature(feature, layer) {
    const props = feature.properties || {};
    layer.bindTooltip(`${props.label || "Parcel"} — click to select`, { sticky: true });
    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        if (e.originalEvent) e.originalEvent.boundaryLayerClick = true;
        const match = candidates.find((c) => c.id === props.id);
        if (match) onSelect?.(match);
      }
    });
  }

  return (
    <GeoJSON
      key={candidates.map((c) => c.id).join(",")}
      data={collection}
      style={style}
      onEachFeature={onEachFeature}
      pane="overlayPane"
      pathOptions={{ interactive: true }}
    />
  );
}
