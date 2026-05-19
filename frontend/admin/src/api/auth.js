import http, { unwrap } from "./http";
import { toApiError } from "../utils/apiError";

async function postAuth(path, body) {
  try {
    const res = await http.post(path, body);
    return unwrap(res);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function login(email, password) {
  return postAuth("/api/v1/auth/login", { user: { email, password } });
}

export async function loginDemo() {
  return postAuth("/api/v1/auth/demo", { role: "admin" });
}

export async function logout() {
  try {
    const res = await http.delete("/api/v1/auth/logout");
    return unwrap(res);
  } catch (err) {
    throw toApiError(err);
  }
}

/** Verify JWT still matches an admin user on the server (avoids stale session after db reseed). */
export async function fetchCurrentAdmin() {
  const res = await http.get("/api/v1/profile");
  const profile = unwrap(res);
  if (profile?.role !== "admin") {
    const err = new Error("This account is not an admin.");
    err.field = "authorization";
    throw err;
  }
  return profile;
}
