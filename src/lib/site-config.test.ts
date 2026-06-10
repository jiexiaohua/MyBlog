import { describe, expect, it } from "vitest";
import { getSiteHost, getSiteOrigin, getSiteUrl } from "./site-config";

describe("site config", () => {
  it("reads BLOG_SITE_URL as the canonical origin", () => {
    const url = getSiteUrl({ BLOG_SITE_URL: "https://example.com/blog/" });

    expect(url.origin).toBe("https://example.com");
    expect(getSiteOrigin({ BLOG_SITE_URL: "https://example.com/blog/" })).toBe(
      "https://example.com",
    );
    expect(getSiteHost({ BLOG_SITE_URL: "https://example.com/blog/" })).toBe(
      "example.com",
    );
  });

  it("falls back to the current production domain for missing or invalid values", () => {
    expect(getSiteOrigin({})).toBe("http://xiaohua.host");
    expect(getSiteOrigin({ BLOG_SITE_URL: "not-a-url" })).toBe(
      "http://xiaohua.host",
    );
    expect(getSiteOrigin({ BLOG_SITE_URL: "ftp://xiaohua.host" })).toBe(
      "http://xiaohua.host",
    );
  });
});
