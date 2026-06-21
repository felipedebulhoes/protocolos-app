import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { serialize } from "cookie";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { env, isProd } from "./env";
import { COOKIE_NAME, PATIENT_COOKIE_NAME, PENDING_TOTP_COOKIE_NAME, isOwnerOpenId } from "@shared/const";
import { getSessionCookieOptions, getPendingTotpCookieOptions } from "./cookies";
import { exchangeCodeForUser, parseState } from "./oauth";
import { signSession, verifySession, parseCookieHeader } from "./sdk";
import { upsertUserByOpenId, getExamFileByKey } from "../db";
import { storageGetSignedUrl } from "./storageProxy";
import { remindPendingIntakesHandler } from "../scheduledHandlers/remindPendingIntakes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // ---- tRPC ----
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // ---- Manus OAuth callback (doctor login) ----
  app.get("/api/oauth/callback", async (req, res) => {
    try {
      const code = String(req.query.code ?? "");
      const state = String(req.query.state ?? "");
      const { origin, returnPath } = parseState(state);
      const baseOrigin = origin || `${req.protocol}://${req.get("host")}`;
      const redirectUri = `${baseOrigin}/api/oauth/callback`;

      if (!code) {
        return res.redirect(`${baseOrigin}${returnPath || "/"}`);
      }
      const user = await exchangeCodeForUser(code, redirectUri);
      if (!user) {
        return res.status(401).send("OAuth failed");
      }
      const dbUser = await upsertUserByOpenId({
        openId: user.openId,
        name: user.name,
        email: user.email ?? null,
        avatar: user.avatar ?? null,
      });

      // SECURITY: if this account has TOTP (2FA) enabled, OAuth success alone
      // is not enough to grant a full session — we issue a short-lived
      // "pending" token instead and send the browser to the code-entry page.
      // The real session cookie is only set once totp.verifyLogin confirms
      // the 6-digit code server-side.
      if (dbUser.totpEnabled) {
        const pendingToken = await signSession({ openId: dbUser.openId, pendingTotp: true }, "5m");
        res.setHeader("Set-Cookie", serialize(PENDING_TOTP_COOKIE_NAME, pendingToken, getPendingTotpCookieOptions()));
        const totpUrl = new URL(`${baseOrigin}/login/verificar-totp`);
        totpUrl.searchParams.set("returnPath", returnPath || "/");
        return res.redirect(totpUrl.toString());
      }

      const token = await signSession({
        openId: dbUser.openId,
        name: dbUser.name ?? "",
        email: dbUser.email ?? undefined,
        avatar: dbUser.avatar ?? undefined,
      });
      res.setHeader("Set-Cookie", serialize(COOKIE_NAME, token, getSessionCookieOptions()));
      return res.redirect(`${baseOrigin}${returnPath || "/"}`);
    } catch (e) {
      console.error("[oauth callback] error", e);
      return res.status(500).send("OAuth error");
    }
  });

  // ---- Scheduled / Heartbeat callbacks ----
  app.post("/api/scheduled/remindPendingIntakes", remindPendingIntakesHandler);

  // ---- Storage proxy (signed redirect) ----
  // SECURITY: every exam file belongs to a patient. Before handing out a
  // signed URL we require either (a) the doctor/owner session, or (b) a
  // patient session whose patientId matches the file's owner. Anonymous
  // requests are rejected — this prevents enumerating other patients'
  // lab results via guessable storage keys.
  app.get("/manus-storage/*", async (req, res) => {
    try {
      const key = req.path.replace(/^\/manus-storage\//, "");
      if (!key) return res.status(400).send("Missing key");

      const cookies = parseCookieHeader(req.headers.cookie);

      let isAuthorizedDoctor = false;
      const doctorToken = cookies[COOKIE_NAME];
      if (doctorToken) {
        const payload = await verifySession(doctorToken);
        if (payload?.openId && isOwnerOpenId(payload.openId as string, env.OWNER_OPEN_ID)) {
          isAuthorizedDoctor = true;
        }
      }

      let patientId: number | null = null;
      const patientToken = cookies[PATIENT_COOKIE_NAME];
      if (patientToken) {
        const payload = await verifySession(patientToken);
        const pid = (payload as unknown as { patientId?: number })?.patientId;
        if (pid) patientId = pid;
      }

      if (!isAuthorizedDoctor && !patientId) {
        return res.status(401).send("Unauthorized");
      }

      if (!isAuthorizedDoctor) {
        const file = await getExamFileByKey(key);
        if (!file || file.patientId !== patientId) {
          return res.status(403).send("Forbidden");
        }
      }

      const url = await storageGetSignedUrl(key);
      if (!url) return res.status(502).send("No signed url");
      res.setHeader("Cache-Control", "no-store");
      return res.redirect(307, url);
    } catch (e) {
      console.error("[storage proxy] error", e);
      return res.status(502).send("Storage proxy error");
    }
  });

  // ---- Frontend (Vite in dev, static in prod) ----
  if (isProd()) {
    const staticPath = path.resolve(__dirname, "..", "public");
    app.use(express.static(staticPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const clientRoot = path.resolve(__dirname, "..", "..", "client");
    const vite = await createViteServer({
      // Load the project's vite.config.ts (aliases @, @shared, plugins, root=client).
      configFile: path.resolve(__dirname, "..", "..", "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    // SPA fallback: serve transformed index.html for all non-API routes.
    app.use(async (req, res, next) => {
      try {
        if (req.method !== "GET") return next();
        const url = req.originalUrl;
        const fs = await import("fs");
        const template = fs.readFileSync(path.join(clientRoot, "index.html"), "utf-8");
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        next(e);
      }
    });
  }

  const port = Number(env.PORT) || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
