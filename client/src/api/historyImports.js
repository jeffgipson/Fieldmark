import http, { unwrap } from "./http";

export async function importFarmHistoryCsv(farmId, file, { preview = false } = {}) {
  const form = new FormData();
  form.append("file", file);
  if (preview) form.append("preview", "true");

  const res = await http.post(`/api/v1/farms/${farmId}/history_imports`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return unwrap(res);
}
