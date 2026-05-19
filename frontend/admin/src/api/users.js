import http, { unwrap } from "./http";

export async function listUsers(params) {
  const res = await http.get("/api/v1/admin/users", { params });
  return { data: unwrap(res), meta: res.data.meta };
}

export async function getUser(id) {
    const res = await http.get(`/api/v1/admin/users/${id}`);
    return unwrap(res);
}

export async function updateUser(id, payload) {
    const res = await http.patch(`/api/v1/admin/users/${id}`, { user: payload });
    return unwrap(res);
}
