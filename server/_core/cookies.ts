import type { SerializeOptions } from "cookie";
import { isProd } from "./env";
import { ONE_YEAR_MS } from "@shared/const";

export function getSessionCookieOptions(maxAgeMs: number = ONE_YEAR_MS): SerializeOptions {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

export function getClearCookieOptions(): SerializeOptions {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}
