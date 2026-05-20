import http, { unwrap } from "./http";

export async function listBenchmarkRegions() {
  const res = await http.get("/api/v1/admin/benchmark_regions");
  return unwrap(res);
}

export async function updateBenchmarkRegion(id, benchmarkRegion) {
  const res = await http.patch(`/api/v1/admin/benchmark_regions/${id}`, {
    benchmark_region: benchmarkRegion
  });
  return unwrap(res);
}
