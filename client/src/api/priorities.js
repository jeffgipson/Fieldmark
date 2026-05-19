import http, { unwrap } from "./http";

export async function listPriorities(farmId, seasonYear) {
  const res = await http.get(`/api/v1/farms/${farmId}/priorities`, {
    params: seasonYear ? { season_year: seasonYear } : undefined
  });
  return unwrap(res);
}

export async function createPriority(farmId, priority) {
  const res = await http.post(`/api/v1/farms/${farmId}/priorities`, { priority });
  return unwrap(res);
}

export async function updatePriority(farmId, id, priority) {
  const res = await http.patch(`/api/v1/farms/${farmId}/priorities/${id}`, { priority });
  return unwrap(res);
}

export async function deletePriority(farmId, id) {
  const res = await http.delete(`/api/v1/farms/${farmId}/priorities/${id}`);
  return unwrap(res);
}

export async function syncPriorities(farmId, priorities) {
  const res = await http.put(`/api/v1/farms/${farmId}/priorities/sync`, { priorities });
  return unwrap(res);
}

export async function createPriorityFromMessage(farmId, content, category) {
  const res = await http.post(`/api/v1/farms/${farmId}/priorities/from_message`, {
    message: { content },
    priority: category ? { category } : {}
  });
  return unwrap(res);
}
