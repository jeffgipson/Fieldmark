import http, { unwrap } from "./http";
import { mapDebug } from "../utils/mapDebug";

export async function lookupLocation({ latitude, longitude, boundary }) {
  return unwrap(
    await http.post("/api/v1/locations/lookup", {
      latitude,
      longitude,
      boundary
    })
  );
}

export async function searchLocations(query) {
  return unwrap(await http.get("/api/v1/locations/search", { params: { q: query } }));
}

export async function fetchBoundariesAtPoint(latitude, longitude) {
  const response = await http.get("/api/v1/locations/boundaries", {
    params: { latitude, longitude }
  });
  const envelope = response.data ?? {};
  return { data: unwrap(response), meta: envelope.meta ?? {} };
}

export async function fetchBoundariesInBBox({ south, west, north, east, latitude, longitude }) {
  const params = { south, west, north, east, latitude, longitude };
  mapDebug("api:GET /locations/boundaries", params);
  const response = await http.get("/api/v1/locations/boundaries", { params });
  const envelope = response.data ?? {};
  const data = unwrap(response);
  mapDebug("api:boundaries response", {
    count: Array.isArray(data) ? data.length : 0,
    labels: Array.isArray(data) ? data.map((c) => c.label) : [],
    diagnostics: envelope.meta?.diagnostics
  });
  return { data, meta: envelope.meta ?? {} };
}
