import { useEffect, useRef, useState } from "react";
import { Rectangle, useMap, useMapEvents } from "react-leaflet";
import { mapDebug } from "../../utils/mapDebug";

const BOX_STYLE = {
  color: "#0d8b8b",
  weight: 3,
  fillColor: "#0d8b8b",
  fillOpacity: 0.2,
  dashArray: "8 4"
};

function boundsFromCorners(c1, c2) {
  const south = Math.min(c1.lat, c2.lat);
  const north = Math.max(c1.lat, c2.lat);
  const west = Math.min(c1.lng, c2.lng);
  const east = Math.max(c1.lng, c2.lng);
  return [
    [south, west],
    [north, east]
  ];
}

export function rectangleGeometryFromCorners(c1, c2) {
  const south = Math.min(c1.lat, c2.lat);
  const north = Math.max(c1.lat, c2.lat);
  const west = Math.min(c1.lng, c2.lng);
  const east = Math.max(c1.lng, c2.lng);
  return {
    type: "Polygon",
    coordinates: [
      [
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south]
      ]
    ]
  };
}

export default function QuickFieldBox({ active, onComplete }) {
  const map = useMap();
  const [corner1, setCorner1] = useState(null);
  const [hover, setHover] = useState(null);
  const corner1Ref = useRef(null);
  corner1Ref.current = corner1;

  useEffect(() => {
    if (!active) {
      setCorner1(null);
      setHover(null);
    }
  }, [active]);

  useMapEvents({
    click(e) {
      if (!active) return;
      if (e.originalEvent?.boundaryLayerClick) return;

      const c1 = corner1Ref.current;
      if (!c1) {
        mapDebug("box:corner1", { lat: e.latlng.lat, lng: e.latlng.lng });
        setCorner1(e.latlng);
        return;
      }

      const geometry = rectangleGeometryFromCorners(c1, e.latlng);
      const center = {
        lat: (c1.lat + e.latlng.lat) / 2,
        lng: (c1.lng + e.latlng.lng) / 2
      };
      mapDebug("box:complete", { center, geometry });
      setCorner1(null);
      setHover(null);
      onComplete?.(geometry, center);
    },
    mousemove(e) {
      if (!active || !corner1Ref.current) return;
      setHover(e.latlng);
    }
  });

  useEffect(() => {
    if (!active) return;
    const container = map.getContainer();
    container.style.cursor = corner1 ? "crosshair" : "cell";
    return () => {
      container.style.cursor = "";
    };
  }, [active, corner1, map]);

  if (!active) return null;

  const previewCorner = hover ?? corner1;
  const showPreview = corner1 && previewCorner;

  return showPreview ? (
    <Rectangle bounds={boundsFromCorners(corner1, previewCorner)} pathOptions={BOX_STYLE} />
  ) : null;
}
