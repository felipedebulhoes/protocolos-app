import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Regressão dos bugs reportados em 2026-06-23:
 * 1) getLoginUrl apontava para /doctor-login (rota inexistente) → "página não existe".
 * 2) E-mails enviados de domínio NÃO verificado no Resend → não chegavam.
 */
describe("Regressão: login e e-mail", () => {
  it("getLoginUrl aponta para a rota de login existente /login/doctor", () => {
    const src = readFileSync(resolve(__dirname, "../client/src/const.ts"), "utf-8");
    expect(src).toContain('"/login/doctor"');
    expect(src).not.toContain('"/doctor-login"');
  });

  it("os e-mails são enviados a partir do domínio verificado no Resend", () => {
    const src = readFileSync(resolve(__dirname, "_core/email.ts"), "utf-8");
    // Domínio verificado no Resend (bulhoesurohealth.com)
    expect(src).toContain("@bulhoesurohealth.com");
    // Não deve mais usar o domínio não verificado como remetente
    expect(src).not.toContain("noreply@protocolos.felipebulhoes.com");
  });
});
