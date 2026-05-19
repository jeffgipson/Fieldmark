import http, { unwrap } from "./http";

export async function createDecision(scenarioId, decision) {
  const res = await http.post(`/api/v1/scenarios/${scenarioId}/decision`, { decision });
  return unwrap(res);
}

export async function updateDecision(scenarioId, decision) {
  const res = await http.patch(`/api/v1/scenarios/${scenarioId}/decision`, { decision });
  return unwrap(res);
}
