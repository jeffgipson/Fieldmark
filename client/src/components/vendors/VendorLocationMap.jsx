import { useMemo } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { configureLeafletIcons } from "../map/leafletSetup";
import "../map/locationMap.css";

configureLeafletIcons();

const VENDOR_ZOOM = 14;

export default function VendorLocationMap({ latitude, longitude, name, className = "" }) {
  const position = useMemo(() => {
    if (latitude == null || longitude == null) return null;
    return [Number(latitude), Number(longitude)];
  }, [latitude, longitude]);

  if (!position) {
    return (
      <div className={`rounded-xl border border-fm-gray-light bg-fm-gray-light/30 px-4 py-8 text-center text-sm text-fm-gray-medium ${className}`}>
        Map unavailable — address not geocoded yet.
      </div>
    );
  }

  return (
    <div className={`fm-location-map-wrap ${className}`}>
      <MapContainer center={position} zoom={VENDOR_ZOOM} className="fm-location-map h-[280px]" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} title={name} />
      </MapContainer>
    </div>
  );
}
