import area from "@turf/area";

const SQ_METERS_PER_ACRE = 4046.8564224;

/**
 * Geodesic acreage from a GeoJSON Polygon or Feature geometry.
 * @returns {number|null} acres rounded to 1 decimal
 */
export function acresFromBoundary(geometry) {
  if (!geometry?.coordinates?.length) return null;

  try {
    const feature = {
      type: "Feature",
      properties: {},
      geometry: geometry.type === "Feature" ? geometry.geometry : geometry
    };
    const sqMeters = area(feature);
    if (!Number.isFinite(sqMeters) || sqMeters <= 0) return null;
    return Math.round((sqMeters / SQ_METERS_PER_ACRE) * 10) / 10;
  } catch {
    return null;
  }
}

export function formatAcres(acres) {
  if (acres == null || Number.isNaN(Number(acres))) return "—";
  return `${Number(acres).toLocaleString(undefined, { maximumFractionDigits: 1 })} ac`;
}
