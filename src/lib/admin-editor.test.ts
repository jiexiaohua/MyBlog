import { describe, expect, it } from "vitest";
import { formsAreEqual, normalizePostForm } from "./admin-editor";

describe("admin editor helpers", () => {
  it("normalizes tag spacing before dirty checks", () => {
    expect(
      normalizePostForm({
        title: "  A title  ",
        excerpt: "  A summary  ",
        categories: "技术,  生活,,",
        tags: "Next.js,  Life,,",
        featured: true,
        body: " Body ",
      }),
    ).toEqual({
        title: "A title",
        excerpt: "A summary",
        categories: "技术, 生活",
        tags: "Next.js, Life",
        featured: true,
        body: "Body",
    });
  });

  it("detects unsaved changes after normalization", () => {
    const saved = {
      title: "A title",
      excerpt: "A summary",
      categories: "技术, 生活",
      tags: "Next.js, Life",
      featured: false,
      body: "# Body",
    };

    expect(
      formsAreEqual(saved, {
        ...saved,
        tags: " Next.js,Life ",
      }),
    ).toBe(true);
    expect(formsAreEqual(saved, { ...saved, body: "# Changed" })).toBe(false);
  });
});
