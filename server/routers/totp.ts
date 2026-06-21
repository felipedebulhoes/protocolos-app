import { z } from "zod";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { serialize } from "cookie";
import { TRPCError } from "@trpc/server";
import { ownerProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { parseCookieHeader, verifySession, signSession } from "../_core/sdk";
import { getSessionCookieOptions, getClearCookieOptions } from "../_core/cookies";
import {
  COOKIE_NAME,
  PENDING_TOTP_COOKIE_NAME,
  TOTP_PENDING_EXPIRED_ERR_MSG,
  TOTP_INVALID_CODE_ERR_MSG,
} from "@shared/const";

const APP_NAME = "ProtoUro";

export const totpRouter = router({
  /**
   * Generate a new TOTP secret and QR code URL for setup.
   * Does NOT enable 2FA yet — user must verify first.
   */
  setupInit: ownerProcedure.mutation(async ({ ctx }) => {
    const secretObj = speakeasy.generateSecret({
      name: `${APP_NAME} (${ctx.user.email ?? ctx.user.name})`,
      issuer: APP_NAME,
      length: 20,
    });

    const qrDataUrl = await QRCode.toDataURL(secretObj.otpauth_url!);

    // Save secret (not yet enabled)
    await db
      .update(users)
      .set({ totpSecret: secretObj.base32, totpEnabled: 0 })
      .where(eq(users.openId, ctx.user.openId));

    return { secret: secretObj.base32, qrDataUrl };
  }),

  /**
   * Verify a TOTP code and enable 2FA if correct.
   */
  setupVerify: ownerProcedure
    .input(z.object({ code: z.string().min(6).max(6) }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await db
        .select({ totpSecret: users.totpSecret })
        .from(users)
        .where(eq(users.openId, ctx.user.openId))
        .limit(1);

      if (!row?.totpSecret) {
        throw new Error("Setup não iniciado. Chame setupInit primeiro.");
      }

      const isValid = speakeasy.totp.verify({
        secret: row.totpSecret,
        encoding: "base32",
        token: input.code,
        window: 1,
      });

      if (!isValid) {
        throw new Error("Código inválido. Tente novamente.");
      }

      await db
        .update(users)
        .set({ totpEnabled: 1 })
        .where(eq(users.openId, ctx.user.openId));

      return { success: true };
    }),

  /**
   * Disable 2FA after verifying the current TOTP code.
   */
  disable: ownerProcedure
    .input(z.object({ code: z.string().min(6).max(6) }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await db
        .select({ totpSecret: users.totpSecret, totpEnabled: users.totpEnabled })
        .from(users)
        .where(eq(users.openId, ctx.user.openId))
        .limit(1);

      if (!row?.totpSecret || !row.totpEnabled) {
        throw new Error("2FA não está ativado.");
      }

      const isValid = speakeasy.totp.verify({
        secret: row.totpSecret,
        encoding: "base32",
        token: input.code,
        window: 1,
      });

      if (!isValid) {
        throw new Error("Código inválido. Tente novamente.");
      }

      await db
        .update(users)
        .set({ totpSecret: null, totpEnabled: 0 })
        .where(eq(users.openId, ctx.user.openId));

      return { success: true };
    }),

  /**
   * Get current 2FA status for the logged-in user.
   */
  status: ownerProcedure.query(async ({ ctx }) => {
    const [row] = await db
      .select({ totpEnabled: users.totpEnabled })
      .from(users)
      .where(eq(users.openId, ctx.user.openId))
      .limit(1);

    return { enabled: Boolean(row?.totpEnabled) };
  }),

  /**
   * Second step of doctor login when 2FA is enabled. Reads the short-lived
   * "pending" cookie set right after a successful OAuth exchange, verifies
   * the 6-digit TOTP code against the account's secret, and — only then —
   * issues the real session cookie. publicProcedure on purpose: there is no
   * full session yet at this point, only the pending one.
   */
  verifyLogin: publicProcedure
    .input(z.object({ code: z.string().min(6).max(6) }))
    .mutation(async ({ ctx, input }) => {
      const cookies = parseCookieHeader(ctx.req.headers.cookie);
      const pendingToken = cookies[PENDING_TOTP_COOKIE_NAME];
      if (!pendingToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: TOTP_PENDING_EXPIRED_ERR_MSG });
      }

      const payload = await verifySession(pendingToken);
      if (!payload?.openId || payload.pendingTotp !== true) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: TOTP_PENDING_EXPIRED_ERR_MSG });
      }

      const [row] = await db
        .select()
        .from(users)
        .where(eq(users.openId, payload.openId))
        .limit(1);

      if (!row?.totpSecret || !row.totpEnabled) {
        // 2FA was disabled mid-flow — nothing to verify, deny and force a fresh login.
        throw new TRPCError({ code: "UNAUTHORIZED", message: TOTP_PENDING_EXPIRED_ERR_MSG });
      }

      const isValid = speakeasy.totp.verify({
        secret: row.totpSecret,
        encoding: "base32",
        token: input.code,
        window: 1,
      });
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: TOTP_INVALID_CODE_ERR_MSG });
      }

      const sessionToken = await signSession({
        openId: row.openId,
        name: row.name ?? "",
        email: row.email ?? undefined,
        avatar: row.avatar ?? undefined,
      });

      ctx.res.setHeader("Set-Cookie", [
        serialize(COOKIE_NAME, sessionToken, getSessionCookieOptions()),
        serialize(PENDING_TOTP_COOKIE_NAME, "", getClearCookieOptions()),
      ]);

      return { ok: true };
    }),
});
