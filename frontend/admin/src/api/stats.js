import http, { unwrap } from "./http";

export async function getStats() {
  const res = await http.get("/api/v1/admin/stats");
  return unwrap(res);
}
