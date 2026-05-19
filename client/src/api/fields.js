import http, { unwrap } from "./http";

export async function listFields(farmId) {
  const res = await http.get(`/api/v1/farms/${farmId}/fields`);
  return unwrap(res);
}

export async function getField(farmId, fieldId) {
  const res = await http.get(`/api/v1/farms/${farmId}/fields/${fieldId}`);
  return unwrap(res);
}

export async function createField(farmId, field) {
  const res = await http.post(`/api/v1/farms/${farmId}/fields`, { field });
  return unwrap(res);
}

export async function updateField(farmId, fieldId, field) {
  const res = await http.patch(`/api/v1/farms/${farmId}/fields/${fieldId}`, { field });
  return unwrap(res);
}

export async function uploadFieldCoverPhoto(farmId, fieldId, file) {
  const formData = new FormData();
  formData.append("cover_photo", file);
  const res = await http.put(`/api/v1/farms/${farmId}/fields/${fieldId}/cover_photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return unwrap(res);
}

export async function removeFieldCoverPhoto(farmId, fieldId) {
  const res = await http.delete(`/api/v1/farms/${farmId}/fields/${fieldId}/cover_photo`);
  return unwrap(res);
}

export async function generateFieldDescription(farmId, fieldId) {
  const res = await http.post(`/api/v1/farms/${farmId}/fields/${fieldId}/description`);
  return unwrap(res);
}

export async function deleteField(farmId, fieldId) {
  const res = await http.delete(`/api/v1/farms/${farmId}/fields/${fieldId}`);
  return unwrap(res);
}
