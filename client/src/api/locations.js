import http, { unwrap } from "./http";

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
  return unwrap(
    await http.get("/api/v1/locations/boundaries", {
      params: { latitude, longitude }
    })
  );
}

export async function fetchBoundariesInBBox({ south, west, north, east }) {
  return unwrap(
    await http.get("/api/v1/locations/boundaries", {
      params: { south, west, north, east }
    })
  );
}
