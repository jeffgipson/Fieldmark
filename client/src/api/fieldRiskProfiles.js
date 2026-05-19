import http, { unwrap } from "./http";

export async function getFieldRiskProfile(farmId, fieldId) {
  const res = await http.get(`/api/v1/farms/${farmId}/fields/${fieldId}/risk_profile`);
  return unwrap(res);
}

export async function updateFieldRiskProfile(farmId, fieldId, fieldRiskProfile) {
  const res = await http.patch(`/api/v1/farms/${farmId}/fields/${fieldId}/risk_profile`, {
    field_risk_profile: fieldRiskProfile
  });
  return unwrap(res);
}
