import http, { unwrap } from "./http";

export async function fetchMapConfig() {
  const response = await http.get("/api/v1/map_config");
  return unwrap(response);
}
