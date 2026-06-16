export const COOKIE_NAME = "app_session_id";
export const PATIENT_COOKIE_NAME = "patient_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
export const PATIENT_UNAUTHED_ERR_MSG = "Patient login required (20001)";
export const NOT_OWNER_ERR_MSG = "You do not have required permission (10003)";

/**
 * Pure ownership check shared between the backend procedures and the
 * `auth.me` flag. Returns true only when a valid owner id is configured and
 * matches the given user's openId. Kept dependency-free so it is unit-testable.
 */
export function isOwnerOpenId(
  userOpenId: string | null | undefined,
  ownerOpenId: string | null | undefined,
): boolean {
  if (!ownerOpenId || !userOpenId) return false;
  return userOpenId === ownerOpenId;
}
