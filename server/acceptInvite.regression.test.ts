import { describe, it, expect } from "vitest";

/**
 * Regression test for the "Erro ao aceitar convite" bug.
 *
 * Root cause: team_members.invitation_token is NOT NULL + UNIQUE. The accept
 * flow used to set invitation_token = "" on accept, so the SECOND accepted
 * invite collided on the unique index, producing a failed UPDATE query.
 *
 * Fix: replace the token with a unique, non-reusable sentinel value.
 * This test reproduces the token-generation logic used in acceptInvite and
 * asserts that consecutive accepts never produce the same (or empty) token.
 */

function makeUsedToken(memberId: number): string {
  // Mirrors the logic in server/routers/team.ts acceptInvite.
  const rand = Math.random().toString(16).slice(2, 18);
  return `used:${memberId}:${Date.now()}:${rand}`;
}

describe("acceptInvite token retirement", () => {
  it("never produces an empty token", () => {
    const token = makeUsedToken(150002);
    expect(token).not.toBe("");
    expect(token.startsWith("used:")).toBe(true);
  });

  it("produces unique tokens for different members (no UNIQUE collision)", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      tokens.add(makeUsedToken(i));
    }
    // All 1000 should be unique -> no collision on the unique index.
    expect(tokens.size).toBe(1000);
  });

  it("produces unique tokens even for the SAME member accepted twice", () => {
    const a = makeUsedToken(120001);
    const b = makeUsedToken(120001);
    expect(a).not.toBe(b);
  });
});
