import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { validateLoginPayload } from "../utils/validators.js";

const REFRESH_COOKIE = "alertaurbana_refresh";
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

export async function login(req, res) {
  try {
    const { valid, errors } = validateLoginPayload(req.body);

    if (!valid) {
      return res.status(400).json({ error: errors[0] });
    }

    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    if (!user.password) {
      return res.status(400).json({ error: "Esta cuenta usa Google. Inicia sesión con Google." });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Generar access token (corta duración, viaja en el body JSON)
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generar refresh token (larga duración, viaja en cookie HttpOnly)
    const refreshVersion = user.refresh_version || 0;
    const refreshToken = jwt.sign(
      { id: user.id, v: refreshVersion },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie(REFRESH_COOKIE, refreshToken, getRefreshCookieOptions());

    return res.json({
      message: "Login exitoso",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        barrio: user.barrio,
        jac_id: user.jac_id,
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
        error: "Error del servidor"
    });
  }
}

// El logout ahora se maneja en authTokenController.js
// Se mantiene esta función legacy para compatibilidad temporal
export function logout(req, res) {
  const envNode = String(process.env.NODE_ENV).replace(/['" ]/g, "");
  const isProduction = envNode === "production";
  res.clearCookie("alertaurbana_session", {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
  });
  res.clearCookie(REFRESH_COOKIE, {
    path: "/api/auth",
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    ...(isProduction ? { partitioned: true } : {}),
  });
  return res.json({ message: "Sesión cerrada" });
}
