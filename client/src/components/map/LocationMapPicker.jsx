import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GoogleAddressInput from "./GoogleAddressInput";
import { GeoJSON, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import BoundaryOverlay from "./BoundaryOverlay";
import QuickFieldBox from "./QuickFieldBox";
import "leaflet-draw";
import { Search } from "lucide-react";
import * as locationsApi from "../../api/locations";
import { fetchMapConfig } from "../../api/mapConfig";
import useLocationLookup from "../../hooks/useLocationLookup";
import Input from "../ui/Input";
import { configureDrawLocale, configureLeafletIcons, L } from "./leafletSetup";
import LocationInsights from "./LocationInsights";
import { acresFromBoundary, formatAcres } from "../../utils/polygonAcres";
import { mapDebug } from "../../utils/mapDebug";
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
/** Wider context to find the parcel before marking corners. */
const FIELD_PICKER_ZOOM = 14;
/** Closer after address search, still below post-mark fitBounds. */
const FIELD_SEARCH_ZOOM = 16;
const FIELD_BOUNDARY_MAX_ZOOM = 18;
const FIELD_BOUNDARY_FIT_PADDING = [32, 32];
const FARM_POINT_ZOOM = 12;
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

function MapViewController({ center, zoom, boundary, syncKey }) {
  const map = useMap();
  const lastSync = useRef(null);

  useEffect(() => {
    if (syncKey == null) return;
    if (lastSync.current === syncKey) return;
    lastSync.current = syncKey;

    const ring = boundary?.coordinates?.[0];
    if (ring?.length >= 3) {
      const latLngs = ring.map(([lng, lat]) => [lat, lng]);
      mapDebug("map:fit_bounds", { syncKey, points: latLngs.length });
      map.fitBounds(latLngs, {
        padding: FIELD_BOUNDARY_FIT_PADDING,
        maxZoom: FIELD_BOUNDARY_MAX_ZOOM,
        animate: false
      });
      return;
    }

    if (!center || zoom == null) return;
    mapDebug("map:fly_to", { syncKey, center, zoom });
    map.setView(center, zoom, { animate: false });
  }, [center, zoom, boundary, syncKey, map]);

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
      position: "bottomright",
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
  className = "",
  scrollWheelZoom = true
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchFlyNonce, setSearchFlyNonce] = useState(0);
  const [googleApiKey, setGoogleApiKey] = useState(
    () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || ""
  );
  const googleSearch = Boolean(googleApiKey);
  const [fieldInputMode, setFieldInputMode] = useState("box");
  const prevFieldInputMode = useRef(fieldInputMode);
  const [selectedBoundaryId, setSelectedBoundaryId] = useState(null);
  const [mapFocusNonce, setMapFocusNonce] = useState(0);
  const [regridAppUrl, setRegridAppUrl] = useState(null);
  const [basemap, setBasemap] = useState("satellite");

  // Re-apply property zoom when switching Mark field / Draw shape / Auto outlines.
  useEffect(() => {
    if (mode !== "polygon" || latitude == null || longitude == null) return;
    if (prevFieldInputMode.current === fieldInputMode) return;
    prevFieldInputMode.current = fieldInputMode;
    setMapFocusNonce((n) => n + 1);
  }, [fieldInputMode, mode, latitude, longitude]);

  const [mapConfigLoaded, setMapConfigLoaded] = useState(false);
  const [mapConfigError, setMapConfigError] = useState(null);
  const [mapConfigHasGoogleKey, setMapConfigHasGoogleKey] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMapConfigLoaded(false);
    setMapConfigError(null);
    setMapConfigHasGoogleKey(false);

    fetchMapConfig()
      .then((cfg) => {
        if (cancelled) return;
        if (cfg?.regrid_property_app_url) setRegridAppUrl(cfg.regrid_property_app_url);
        const key = cfg?.google_maps_api_key?.trim();
        if (key) {
          setGoogleApiKey(key);
          setMapConfigHasGoogleKey(true);
        }
        mapDebug("map_config:ok", { google: Boolean(key) });
      })
      .catch((err) => {
        if (cancelled) return;
        setMapConfigError(err?.message || "map_config failed");
        mapDebug("map_config:error", err?.message);
      })
      .finally(() => {
        if (!cancelled) setMapConfigLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);
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

  const handleBoundaryCandidate = useCallback(
    (candidate) => {
      if (!candidate?.boundary) return;
      setSelectedBoundaryId(candidate.id);
      const ring = candidate.boundary.coordinates?.[0];
      if (!ring?.length) return;
      let latSum = 0;
      let lngSum = 0;
      ring.forEach(([lng, lat]) => {
        latSum += lat;
        lngSum += lng;
      });
      handleBoundary(candidate.boundary, {
        lat: latSum / ring.length,
        lng: lngSum / ring.length
      });
    },
    [handleBoundary]
  );

  const onBoundaryRef = useRef(handleBoundary);
  onBoundaryRef.current = handleBoundary;

  const applyBoxBoundary = useCallback(
    (geometry, center) => {
      handleBoundary(geometry, center);
    },
    [handleBoundary]
  );

  const boundarySyncKey = useMemo(() => {
    const ring = boundary?.coordinates?.[0];
    if (!ring?.length) return "";
    return ring.map(([lng, lat]) => `${Number(lng).toFixed(5)},${Number(lat).toFixed(5)}`).join(";");
  }, [boundary]);

  const mapSyncKey = useMemo(() => {
    if (latitude == null || longitude == null) return null;
    return [
      Number(latitude).toFixed(5),
      Number(longitude).toFixed(5),
      boundarySyncKey,
      searchFlyNonce,
      mapFocusNonce,
      mode,
      mode === "polygon" ? fieldInputMode : "point"
    ].join(":");
  }, [latitude, longitude, boundarySyncKey, searchFlyNonce, mapFocusNonce, mode, fieldInputMode]);

  const mapTargetZoom = useMemo(() => {
    if (latitude == null || longitude == null) return DEFAULT_ZOOM;
    if (mode !== "polygon") return FARM_POINT_ZOOM;
    return searchFlyNonce > 0 ? FIELD_SEARCH_ZOOM : FIELD_PICKER_ZOOM;
  }, [latitude, longitude, mode, searchFlyNonce]);

  const mapInitialZoom = latitude != null && longitude != null ? mapTargetZoom : DEFAULT_ZOOM;

  const applySearchPlace = useCallback(
    (hit) => {
      setSearchResults([]);
      setSearchAttempted(false);
      setSearchQuery(hit.display_name);
      setSearchFlyNonce((n) => n + 1);
      mapDebug("search:select", {
        lat: hit.latitude,
        lng: hit.longitude,
        name: hit.display_name,
        zoom: mode === "polygon" ? FIELD_SEARCH_ZOOM : FARM_POINT_ZOOM
      });
      onLocationChange?.({
        latitude: hit.latitude,
        longitude: hit.longitude,
        boundary: mode === "polygon" ? boundary : null
      });
    },
    [onLocationChange, mode, boundary]
  );

  async function runSearch() {
    const q = String(searchQuery ?? "").trim();
    if (q.length < 3) return;
    setSearching(true);
    setSearchAttempted(true);
    try {
      const results = await locationsApi.searchLocations(q);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className={className}>
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fm-gray-medium"
            size={18}
          />
          {googleSearch ? (
            <GoogleAddressInput
              apiKey={googleApiKey}
              className="!pl-10"
              placeholder="Search address…"
              initialValue={searchQuery}
              onInputChange={(value) => {
                setSearchQuery(value);
                setSearchAttempted(false);
              }}
              onPlaceSelect={applySearchPlace}
            />
          ) : (
            <Input
              className="!pl-10"
              placeholder="Search town or address"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchAttempted(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void runSearch();
                }
              }}
              autoComplete="street-address"
            />
          )}
        </div>
        {!googleSearch && (
          <button
            type="button"
            onClick={() => void runSearch()}
            disabled={searching}
            className="shrink-0 rounded-xl border border-fm-teal/30 bg-fm-surface px-4 py-2 text-sm font-bold text-fm-teal hover:bg-fm-teal-subtle"
          >
            {searching ? "…" : "Search"}
          </button>
        )}
      </div>

      {googleSearch && (
        <p className="mb-2 text-xs text-fm-gray-medium">
          Start typing an address, then choose a suggestion from the list.
        </p>
      )}
      {mapConfigLoaded && !googleSearch && (
        <p className="mb-2 text-xs text-fm-gray-medium">
          {mapConfigError ? (
            <>
              Could not load map settings ({mapConfigError}). Stop and restart the API (
              <code className="text-fm-teal">cd api && bin/dev</code>), then refresh.
            </>
          ) : mapConfigHasGoogleKey ? null : (
            <>
              If <code className="text-fm-teal">GOOGLE_MAPS_API_KEY</code> is already in{" "}
              <code className="text-fm-teal">api/.env</code>, restart the API server so it picks up
              the file — then hard-refresh this page.
            </>
          )}
        </p>
      )}

      {!googleSearch && searchResults.length > 0 && (
        <ul className="fm-location-search-results mb-3 rounded-xl border border-fm-gray-light bg-fm-surface">
          {searchResults.map((hit) => (
            <li key={hit.place_id}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-fm-teal-subtle"
                onClick={() => applySearchPlace(hit)}
              >
                {hit.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!googleSearch && searchAttempted && !searching && searchResults.length === 0 && (
        <p className="mb-3 text-sm text-fm-gray-medium">
          No places found. Try a city and state, or a Missouri town name.
        </p>
      )}

      {mode === "polygon" && (
        <div className="fm-field-mode-toggle">
          <button
            type="button"
            className={fieldInputMode === "box" ? "active" : ""}
            onClick={() => {
              mapDebug("field:mode_box");
              setFieldInputMode("box");
            }}
          >
            Mark field
          </button>
          <button
            type="button"
            className={fieldInputMode === "draw" ? "active" : ""}
            onClick={() => {
              mapDebug("field:mode_draw");
              setFieldInputMode("draw");
            }}
          >
            Draw shape
          </button>
          <button
            type="button"
            className={fieldInputMode === "select" ? "active" : ""}
            onClick={() => {
              mapDebug("field:mode_select");
              setFieldInputMode("select");
            }}
          >
            Auto outlines
          </button>
        </div>
      )}

      <p className="mb-2 text-sm text-fm-gray-medium">
        {mode === "point" && "Click the map to set your farm location."}
        {mode === "polygon" && fieldInputMode === "box" && (
          <>On <strong>satellite</strong>, click one corner of your field, then the opposite corner.</>
        )}
        {mode === "polygon" && fieldInputMode === "draw" && (
          "Use the polygon or rectangle tools (top right). Acres calculate when you finish."
        )}
        {mode === "polygon" && fieldInputMode === "select" && (
          <>Click a <strong>parcel boundary</strong> on the map to select your field.</>
        )}
      </p>

      {mode === "polygon" && calculatedAcres != null && (
        <p className="mb-2 rounded-lg bg-fm-teal-subtle px-3 py-2 text-sm font-semibold text-fm-teal">
          Calculated area: {formatAcres(calculatedAcres)}
        </p>
      )}

      {mode === "polygon" && regridAppUrl && latitude != null && longitude != null && (
        <p className="mb-2 text-sm">
          <a
            href={`${regridAppUrl}?lat=${latitude}&lon=${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-fm-teal hover:underline"
          >
            Open this area in Regrid&apos;s full map
          </a>
        </p>
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

        <MapContainer
          center={position}
          zoom={mapInitialZoom}
          className="fm-location-map"
          scrollWheelZoom={scrollWheelZoom}
        >
          <TileLayer
            key={basemap}
            attribution={BASEMAPS[basemap].attribution}
            url={BASEMAPS[basemap].url}
          />
          <MapViewController
            center={position}
            zoom={mapTargetZoom}
            boundary={boundary}
            syncKey={mapSyncKey}
          />
          {mode === "point" ? (
            <>
              <PointSelector onSelect={handlePoint} />
              {latitude != null && <Marker position={position} />}
            </>
          ) : fieldInputMode === "box" ? (
            <>
              <QuickFieldBox active onComplete={applyBoxBoundary} />
              {boundary && (
                <GeoJSON
                  data={{ type: "Feature", geometry: boundary }}
                  style={{ color: "#0a7474", weight: 3, fillOpacity: 0.25 }}
                />
              )}
            </>
          ) : fieldInputMode === "select" ? (
            <>
              <BoundaryOverlay
                enabled
                selectedId={selectedBoundaryId}
                onSelect={handleBoundaryCandidate}
              />
              {boundary && (
                <GeoJSON
                  data={{ type: "Feature", geometry: boundary }}
                  style={{ color: "#0a7474", weight: 3, fillOpacity: 0.25 }}
                />
              )}
              {latitude != null && <Marker position={position} />}
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
