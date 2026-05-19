import http, { unwrap } from "./http";

export async function getProfile() {
  const res = await http.get("/api/v1/profile");
  return unwrap(res);
}

export async function updateProfile(user) {
  const res = await http.patch("/api/v1/profile", { user });
  return unwrap(res);
}

export async function updateCredentials(user) {
  const res = await http.patch("/api/v1/profile/credentials", { user });
  return unwrap(res);
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await http.put("/api/v1/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return unwrap(res);
}

export async function removeAvatar() {
  const res = await http.delete("/api/v1/avatar");
  return unwrap(res);
}

export async function listInvitations() {
  const res = await http.get("/api/v1/invitations");
  return unwrap(res);
}

export async function createInvitation(invitation) {
  const res = await http.post("/api/v1/invitations", { invitation });
  return unwrap(res);
}

export async function revokeInvitation(id) {
  const res = await http.delete(`/api/v1/invitations/${id}`);
  return unwrap(res);
}
