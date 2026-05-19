import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { setAuthToken, setUnauthorizedHandler } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [welcomeFlash, setWelcomeFlash] = useState(false);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  }, []);

  const applySession = useCallback((session) => {
    setUser(session);
    setToken(session.token);
    setAuthToken(session.token);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    applySession(data);
    return data;
  }, [applySession]);

  const register = useCallback(async (userPayload) => {
    const data = await authApi.register(userPayload);
    applySession(data);
    setWelcomeFlash(true);
    return data;
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      if (token) await authApi.logout();
    } catch {
      // ignore logout errors
    }
    clearAuth();
    setWelcomeFlash(false);
  }, [token, clearAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      welcomeFlash,
      clearWelcomeFlash: () => setWelcomeFlash(false),
      login,
      register,
      logout
    }),
    [user, token, welcomeFlash, login, register, logout]
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
