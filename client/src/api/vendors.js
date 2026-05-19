import http, { unwrap } from "./http";

export async function listVendors(params = {}) {
  const res = await http.get("/api/v1/vendors", { params });
  return unwrap(res);
}

export async function getVendor(idOrSlug) {
  const res = await http.get(`/api/v1/vendors/${idOrSlug}`);
  return unwrap(res);
}

export async function getVendorRecommendations(params = {}) {
  const res = await http.get("/api/v1/vendor_recommendations", { params });
  return unwrap(res);
}

export async function listVendorContacts() {
  const res = await http.get("/api/v1/vendor_contacts");
  return unwrap(res);
}

export async function saveVendorContact(vendorId, payload = {}) {
  const res = await http.post("/api/v1/vendor_contacts", {
    vendor_contact: { vendor_id: vendorId, ...payload }
  });
  return unwrap(res);
}

export async function removeVendorContact(id) {
  const res = await http.delete(`/api/v1/vendor_contacts/${id}`);
  return unwrap(res);
}

export async function unfavoriteVendor(vendorId) {
  const res = await http.delete(`/api/v1/vendor_contacts/by_vendor/${vendorId}`);
  return unwrap(res);
}

export async function adminListVendors(params = {}) {
  const res = await http.get("/api/v1/admin/vendors", { params });
  return { data: unwrap(res), meta: res.data?.meta };
}

export async function adminUpdateVendor(id, vendor) {
  const res = await http.patch(`/api/v1/admin/vendors/${id}`, { vendor });
  return unwrap(res);
}

export async function adminCreateVendor(vendor) {
  const res = await http.post("/api/v1/admin/vendors", { vendor });
  return unwrap(res);
}
