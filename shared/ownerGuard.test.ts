import { describe, it, expect } from "vitest";
import { isOwnerOpenId } from "./const";

describe("isOwnerOpenId — owner-only access logic", () => {
  const OWNER = "open-id-doctor-felipe";

  it("returns true when the user's openId matches the configured owner", () => {
    expect(isOwnerOpenId(OWNER, OWNER)).toBe(true);
  });

  it("returns false for a different authenticated user", () => {
    expect(isOwnerOpenId("some-other-user", OWNER)).toBe(false);
  });

  it("returns false when no user is provided (anonymous)", () => {
    expect(isOwnerOpenId(null, OWNER)).toBe(false);
    expect(isOwnerOpenId(undefined, OWNER)).toBe(false);
    expect(isOwnerOpenId("", OWNER)).toBe(false);
  });

  it("returns false when the owner id is not configured (fail closed)", () => {
    expect(isOwnerOpenId(OWNER, null)).toBe(false);
    expect(isOwnerOpenId(OWNER, undefined)).toBe(false);
    expect(isOwnerOpenId(OWNER, "")).toBe(false);
  });

  it("does not grant access when both ids are empty", () => {
    expect(isOwnerOpenId("", "")).toBe(false);
    expect(isOwnerOpenId(null, null)).toBe(false);
  });
});
