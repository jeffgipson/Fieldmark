import http, { unwrap } from "./http";

export async function listScenarios(farmId) {
  const res = await http.get(`/api/v1/farms/${farmId}/scenarios`);
  return unwrap(res);
}

export async function getScenario(farmId, scenarioId) {
  const res = await http.get(`/api/v1/farms/${farmId}/scenarios/${scenarioId}`);
  return unwrap(res);
}

export async function createScenario(farmId, scenario) {
  const res = await http.post(`/api/v1/farms/${farmId}/scenarios`, { scenario });
  return unwrap(res);
}

export async function updateScenario(farmId, scenarioId, scenario) {
  const res = await http.patch(`/api/v1/farms/${farmId}/scenarios/${scenarioId}`, { scenario });
  return unwrap(res);
}

export async function deleteScenario(farmId, scenarioId) {
  const res = await http.delete(`/api/v1/farms/${farmId}/scenarios/${scenarioId}`);
  return unwrap(res);
}

export async function calculateScenario(farmId, scenarioId) {
  const res = await http.post(`/api/v1/farms/${farmId}/scenarios/${scenarioId}/calculate`);
  return unwrap(res);
}

export async function compareScenario(farmId, scenarioId) {
  const res = await http.post(`/api/v1/farms/${farmId}/scenarios/${scenarioId}/compare`);
  return unwrap(res);
}
