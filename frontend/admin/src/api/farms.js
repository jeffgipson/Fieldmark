import http, { unwrap } from "./http";

export async function listFarms(params = {}) {
  const res = await http.get("/api/v1/admin/farms", { params });
  return { data: unwrap(res), meta: res.data?.meta };
}

export async function getFarm(id) {
  const res = await http.get(`/api/v1/admin/farms/${id}`);
  return unwrap(res);
}

export async function updateFarm(id, payload) {
  const res = await http.patch(`/api/v1/admin/farms/${id}`, { farm: payload });
  return unwrap(res);
}
