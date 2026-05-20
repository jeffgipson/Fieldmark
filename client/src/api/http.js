import axios from "axios";
import { clearStoredToken, getStoredToken, setStoredToken } from "../utils/authStorage";

let authToken = getStoredToken();
let onUnauthorized = null;

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    setStoredToken(token);
  } else {
    clearStoredToken();
  }
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
    if (error.response?.status === 401 && onUnauthorized) {
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
