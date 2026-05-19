import axios from "axios";

let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const field = error.response?.data?.errors?.[0]?.field;
    const needsReauth =
      status === 401 || (status === 403 && field === "authorization");

    if (needsReauth && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export function unwrap(response) {
  const { data, errors } = response.data ?? {};
  if (errors?.length) {
    const err = new Error(errors[0].message || "Request failed");
    err.field = errors[0].field;
    throw err;
  }
  return data;
}

export default http;
