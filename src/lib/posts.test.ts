import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildPostMarkdown,
  createSlug,
  deletePost,
  getAllPosts,
  getPostBySlug,
  parsePost,
  updatePost,
  writePost,
} from "./posts";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "myblog-posts-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("posts", () => {
  it("parses front matter and derives reading metadata", () => {
    const post = parsePost(
      "hello-next",
      `---
title: Hello Next
date: 2026-06-08
excerpt: A short summary
tags:
  - Next.js
  - Blog
categories:
  - 技术
  - 生活
attachments:
  - name: Deck.pdf
    filename: deck-123.pdf
    url: /attachments/deck-123.pdf
    size: 2048
    type: application/pdf
    uploadedAt: 2026-06-10T10:00:00.000Z
featured: true
---

# Hello

This is the first post about a personal blog.
`,
    );

    expect(post).toMatchObject({
      slug: "hello-next",
      title: "Hello Next",
      excerpt: "A short summary",
      tags: ["Next.js", "Blog"],
      categories: ["技术", "生活"],
      attachments: [
        {
          name: "Deck.pdf",
          filename: "deck-123.pdf",
          url: "/attachments/deck-123.pdf",
          size: 2048,
          type: "application/pdf",
          uploadedAt: "2026-06-10T10:00:00.000Z",
        },
      ],
      featured: true,
    });
    expect(post.readingTime).toMatch(/\d+ min read/);
  });

  it("defaults legacy posts without categories into the essay category", () => {
    const post = parsePost(
      "legacy",
      `---
title: Legacy
date: 2026-06-08
excerpt: Old post
tags: []
featured: false
---

Body
`,
    );

    expect(post.categories).toEqual(["随笔"]);
    expect(post.attachments).toEqual([]);
  });

  it("generates stable url-safe slugs with a date fallback", () => {
    expect(createSlug("Hello, Next.js Blog!")).toBe("hello-next-js-blog");
    expect(createSlug("你好，世界", new Date("2026-06-08T09:10:00Z"))).toBe(
      "post-2026-06-08",
    );
  });

  it("writes a markdown post and de-duplicates repeated slugs", async () => {
    const first = await writePost(
      {
        title: "Hello Next",
        excerpt: "One",
        body: "First body",
        tags: ["Next.js"],
        categories: ["技术"],
        attachments: [
          {
            name: "Spec.pdf",
            filename: "spec-1.pdf",
            url: "/attachments/spec-1.pdf",
            size: 1200,
            type: "application/pdf",
            uploadedAt: "2026-06-10T10:00:00.000Z",
          },
        ],
        featured: true,
        date: "2026-06-08",
      },
      tempDir,
    );
    const second = await writePost(
      {
        title: "Hello Next",
        excerpt: "Two",
        body: "Second body",
        tags: ["Life"],
        categories: ["生活", "随笔"],
        featured: false,
        date: "2026-06-08",
      },
      tempDir,
    );

    expect(first.slug).toBe("hello-next");
    expect(second.slug).toBe("hello-next-2");
    await expect(readFile(path.join(tempDir, "hello-next.md"), "utf8")).resolves
      .toContain('filename: "spec-1.pdf"');
  });

  it("lists posts newest first", async () => {
    await writePost(
      {
        title: "Older",
        excerpt: "Older post",
        body: "Older body",
        tags: [],
        featured: false,
        date: "2026-06-01",
      },
      tempDir,
    );
    await writePost(
      {
        title: "Newer",
        excerpt: "Newer post",
        body: "Newer body",
        tags: [],
        featured: false,
        date: "2026-06-08",
      },
      tempDir,
    );

    const posts = await getAllPosts(tempDir);

    expect(posts.map((post) => post.title)).toEqual(["Newer", "Older"]);
  });

  it("updates a post without changing its slug", async () => {
    const created = await writePost(
      {
        title: "Original Title",
        excerpt: "Original excerpt",
        body: "Original body",
        tags: ["Draft"],
        categories: ["草稿"],
        attachments: [
          {
            name: "Draft.pdf",
            filename: "draft.pdf",
            url: "/attachments/draft.pdf",
            size: 5,
            type: "application/pdf",
            uploadedAt: "2026-06-10T09:00:00.000Z",
          },
        ],
        featured: false,
        date: "2026-06-08",
      },
      tempDir,
    );

    const attachmentsDir = await mkdtemp(path.join(os.tmpdir(), "myblog-attachments-"));
    await writeFile(path.join(attachmentsDir, "draft.pdf"), "draft");
    await writeFile(path.join(attachmentsDir, "keep.pdf"), "keep");

    const updated = await updatePost(
      created.slug,
      {
        title: "Updated Title",
        excerpt: "Updated excerpt",
        body: "Updated body",
        tags: ["Published"],
        categories: ["技术", "发布"],
        attachments: [
          {
            name: "Keep.pdf",
            filename: "keep.pdf",
            url: "/attachments/keep.pdf",
            size: 4,
            type: "application/pdf",
            uploadedAt: "2026-06-10T10:00:00.000Z",
          },
        ],
        featured: true,
        date: "2026-06-09",
      },
      tempDir,
      attachmentsDir,
    );

    expect(updated.slug).toBe(created.slug);
    expect(updated).toMatchObject({
      title: "Updated Title",
      excerpt: "Updated excerpt",
      tags: ["Published"],
      categories: ["技术", "发布"],
      attachments: [
        {
          name: "Keep.pdf",
          filename: "keep.pdf",
          url: "/attachments/keep.pdf",
          size: 4,
          type: "application/pdf",
          uploadedAt: "2026-06-10T10:00:00.000Z",
        },
      ],
      featured: true,
      date: "2026-06-09",
    });
    await expect(stat(path.join(attachmentsDir, "keep.pdf"))).resolves.toBeTruthy();
    await expect(stat(path.join(attachmentsDir, "draft.pdf"))).rejects.toThrow();
    await expect(getPostBySlug(created.slug, tempDir)).resolves.toMatchObject({
      content: "Updated body",
    });

    await rm(attachmentsDir, { recursive: true, force: true });
  });

  it("deletes a post by slug and removes its attachment files", async () => {
    const attachmentsDir = await mkdtemp(path.join(os.tmpdir(), "myblog-attachments-"));
    await writeFile(path.join(attachmentsDir, "delete-me.pdf"), "attachment");
    const created = await writePost(
      {
        title: "Delete Me",
        excerpt: "Temporary",
        body: "Temporary body",
        tags: [],
        attachments: [
          {
            name: "Delete Me.pdf",
            filename: "delete-me.pdf",
            url: "/attachments/delete-me.pdf",
            size: 10,
            type: "application/pdf",
            uploadedAt: "2026-06-10T10:00:00.000Z",
          },
        ],
        featured: false,
        date: "2026-06-08",
      },
      tempDir,
    );

    await expect(deletePost(created.slug, tempDir, attachmentsDir)).resolves.toBe(true);
    await expect(getPostBySlug(created.slug, tempDir)).resolves.toBeNull();
    await expect(deletePost(created.slug, tempDir)).resolves.toBe(false);
    await expect(stat(path.join(attachmentsDir, "delete-me.pdf"))).rejects.toThrow();
    await rm(attachmentsDir, { recursive: true, force: true });
  });

  it("builds front matter with escaped quoted values", () => {
    const markdown = buildPostMarkdown({
      title: 'A "quoted" day',
      excerpt: "Small note",
      body: "Body",
      tags: ["notes"],
      featured: false,
      date: "2026-06-08",
    });

    expect(markdown).toContain('title: "A \\"quoted\\" day"');
    expect(markdown).toContain("Body");
  });
});
