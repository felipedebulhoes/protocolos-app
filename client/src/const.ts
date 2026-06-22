export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Returns the doctor login page URL.
 * The returnPath is preserved as a query param so the login page can
 * redirect the user back after successful authentication.
 */
export const getLoginUrl = (returnPath: string = "/") => {
  const base = "/doctor-login";
  if (returnPath && returnPath !== "/") {
    return `${base}?returnPath=${encodeURIComponent(returnPath)}`;
  }
  return base;
};
