import http, { unwrap } from "./http";

export async function getBenchmarks({ region, commodity, year, irrigation }) {
  const res = await http.get("/api/v1/benchmarks", {
    params: { region, commodity, year, irrigation }
  });
  return unwrap(res);
}
