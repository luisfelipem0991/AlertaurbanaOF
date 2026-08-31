import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { getGoogleAuthConfig, verifyGoogleIdToken } from "../utils/googleAuth.js";

const OAUTH_STATE_COOKIE = "alertaurbana_google_oauth_state";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Utilidad para buscar o crear el usuario
async function findOrCreateGoogleUser({ sub, email, name }) {
  const byGoogleId = await pool.query("SELECT id, name, role FROM users WHERE google_sub = $1", [sub]);
  if (byGoogleId.rows[0]) return byGoogleId.rows[0];

  const byEmail = await pool.query("SELECT id, name, role FROM users WHERE email = $1", [email]);
  if (byEmail.rows[0]) {
    const linked = await pool.query(
      "UPDATE users SET google_sub = $1 WHERE id = $2 RETURNING id, name, role",
      [sub, byEmail.rows[0].id]
    );
    return linked.rows[0];
  }

  const created = await pool.query(
    "INSERT INTO users (name, email, password, google_sub) VALUES ($1, $2, NULL, $3) RETURNING id, name, role",
    [name.slice(0, 255), email, sub]
  );
  return created.rows[0];
}

// GET /api/auth/google
export async function startGoogleAuth(req, res) {
  try {
    const { clientId, redirectUri } = getGoogleAuthConfig();
    const state = randomBytes(32).toString("hex");
    
    const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authorizationUrl.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    }).toString();

    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
      path: "/",
    });

    return res.redirect(authorizationUrl.toString());
  } catch (error) {
    console.error("GOOGLE AUTH START ERROR:", error);
    return res.redirect(`${FRONTEND_URL}/login?error=google_config`);
  }
}

// GET /api/auth/google/callback
export async function googleAuthCallback(req, res) {
  const { state, code } = req.query;
  
  const cookie = req.headers.cookie
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${OAUTH_STATE_COOKIE}=`));
  const savedState = cookie ? decodeURIComponent(cookie.slice(OAUTH_STATE_COOKIE.length + 1)) : null;

  if (!state || !code || !savedState || state !== savedState) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_state`);
  }

  try {
    const { clientId, clientSecret, redirectUri } = getGoogleAuthConfig();
    
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code, 
        client_id: clientId, 
        client_secret: clientSecret, 
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) throw new Error("Google rechazó el código de autorización");

    const { id_token: idToken } = await tokenResponse.json();
    const profile = await verifyGoogleIdToken(idToken, clientId);
    
    if (!profile.sub || !profile.email || profile.email_verified !== true) {
      throw new Error("Google no entregó un correo verificado");
    }

    const email = profile.email.trim().toLowerCase();
    const name = typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : email.split("@")[0];
    
    const user = await findOrCreateGoogleUser({ sub: profile.sub, email, name });
    
    const destinations = { 
      USER: "/huecos", 
      JAC: "/huecos/jac", 
      ALCALDIA: "/huecos/alcaldia", 
      ADMIN: "/admin", 
      SUPERADMIN: "/admin" 
    };
    
    if (!destinations[user.role]) throw new Error("El usuario no tiene un rol válido");

    // Limpiar estado
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });

    // Setear JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("alertaurbana_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    return res.redirect(`${FRONTEND_URL}${destinations[user.role]}`);

  } catch (error) {
    console.error("GOOGLE AUTH CALLBACK ERROR:", error);
    return res.redirect(`${FRONTEND_URL}/login?error=google_login`);
  }
}
