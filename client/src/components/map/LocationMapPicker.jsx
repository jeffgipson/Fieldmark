import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import BoundaryOverlay from "./BoundaryOverlay";
import "leaflet-draw";
import { Search } from "lucide-react";
import * as locationsApi from "../../api/locations";
import useLocationLookup from "../../hooks/useLocationLookup";
import Input from "../ui/Input";
import { configureDrawLocale, configureLeafletIcons, L } from "./leafletSetup";
import LocationInsights from "./LocationInsights";
import { acresFromBoundary, formatAcres } from "../../utils/polygonAcres";
import "./locationMap.css";

configureLeafletIcons();
configureDrawLocale();

const FIELD_SHAPE_OPTIONS = {
  color: "#0d8b8b",
  weight: 3,
  fillColor: "#0d8b8b",
  fillOpacity: 0.15
};

const DEFAULT_CENTER = [37.3059, -89.5181];
const DEFAULT_ZOOM = 8;

const BASEMAPS = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri"
  }
};

function centroidFromBoundary(geometry) {
  const ring = geometry?.coordinates?.[0];
  if (!ring?.length) return null;
  const lngs = ring.map((c) => c[0]);
  const lats = ring.map((c) => c[1]);
  return {
    lat: lats.reduce((a, b) => a + b, 0) / lats.length,
    lng: lngs.reduce((a, b) => a + b, 0) / lngs.length
  };
}

function MapClickSelect({ enabled, onCandidates }) {
  useMapEvents({
    async click(e) {
      if (!enabled) return;
      try {
        const list = await locationsApi.fetchBoundariesAtPoint(e.latlng.lat, e.latlng.lng);
        onCandidates(Array.isArray(list) ? list : [], e.latlng);
      } catch {
        onCandidates([], e.latlng);
      }
    }
  });
  return null;
}

function MapController({ center, zoom, flyToKey }) {
  const map = useMap();
  const lastKey = useRef(null);

  useEffect(() => {
    if (!center || flyToKey == null) return;
    if (lastKey.current === flyToKey) return;
    lastKey.current = flyToKey;
    map.setView(center, zoom ?? map.getZoom());
  }, [center, zoom, map, flyToKey]);

  return null;
}

function PointSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function DrawControl({ onBoundaryRef, initialBoundary }) {
  const map = useMap();
  const drawnRef = useRef(null);
  const seededRef = useRef(false);

  useEffect(() => {
    const drawn = new L.FeatureGroup();
    map.addLayer(drawn);
    drawnRef.current = drawn;

    if (!seededRef.current && initialBoundary?.coordinates?.[0]) {
      const ring = initialBoundary.coordinates[0].map(([lng, lat]) => [lat, lng]);
      drawn.addLayer(L.polygon(ring, { ...FIELD_SHAPE_OPTIONS }));
      seededRef.current = true;
    }

    const control = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: true,
          showArea: true,
          showLength: false,
          metric: false,
          feet: false,
          maxPoints: 0,
          precision: { acres: 1 },
          shapeOptions: FIELD_SHAPE_OPTIONS
        },
        rectangle: {
          showArea: true,
          metric: false,
          precision: { acres: 1 },
          shapeOptions: FIELD_SHAPE_OPTIONS
        },
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false
      },
      edit: {
        featureGroup: drawn,
        edit: { selectedPathOptions: { maintainColor: true } }
      }
    });
    map.addControl(control);

    function emitBoundary(layer) {
      const geojson = layer.toGeoJSON();
      onBoundaryRef.current?.(geojson.geometry, layer.getBounds().getCenter());
    }

    function onCreated(e) {
      drawn.clearLayers();
      drawn.addLayer(e.layer);
      emitBoundary(e.layer);
    }

    function onEdited(e) {
      e.layers.eachLayer((layer) => emitBoundary(layer));
    }

    function onDrawStart() {
      map.doubleClickZoom.disable();
    }

    function onDrawStop() {
      map.doubleClickZoom.enable();
    }

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DRAWSTART, onDrawStart);
    map.on(L.Draw.Event.DRAWSTOP, onDrawStop);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DRAWSTART, onDrawStart);
      map.off(L.Draw.Event.DRAWSTOP, onDrawStop);
      map.doubleClickZoom.enable();
      map.removeControl(control);
      map.removeLayer(drawn);
      drawnRef.current = null;
    };
  }, [map]);

  return null;
}

export default function LocationMapPicker({
  mode = "point",
  latitude,
  longitude,
  boundary,
  onLocationChange,
  onInsights,
  className = ""
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [fieldInputMode, setFieldInputMode] = useState("select");
  const [basemap, setBasemap] = useState("satellite");
  const [selectedBoundaryId, setSelectedBoundaryId] = useState(null);
  const [pickList, setPickList] = useState([]);

  const position = useMemo(() => {
    if (latitude != null && longitude != null) return [Number(latitude), Number(longitude)];
    return DEFAULT_CENTER;
  }, [latitude, longitude]);

  const { insights, loading, error } = useLocationLookup({
    latitude,
    longitude,
    boundary,
    enabled: latitude != null && longitude != null
  });

  useEffect(() => {
    if (insights && onInsights) onInsights(insights);
  }, [insights, onInsights]);

  const handlePoint = useCallback(
    (lat, lng) => {
      onLocationChange?.({ latitude: lat, longitude: lng, boundary: null });
    },
    [onLocationChange]
  );

  const calculatedAcres = useMemo(() => acresFromBoundary(boundary), [boundary]);

  const handleBoundary = useCallback(
    (geometry, center) => {
      const acres = acresFromBoundary(geometry);
      onLocationChange?.({
        latitude: center.lat,
        longitude: center.lng,
        boundary: geometry,
        acres
      });
    },
    [onLocationChange]
  );

  const onBoundaryRef = useRef(handleBoundary);
  onBoundaryRef.current = handleBoundary;

  const applyCandidate = useCallback(
    (candidate) => {
      const center = centroidFromBoundary(candidate.boundary);
      const acres = candidate.acres ?? acresFromBoundary(candidate.boundary);
      setSelectedBoundaryId(candidate.id);
      setPickList([]);
      onLocationChange?.({
        latitude: center?.lat,
        longitude: center?.lng,
        boundary: candidate.boundary,
        acres
      });
    },
    [onLocationChange]
  );

  const mapFlyKey = useMemo(() => {
    if (latitude == null || longitude == null) return null;
    return `${Number(latitude).toFixed(4)},${Number(longitude).toFixed(4)}`;
  }, [latitude, longitude]);

  async function runSearch() {
    const q = searchQuery.trim();
    if (q.length < 3) return;
    setSearching(true);
    try {
      const results = await locationsApi.searchLocations(q);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function selectSearchResult(hit) {
    setSearchResults([]);
    setSearchQuery(hit.display_name);
    onLocationChange?.({
      latitude: hit.latitude,
      longitude: hit.longitude,
      boundary: mode === "polygon" ? boundary : null
    });
  }

  return (
    <div className={className}>
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fm-gray-medium"
            size={18}
          />
          <Input
            className="!pl-10"
            placeholder="Search town or address in Missouri"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runSearch())}
          />
        </div>
        <button
          type="button"
          onClick={runSearch}
          disabled={searching}
          className="shrink-0 rounded-xl border border-fm-teal/30 bg-fm-surface px-4 py-2 text-sm font-bold text-fm-teal hover:bg-fm-teal-subtle"
        >
          {searching ? "…" : "Search"}
        </button>
      </div>

      {searchResults.length > 0 && (
        <ul className="fm-location-search-results mb-3 rounded-xl border border-fm-gray-light bg-fm-surface">
          {searchResults.map((hit) => (
            <li key={hit.place_id}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-fm-teal-subtle"
                onClick={() => selectSearchResult(hit)}
              >
                {hit.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {mode === "polygon" && (
        <div className="fm-field-mode-toggle">
          <button
            type="button"
            className={fieldInputMode === "select" ? "active" : ""}
            onClick={() => setFieldInputMode("select")}
          >
            Select from map
          </button>
          <button
            type="button"
            className={fieldInputMode === "draw" ? "active" : ""}
            onClick={() => setFieldInputMode("draw")}
          >
            Draw manually
          </button>
        </div>
      )}

      <p className="mb-2 text-sm text-fm-gray-medium">
        {mode === "point" && "Click the map to set your farm location."}
        {mode === "polygon" && fieldInputMode === "select" && (
          <>
            Zoom in on the <strong>satellite</strong> view until you see field edges. Click a teal
            outline to select that field, or click inside a field to find a match. Lines on the
            image are not clickable by themselves — we use mapped field and parcel data underneath.
          </>
        )}
        {mode === "polygon" && fieldInputMode === "draw" && (
          "Draw your boundary with the polygon or rectangle tools (top right). Acres calculate when you finish."
        )}
      </p>

      {mode === "polygon" && calculatedAcres != null && (
        <p className="mb-2 rounded-lg bg-fm-teal-subtle px-3 py-2 text-sm font-semibold text-fm-teal">
          Calculated area: {formatAcres(calculatedAcres)}
        </p>
      )}

      {pickList.length > 1 && (
        <ul className="mb-2 rounded-xl border border-fm-teal/30 bg-fm-surface">
          <li className="px-3 py-2 text-xs font-bold uppercase text-fm-gray-medium">
            Multiple fields here — pick one:
          </li>
          {pickList.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="w-full border-t border-fm-gray-light px-3 py-2.5 text-left text-sm hover:bg-fm-teal-subtle"
                onClick={() => applyCandidate(c)}
              >
                {c.label}
                {c.acres != null ? ` · ${formatAcres(c.acres)}` : ""}
                <span className="ml-2 text-xs text-fm-gray-medium">({c.source})</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="fm-location-map-wrap">
        <div className="fm-basemap-toggle">
          <button
            type="button"
            className={basemap === "street" ? "active" : ""}
            onClick={() => setBasemap("street")}
          >
            Map
          </button>
          <button
            type="button"
            className={basemap === "satellite" ? "active" : ""}
            onClick={() => setBasemap("satellite")}
          >
            Satellite
          </button>
        </div>

        <MapContainer center={position} zoom={DEFAULT_ZOOM} className="fm-location-map" scrollWheelZoom>
          <TileLayer
            key={basemap}
            attribution={BASEMAPS[basemap].attribution}
            url={BASEMAPS[basemap].url}
          />
          <MapController
            center={position}
            zoom={latitude != null ? 13 : DEFAULT_ZOOM}
            flyToKey={mapFlyKey}
          />
          {mode === "point" ? (
            <>
              <PointSelector onSelect={handlePoint} />
              {latitude != null && <Marker position={position} />}
            </>
          ) : fieldInputMode === "select" ? (
            <>
              <BoundaryOverlay
                enabled
                selectedId={selectedBoundaryId}
                onSelect={applyCandidate}
              />
              <MapClickSelect
                enabled
                onCandidates={(list, latlng) => {
                  if (list.length === 1) applyCandidate(list[0]);
                  else if (list.length > 1) setPickList(list);
                  else {
                    setPickList([]);
                    onLocationChange?.({
                      latitude: latlng.lat,
                      longitude: latlng.lng,
                      boundary: null,
                      acres: null
                    });
                  }
                }}
              />
              {boundary && (
                <GeoJSON
                  data={{ type: "Feature", geometry: boundary }}
                  style={{ color: "#0a7474", weight: 3, fillOpacity: 0.2 }}
                />
              )}
            </>
          ) : (
            <>
              <DrawControl onBoundaryRef={onBoundaryRef} initialBoundary={boundary} />
              {latitude != null && <Marker position={position} />}
            </>
          )}
        </MapContainer>
      </div>

      <LocationInsights insights={insights} loading={loading} error={error} />
    </div>
  );
}
