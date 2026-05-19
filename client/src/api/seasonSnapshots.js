import http, { unwrap } from "./http";

export async function listSeasonSnapshots(farmId) {
  const res = await http.get(`/api/v1/farms/${farmId}/season_snapshots`);
  return unwrap(res);
}

export async function createSeasonSnapshot(farmId, snapshot) {
  const res = await http.post(`/api/v1/farms/${farmId}/season_snapshots`, {
    farm_season_snapshot: snapshot
  });
  return unwrap(res);
}

export async function updateSeasonSnapshot(farmId, id, snapshot) {
  const res = await http.patch(`/api/v1/farms/${farmId}/season_snapshots/${id}`, {
    farm_season_snapshot: snapshot
  });
  return unwrap(res);
}

export async function deleteSeasonSnapshot(farmId, id) {
  const res = await http.delete(`/api/v1/farms/${farmId}/season_snapshots/${id}`);
  return unwrap(res);
}
