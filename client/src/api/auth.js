import http, { unwrap } from "./http";

export async function login(email, password) {
  const res = await http.post("/api/v1/auth/login", {
    user: { email, password }
  });
  return unwrap(res);
}

export async function register(userPayload) {
  const res = await http.post("/api/v1/auth/register", { user: userPayload });
  return unwrap(res);
}

export async function logout() {
  const res = await http.delete("/api/v1/auth/logout");
  return unwrap(res);
}
