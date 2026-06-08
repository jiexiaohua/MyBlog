import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  verifyPassword,
  verifySessionToken,
} from "./admin-auth";

describe("admin auth", () => {
  it("compares passwords without accepting partial matches", () => {
    expect(verifyPassword("ship", "ship")).toBe(true);
    expect(verifyPassword("shi", "ship")).toBe(false);
    expect(verifyPassword("ship ", "ship")).toBe(false);
  });

  it("creates signed session tokens that verify with the same secret", () => {
    const token = createSessionToken("secret", 1_718_000_000_000);

    expect(verifySessionToken(token, "secret", 1_718_000_001_000)).toBe(true);
    expect(verifySessionToken(token, "wrong", 1_718_000_001_000)).toBe(false);
  });

  it("rejects expired or malformed session tokens", () => {
    const token = createSessionToken("secret", 1_718_000_000_000);
    const eightDaysLater = 1_718_000_000_000 + 8 * 24 * 60 * 60 * 1000;

    expect(verifySessionToken(token, "secret", eightDaysLater)).toBe(false);
    expect(verifySessionToken("not-a-token", "secret")).toBe(false);
  });
});
