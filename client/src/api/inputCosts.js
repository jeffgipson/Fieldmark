import http, { unwrap } from "./http";

export async function listInputCosts(fieldId) {
  const res = await http.get(`/api/v1/fields/${fieldId}/input_costs`);
  return unwrap(res);
}

export async function createInputCost(fieldId, inputCost) {
  const res = await http.post(`/api/v1/fields/${fieldId}/input_costs`, { input_cost: inputCost });
  return unwrap(res);
}

export async function updateInputCost(fieldId, id, inputCost) {
  const res = await http.patch(`/api/v1/fields/${fieldId}/input_costs/${id}`, {
    input_cost: inputCost
  });
  return unwrap(res);
}

export async function deleteInputCost(fieldId, id) {
  const res = await http.delete(`/api/v1/fields/${fieldId}/input_costs/${id}`);
  return unwrap(res);
}
