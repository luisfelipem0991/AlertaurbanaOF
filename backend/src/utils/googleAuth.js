import { createPublicKey } from "crypto";
import jwt from "jsonwebtoken";

const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export function getGoogleAuthConfig() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error("Google OAuth no esta configurado");
  }

  return { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, redirectUri: GOOGLE_REDIRECT_URI };
}

export async function verifyGoogleIdToken(idToken, clientId) {
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded?.header?.kid) throw new Error("Token de Google invalido");

  const certificatesResponse = await fetch(GOOGLE_CERTS_URL, { cache: "no-store" });
  if (!certificatesResponse.ok) throw new Error("No fue posible verificar el token de Google");

  const certificates = await certificatesResponse.json();
  const jwk = certificates.keys?.find((key) => key.kid === decoded.header.kid);
  if (!jwk) throw new Error("La clave del token de Google no fue encontrada");

  return jwt.verify(idToken, createPublicKey({ key: jwk, format: "jwk" }), {
    algorithms: ["RS256"],
    audience: clientId,
    issuer: GOOGLE_ISSUERS,
  });
}

