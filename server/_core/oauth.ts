import { env } from "./env";
import type { ManusUser } from "./types/manusTypes";

export interface ParsedState {
  origin: string;
  returnPath: string;
}

/**
 * Parse the OAuth state.
 * Our frontend (client/src/const.ts) encodes the state as a base64url JSON
 * object: { origin, returnPath }. We keep backward compatibility with a plain
 * base64-encoded redirectUri string as well.
 */
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

const EXCHANGE_TOKEN_PATH = "/webdev.v1.WebDevAuthPublicService/ExchangeToken";
const GET_USER_INFO_PATH = "/webdev.v1.WebDevAuthPublicService/GetUserInfo";

interface ExchangeTokenResponse {
  accessToken?: string;
  access_token?: string;
}

interface GetUserInfoResponse {
  openId?: string;
  open_id?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

/**
 * Exchange the OAuth authorization code for the Manus user profile.
 *
 * Uses the official Manus WebDev Connect-RPC auth endpoints:
 *   - ExchangeToken: trades the authorization code for an access token
 *   - GetUserInfo:  resolves the access token into the user profile
 *
 * The `redirectUri` MUST be identical to the one used to start the OAuth flow.
 */
export async function exchangeCodeForUser(code: string, redirectUri: string): Promise<ManusUser | null> {
  try {
    const base = env.OAUTH_SERVER_URL.replace(/\/+$/, "");

    const tokenResp = await fetch(`${base}${EXCHANGE_TOKEN_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: env.VITE_APP_ID,
        grantType: "authorization_code",
        code,
        redirectUri,
      }),
    });

    if (!tokenResp.ok) {
      console.error("[oauth] ExchangeToken failed", tokenResp.status, await tokenResp.text());
      return null;
    }

    const tokenData = (await tokenResp.json()) as ExchangeTokenResponse;
    const accessToken = tokenData.accessToken ?? tokenData.access_token;
    if (!accessToken) {
      console.error("[oauth] ExchangeToken returned no accessToken");
      return null;
    }

    const userResp = await fetch(`${base}${GET_USER_INFO_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    });

    if (!userResp.ok) {
      console.error("[oauth] GetUserInfo failed", userResp.status, await userResp.text());
      return null;
    }

    const u = (await userResp.json()) as GetUserInfoResponse;
    const openId = u.openId ?? u.open_id ?? "";
    if (!openId) {
      console.error("[oauth] GetUserInfo returned no openId");
      return null;
    }

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
