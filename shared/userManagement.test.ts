import { describe, it, expect } from "vitest";
import { canDeleteUser, canSendSetupLink } from "./userManagement";

describe("canDeleteUser — delete-user rules", () => {
  it("blocks deleting your own account", () => {
    const res = canDeleteUser({
      actorId: 1,
      targetId: 1,
      targetRole: "admin",
      totalAdmins: 5,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/própria conta/i);
  });

  it("blocks deleting the last admin", () => {
    const res = canDeleteUser({
      actorId: 1,
      targetId: 2,
      targetRole: "admin",
      totalAdmins: 1,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/último administrador/i);
  });

  it("allows deleting another admin when more than one exists", () => {
    const res = canDeleteUser({
      actorId: 1,
      targetId: 2,
      targetRole: "admin",
      totalAdmins: 3,
    });
    expect(res.ok).toBe(true);
  });

  it("allows deleting a regular user regardless of admin count", () => {
    const res = canDeleteUser({
      actorId: 1,
      targetId: 9,
      targetRole: "user",
      totalAdmins: 1,
    });
    expect(res.ok).toBe(true);
  });
});

describe("canSendSetupLink — setup-link rules", () => {
  it("blocks when the user does not exist", () => {
    const res = canSendSetupLink({ exists: false, email: null });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/não encontrado/i);
  });

  it("blocks when the user has no email", () => {
    const res = canSendSetupLink({ exists: true, email: null });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/e-mail/i);
  });

  it("allows when the user exists and has an email", () => {
    const res = canSendSetupLink({ exists: true, email: "a@b.com" });
    expect(res.ok).toBe(true);
  });
});
