import axios from "axios";
import { env } from "../config/env.js";
import { AppError } from "../errors/index.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

function assertOAuthConfigured(): void {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    throw new AppError("Google OAuth is not configured", 500);
  }
}

export function buildGoogleAuthUrl(state: string): string {
  assertOAuthConfigured();
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<{ accessToken: string }> {
  assertOAuthConfigured();
  const { data } = await axios.post<{ access_token: string }>(
    GOOGLE_TOKEN_URL,
    new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );
  return { accessToken: data.access_token };
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleUserProfile> {
  const { data } = await axios.get<{
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  }>(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return {
    googleId: data.sub,
    email: data.email,
    name: data.name ?? null,
    avatarUrl: data.picture ?? null,
  };
}
