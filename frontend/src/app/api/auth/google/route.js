import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getGoogleAuthConfig } from "@/lib/google-auth";

export const OAUTH_STATE_COOKIE = "alertaurbana_google_oauth_state";
export const runtime = "nodejs";

export async function GET(request) {
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

    const response = NextResponse.redirect(authorizationUrl);
    response.cookies.set(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("GOOGLE AUTH START ERROR:", error);
    return NextResponse.redirect(new URL("/login?error=google_config", request.url));
  }
}
