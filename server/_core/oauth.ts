import { env } from "./env";
import type { ManusUser } from "./types/manusTypes";

export interface ParsedState {
  origin: string;
  returnPath: string;
}

export function parseState(state: string | undefined | null): ParsedState {
  const fallback: ParsedState = { origin: "", returnPath: "/" };
  if (!state) return fallback;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
    return {
      origin: typeof decoded.origin === "string" ? decoded.origin : "",
      returnPath: typeof decoded.returnPath === "string" ? decoded.returnPath : "/",
    };
  } catch {
    return fallback;
  }
}

/**
 * Exchange the OAuth authorization code for the Manus user profile.
 */
export async function exchangeCodeForUser(code: string, redirectUri: string): Promise<ManusUser | null> {
  try {
    const tokenResp = await fetch(`${env.OAUTH_SERVER_URL}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        app_id: env.VITE_APP_ID,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenResp.ok) {
      console.error("[oauth] token exchange failed", await tokenResp.text());
      return null;
    }
    const tokenData = (await tokenResp.json()) as { access_token?: string };
    if (!tokenData.access_token) return null;

    const userResp = await fetch(`${env.OAUTH_SERVER_URL}/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userResp.ok) {
      console.error("[oauth] userinfo failed", await userResp.text());
      return null;
    }
    const u = (await userResp.json()) as {
      open_id?: string;
      openId?: string;
      name?: string;
      email?: string;
      avatar?: string;
    };
    const openId = u.open_id ?? u.openId ?? "";
    if (!openId) return null;
    return {
      openId,
      name: u.name ?? "",
      email: u.email,
      avatar: u.avatar,
    };
  } catch (e) {
    console.error("[oauth] exchange error", e);
    return null;
  }
}
