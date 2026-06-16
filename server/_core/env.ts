import dotenv from "dotenv";

dotenv.config();

function readVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.warn(`[env] Missing environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT ?? "3000",
  DATABASE_URL: readVar("DATABASE_URL"),
  JWT_SECRET: readVar("JWT_SECRET"),
  VITE_APP_ID: process.env.VITE_APP_ID ?? "",
  OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL ?? "https://api.manus.im",
  VITE_OAUTH_PORTAL_URL: process.env.VITE_OAUTH_PORTAL_URL ?? "https://manus.im",
  OWNER_OPEN_ID: process.env.OWNER_OPEN_ID ?? "",
  OWNER_NAME: process.env.OWNER_NAME ?? "",
  BUILT_IN_FORGE_API_URL: process.env.BUILT_IN_FORGE_API_URL ?? "https://forge.manus.ai",
  BUILT_IN_FORGE_API_KEY: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

export function isProd(): boolean {
  return env.NODE_ENV === "production";
}
