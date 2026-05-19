import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { configureLeafletIcons } from "./leafletSetup";
import "./locationMap.css";

configureLeafletIcons();

const FIELD_STYLE = {
  color: "#0d8b8b",
  weight: 3,
  fillColor: "#0d8b8b",
  fillOpacity: 0.2
};

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

const DEFAULT_CENTER = [37.3059, -89.5181];
const DEFAULT_ZOOM = 8;
const FIELD_ZOOM = 17;

function FitFieldView({ boundary, latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (boundary?.coordinates?.[0]?.length) {
      const ring = boundary.coordinates[0].map(([lng, lat]) => [lat, lng]);
      map.fitBounds(ring, { padding: [28, 28], maxZoom: 18, animate: false });
      return;
    }
    if (latitude != null && longitude != null) {
      map.setView([Number(latitude), Number(longitude)], FIELD_ZOOM, { animate: false });
    }
  }, [boundary, latitude, longitude, map]);

  return null;
}

export default function FieldBoundaryMap({
  boundary,
  latitude,
  longitude,
  className = "",
  mapClassName = "fm-location-map h-[240px] md:h-[280px]"
}) {
  const [basemap, setBasemap] = useState("satellite");

  const center = useMemo(() => {
    if (latitude != null && longitude != null) {
      return [Number(latitude), Number(longitude)];
    }
    return DEFAULT_CENTER;
  }, [latitude, longitude]);

  const hasPoint = latitude != null && longitude != null;
  const hasBoundary = Boolean(boundary?.coordinates?.[0]?.length);
  const initialZoom = hasPoint ? FIELD_ZOOM : DEFAULT_ZOOM;

  if (!hasPoint && !hasBoundary) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-fm-gray-light bg-fm-gray-light/30 px-4 py-10 text-center text-sm text-fm-gray-medium ${className}`}
      >
        No map on file for this field. Edit the field on My Farm to draw a boundary.
      </div>
    );
  }

  return (
    <div className={`fm-location-map-wrap ${className}`}>
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
      <MapContainer center={center} zoom={initialZoom} className={mapClassName} scrollWheelZoom>
        <TileLayer
          key={basemap}
          attribution={BASEMAPS[basemap].attribution}
          url={BASEMAPS[basemap].url}
        />
        <FitFieldView boundary={boundary} latitude={latitude} longitude={longitude} />
        {hasBoundary && (
          <GeoJSON
            key={JSON.stringify(boundary.coordinates?.[0]?.[0])}
            data={{ type: "Feature", geometry: boundary }}
            style={FIELD_STYLE}
          />
        )}
        {hasPoint && !hasBoundary && <Marker position={center} />}
      </MapContainer>
    </div>
  );
}
