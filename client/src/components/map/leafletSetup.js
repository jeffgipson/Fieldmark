import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let configured = false;

export function configureLeafletIcons() {
  if (configured) return;
  configured = true;
  // Vite does not resolve Leaflet's default icon paths.
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
  });
}

export { L };

/** Clearer polygon drawing hints (leaflet-draw defaults are easy to misread). */
export function configureDrawLocale() {
  if (!L.drawLocal?.draw?.handlers?.polygon) return;

  const polygon = L.drawLocal.draw.handlers.polygon.tooltip;
  polygon.start = "Click to place the first corner of your field.";
  polygon.cont = "Click to add more corners — add as many as you need.";
  polygon.end = "Click the first corner again, or double-click the last corner, to finish.";

  if (L.drawLocal.draw.handlers.rectangle?.tooltip) {
    L.drawLocal.draw.handlers.rectangle.tooltip.start =
      "Drag to draw a rectangular field (quick option for straight boundaries).";
  }
}
