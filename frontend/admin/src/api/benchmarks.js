import http, { unwrap } from "./http";

export async function listBenchmarkRegions() {
  const res = await http.get("/api/v1/admin/benchmark_regions");
  return unwrap(res);
}
