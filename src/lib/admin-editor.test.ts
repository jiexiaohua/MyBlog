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
        attachments: [
          {
            name: "Spec.pdf",
            filename: "spec-1.pdf",
            url: "/attachments/spec-1.pdf",
            size: 100,
            type: "application/pdf",
            uploadedAt: "2026-06-10T10:00:00.000Z",
          },
        ],
        featured: true,
        body: " Body ",
      }),
    ).toEqual({
        title: "A title",
        excerpt: "A summary",
        categories: "技术, 生活",
        tags: "Next.js, Life",
        attachments: [
          {
            name: "Spec.pdf",
            filename: "spec-1.pdf",
            url: "/attachments/spec-1.pdf",
            size: 100,
            type: "application/pdf",
            uploadedAt: "2026-06-10T10:00:00.000Z",
          },
        ],
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
      attachments: [],
      featured: false,
      body: "# Body",
    };

    expect(
      formsAreEqual(saved, {
        ...saved,
        tags: " Next.js,Life ",
      }),
    ).toBe(true);
    expect(
      formsAreEqual(saved, {
        ...saved,
        attachments: [
          {
            name: "Spec.pdf",
            filename: "spec-1.pdf",
            url: "/attachments/spec-1.pdf",
            size: 100,
            type: "application/pdf",
            uploadedAt: "2026-06-10T10:00:00.000Z",
          },
        ],
      }),
    ).toBe(false);
    expect(formsAreEqual(saved, { ...saved, body: "# Changed" })).toBe(false);
  });
});
