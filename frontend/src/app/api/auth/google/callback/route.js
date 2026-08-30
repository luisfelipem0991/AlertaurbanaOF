import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";
import { getGoogleAuthConfig, verifyGoogleIdToken } from "@/lib/google-auth";
import { OAUTH_STATE_COOKIE } from "../route";

export const runtime = "nodejs";

function loginRedirect(request, error) {
  return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
}

function setSessionCookie(response, user) {
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60,
    path: "/",
  });
  response.cookies.set(OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });
}

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

export async function GET(request) {
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const savedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!state || !code || !savedState || state !== savedState) return loginRedirect(request, "google_state");

  try {
    const { clientId, clientSecret, redirectUri } = getGoogleAuthConfig();
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) throw new Error("Google rechazo el codigo de autorizacion");

    const { id_token: idToken } = await tokenResponse.json();
    const profile = await verifyGoogleIdToken(idToken, clientId);
    if (!profile.sub || !profile.email || profile.email_verified !== true) {
      throw new Error("Google no entrego un correo verificado");
    }

    const email = profile.email.trim().toLowerCase();
    const name = typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : email.split("@")[0];
    const user = await findOrCreateGoogleUser({ sub: profile.sub, email, name });
    const destinations = { USER: "/huecos", JAC: "/huecos/jac", ALCALDIA: "/huecos/alcaldia", ADMIN: "/admin", SUPERADMIN: "/admin" };
    if (!destinations[user.role]) throw new Error("El usuario no tiene un rol valido");

    const response = NextResponse.redirect(new URL(destinations[user.role], request.url));
    setSessionCookie(response, user);
    return response;
  } catch (error) {
    console.error("GOOGLE AUTH CALLBACK ERROR:", error);
    return loginRedirect(request, "google_login");
  }
}
