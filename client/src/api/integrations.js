import http, { unwrap } from "./http";

export async function listIntegrations() {
  const res = await http.get("/api/v1/integrations");
  return unwrap(res);
}
