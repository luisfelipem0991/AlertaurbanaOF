"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const AuthContext = createContext(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Almacén de tokens en memoria (NO en localStorage ni sessionStorage)
let memoryAccessToken = null;

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // ─── Guardar token en memoria volátil ───
  const setAccessToken = useCallback((token) => {
    memoryAccessToken = token;
  }, []);

  // ─── Programar renovación automática antes de que expire ───
  const scheduleRefresh = useCallback((token) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    if (!token) return;

    try {
      // Decodificar el payload del JWT para obtener su expiración
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiresAt = payload.exp * 1000;
      // Renovar 1 minuto antes de que expire
      const refreshIn = Math.max(expiresAt - Date.now() - 60_000, 10_000);

      refreshTimerRef.current = setTimeout(() => {
        silentRefresh();
      }, refreshIn);
    } catch {
      // Si no se puede decodificar el token, no programar nada
    }
  }, []);

  // ─── Refresh silencioso (usa la cookie HttpOnly del refresh token) ───
  const silentRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // Envía la cookie HttpOnly
      });

      if (!res.ok) {
        // Refresh token expirado o inválido → limpiar sesión
        memoryAccessToken = null;
        setCurrentUser(null);
        return null;
      }

      const data = await res.json();
      memoryAccessToken = data.accessToken;
      setCurrentUser(data.user);
      scheduleRefresh(data.accessToken);
      return data.accessToken;
    } catch {
      memoryAccessToken = null;
      setCurrentUser(null);
      return null;
    }
  }, [scheduleRefresh]);

  // ─── Al montar la app (o F5): intentar restaurar sesión ───
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      await silentRefresh();
      setIsLoading(false);
    }
    initAuth();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [silentRefresh]);

  // ─── Login manual (email/password) ───
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Para recibir la cookie de refresh
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al iniciar sesión");
    }

    memoryAccessToken = data.accessToken;
    setCurrentUser(data.user);
    scheduleRefresh(data.accessToken);

    return data;
  }, [scheduleRefresh]);

  // ─── Intercambio de ticket (Google OAuth callback) ───
  const exchangeTicket = useCallback(async (ticket) => {
    const res = await fetch(`${API_BASE}/api/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ticket }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al canjear ticket");
    }

    memoryAccessToken = data.accessToken;
    setCurrentUser(data.user);
    scheduleRefresh(data.accessToken);

    return data;
  }, [scheduleRefresh]);

  // ─── Logout ───
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignorar errores de red en logout
    }

    memoryAccessToken = null;
    setCurrentUser(null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, []);

  // ─── Fetch autenticado (inyecta Authorization: Bearer automáticamente) ───
  const authFetch = useCallback(async (url, options = {}) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

    // Primer intento con el token actual
    let token = memoryAccessToken;

    const doFetch = (t) =>
      fetch(fullUrl, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          ...(t ? { Authorization: `Bearer ${t}` } : {}),
        },
      });

    let res = await doFetch(token);

    // Si recibimos 401, intentar renovar el token y reintentar
    if (res.status === 401 && token) {
      const newToken = await silentRefresh();
      if (newToken) {
        res = await doFetch(newToken);
      }
    }

    return res;
  }, [silentRefresh]);

  // ─── Actualizar datos del usuario en el contexto ───
  const updateUser = useCallback((updates) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    exchangeTicket,
    authFetch,
    updateUser,
    setAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return context;
}

