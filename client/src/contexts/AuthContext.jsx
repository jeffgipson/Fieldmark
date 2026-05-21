import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import * as profileApi from "../api/profile";
import { setAuthToken, setUnauthorizedHandler } from "../api/http";
import { getStoredToken } from "../utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const storedToken = getStoredToken();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(storedToken);
  const [bootstrapping, setBootstrapping] = useState(Boolean(storedToken));
  const [welcomeFlash, setWelcomeFlash] = useState(false);
  const bootstrappingRef = useRef(Boolean(storedToken));

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

  const setUserFromProfile = useCallback((profile) => {
    setUser((prev) => (prev ? { ...prev, ...profile } : profile));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    applySession(data);
    return data;
  }, [applySession]);

  const loginDemo = useCallback(async () => {
    const data = await authApi.loginDemo();
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
      bootstrapping,
      welcomeFlash,
      clearWelcomeFlash: () => setWelcomeFlash(false),
      login,
      loginDemo,
      register,
      logout,
      setUserFromProfile
    }),
    [user, token, bootstrapping, welcomeFlash, login, loginDemo, register, logout, setUserFromProfile]
  );

  useEffect(() => {
    bootstrappingRef.current = bootstrapping;
  }, [bootstrapping]);

  useEffect(() => {
    if (!storedToken) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const profile = await profileApi.getProfile();
        if (cancelled) return;
        setUser({ ...profile, token: storedToken });
        setToken(storedToken);
        setAuthToken(storedToken);
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storedToken, clearAuth]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
      if (bootstrappingRef.current || window.location.pathname === "/login") return;
      navigate("/login", { replace: true });
    });
  }, [clearAuth, navigate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
