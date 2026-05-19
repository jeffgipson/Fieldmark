import http, { unwrap } from "./http";

export async function listVendors(params = {}) {
  const res = await http.get("/api/v1/admin/vendors", { params });
  return { data: unwrap(res), meta: res.data?.meta };
}

export async function updateVendor(id, vendor) {
  const res = await http.patch(`/api/v1/admin/vendors/${id}`, { vendor });
  return unwrap(res);
}
