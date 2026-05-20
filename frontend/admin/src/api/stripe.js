import http, { unwrap } from "./http";

export async function getStripeDashboard() {
  const res = await http.get("/api/v1/admin/stripe");
  return unwrap(res);
}
