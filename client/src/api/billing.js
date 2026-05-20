import http, { unwrap } from "./http";

export async function getBilling() {
  const res = await http.get("/api/v1/billing");
  return unwrap(res);
}

export async function listPlans() {
  const res = await http.get("/api/v1/billing/plans");
  return unwrap(res);
}

export async function checkout(planKey) {
  const res = await http.post("/api/v1/billing/checkout", { plan: planKey });
  return unwrap(res);
}

export async function openPortal() {
  const res = await http.post("/api/v1/billing/portal");
  return unwrap(res);
}
