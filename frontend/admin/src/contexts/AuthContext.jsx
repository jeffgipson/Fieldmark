import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { setAuthToken, setUnauthorizedHandler } from "../api/http";

const AuthContext = createContext(null);

const STORAGE_TOKEN = "admin-token";
const STORAGE_USER = "admin-user";

function clearStoredSession() {
  sessionStorage.removeItem(STORAGE_TOKEN);
  sessionStorage.removeItem(STORAGE_USER);
}

function loadStoredSession() {
  try {
    const storedToken = sessionStorage.getItem(STORAGE_TOKEN);
    const storedUser = sessionStorage.getItem(STORAGE_USER);

    if (!storedToken || !storedUser || storedUser === "undefined") {
      clearStoredSession();
      return null;
    }

    const user = JSON.parse(storedUser);
    if (!user?.id || user.role !== "admin") {
      clearStoredSession();
      return null;
    }

    return { token: storedToken, user };
  } catch {
    clearStoredSession();
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    clearStoredSession();
  }, []);

  const applySession = useCallback((session) => {
    if (!session?.token || !session?.id) return;

    setUser(session);
    setToken(session.token);
    setAuthToken(session.token);
    sessionStorage.setItem(STORAGE_TOKEN, session.token);
    sessionStorage.setItem(STORAGE_USER, JSON.stringify(session));
  }, []);

  const ensureAdmin = useCallback((data) => {
    if (data?.role !== "admin") {
      const appUrl = import.meta.env.VITE_APP_URL || "http://localhost:5173";
      throw new Error(`This account is not an admin. Use the farmer app at ${appUrl}.`);
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login(email, password);
      ensureAdmin(data);
      applySession(data);
      return data;
    },
    [applySession, ensureAdmin]
  );

  const loginDemo = useCallback(async () => {
    const data = await authApi.loginDemo();
    ensureAdmin(data);
    applySession(data);
    return data;
  }, [applySession, ensureAdmin]);

  const logout = useCallback(async () => {
    try {
      if (token) await authApi.logout();
    } catch {
      // ignore logout errors
    }
    clearAuth();
  }, [token, clearAuth]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const stored = loadStoredSession();
      if (!stored) {
        setLoading(false);
        return;
      }

      setToken(stored.token);
      setAuthToken(stored.token);

      try {
        const profile = await authApi.fetchCurrentAdmin();
        if (cancelled) return;
        applySession({ ...profile, token: stored.token });
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [applySession, clearAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      loginDemo,
      logout
    }),
    [user, token, loading, login, loginDemo, logout]
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    });
  }, [clearAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
