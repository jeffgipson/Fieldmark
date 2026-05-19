import http, { unwrap } from "./http";

export async function listFarms() {
  const res = await http.get("/api/v1/farms");
  return unwrap(res);
}

export async function getFarm(id) {
  const res = await http.get(`/api/v1/farms/${id}`);
  return unwrap(res);
}

export async function createFarm(farm) {
  const res = await http.post("/api/v1/farms", { farm });
  return unwrap(res);
}

export async function updateFarm(id, farm) {
  const res = await http.patch(`/api/v1/farms/${id}`, { farm });
  return unwrap(res);
}

export async function deleteFarm(id) {
  const res = await http.delete(`/api/v1/farms/${id}`);
  return unwrap(res);
}
