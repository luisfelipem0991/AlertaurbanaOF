import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// ─── Almacén en memoria de tickets temporales (expiran en 60s) ───
const ticketStore = new Map();

// Limpia tickets expirados cada 2 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of ticketStore) {
    if (now > value.expiresAt) ticketStore.delete(key);
  }
}, 120_000);

// ─── Constantes ───
const REFRESH_COOKIE = "alertaurbana_refresh";
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function getRefreshCookieOptions() {
  const envNode = String(process.env.NODE_ENV).replace(/['" ]/g, "");
  const isProduction = envNode === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    ...(isProduction ? { partitioned: true } : {}),
    maxAge: REFRESH_EXPIRY_MS,
    path: "/api/auth",
  };
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
}

function signRefreshToken(user, version) {
  return jwt.sign(
    { id: user.id, v: version },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ─── Utilidades para Tickets ───
export function createTicket(userId) {
  const ticket = randomBytes(32).toString("hex");
  ticketStore.set(ticket, {
    userId,
    expiresAt: Date.now() + 60_000, // 60 segundos
  });
  return ticket;
}

// ─── POST /api/auth/exchange ───
// Canjea un ticket temporal de un solo uso por un access token + refresh cookie
export async function exchangeTicket(req, res) {
  try {
    const { ticket } = req.body;

    if (!ticket || typeof ticket !== "string") {
      return res.status(400).json({ error: "Ticket requerido" });
    }

    const stored = ticketStore.get(ticket);
    if (!stored) {
      return res.status(401).json({ error: "Ticket inválido o expirado" });
    }

    // Invalidar inmediatamente (un solo uso)
    ticketStore.delete(ticket);

    if (Date.now() > stored.expiresAt) {
      return res.status(401).json({ error: "Ticket expirado" });
    }

    // Obtener datos del usuario
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [stored.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const refreshVersion = user.refresh_version || 0;

    // Generar tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user, refreshVersion);

    // Enviar refresh token como cookie HttpOnly
    res.cookie(REFRESH_COOKIE, refreshToken, getRefreshCookieOptions());

    return res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        barrio: user.barrio,
        jac_id: user.jac_id,
      },
    });
  } catch (error) {
    console.error("EXCHANGE ERROR:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
}

// ─── POST /api/auth/refresh ───
// Renueva el access token usando el refresh token de la cookie HttpOnly
export async function refreshSession(req, res) {
  try {
    // Leer la cookie de refresh (parseamos manualmente porque Express no
    // tiene cookie-parser como dependencia)
    const cookie = req.headers.cookie
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${REFRESH_COOKIE}=`));

    const refreshToken = cookie
      ? decodeURIComponent(cookie.slice(REFRESH_COOKIE.length + 1))
      : null;

    if (!refreshToken) {
      return res.status(401).json({ error: "No autenticado" });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch {
      // Token expirado o inválido: limpiar cookie
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      return res.status(401).json({ error: "Sesión expirada" });
    }

    // Verificar que la versión del token coincide con la del usuario en BD
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [payload.id]
    );

    if (result.rows.length === 0) {
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    if (payload.v !== undefined && payload.v !== (user.refresh_version || 0)) {
      // Versión desactualizada → posible reuso malicioso
      // Invalidar TODAS las sesiones del usuario
      try {
        await pool.query(
          "UPDATE users SET refresh_version = COALESCE(refresh_version, 0) + 1 WHERE id = $1",
          [user.id]
        );
      } catch {}
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      return res.status(401).json({ error: "Sesión invalidada por seguridad" });
    }

    // Rotación: incrementar versión y emitir nuevos tokens
    const newVersion = (user.refresh_version || 0) + 1;
    try {
      await pool.query(
        "UPDATE users SET refresh_version = $1 WHERE id = $2",
        [newVersion, user.id]
      );
    } catch {}

    const accessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user, newVersion);

    res.cookie(REFRESH_COOKIE, newRefreshToken, getRefreshCookieOptions());

    return res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        barrio: user.barrio,
        jac_id: user.jac_id,
      },
    });
  } catch (error) {
    console.error("REFRESH ERROR:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
}

// ─── POST /api/auth/logout ───
// Invalida el refresh token y limpia la cookie
export async function logoutSession(req, res) {
  try {
    // Leer el refresh token para obtener el user ID
    const cookie = req.headers.cookie
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${REFRESH_COOKIE}=`));

    const refreshToken = cookie
      ? decodeURIComponent(cookie.slice(REFRESH_COOKIE.length + 1))
      : null;

    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
        // Incrementar versión para invalidar todos los refresh tokens existentes
        await pool.query(
          "UPDATE users SET refresh_version = refresh_version + 1 WHERE id = $1",
          [payload.id]
        );
      } catch {
        // Token ya expirado o inválido, no importa
      }
    }

    const envNode = String(process.env.NODE_ENV).replace(/['" ]/g, "");
    const isProduction = envNode === "production";

    // Limpiar cookie de refresh
    res.clearCookie(REFRESH_COOKIE, {
      path: "/api/auth",
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      ...(isProduction ? { partitioned: true } : {}),
    });

    // También limpiar la cookie antigua de sesión (backward compat)
    res.clearCookie("alertaurbana_session", {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      path: "/",
    });

    return res.json({ message: "Sesión cerrada" });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
}

