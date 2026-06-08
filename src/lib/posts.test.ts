import { mkdtemp, readFile, rm } from "node:fs/promises";
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
      featured: true,
    });
    expect(post.readingTime).toMatch(/\d+ min read/);
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
        featured: false,
        date: "2026-06-08",
      },
      tempDir,
    );

    expect(first.slug).toBe("hello-next");
    expect(second.slug).toBe("hello-next-2");
    await expect(readFile(path.join(tempDir, "hello-next.md"), "utf8")).resolves
      .toContain("First body");
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
        featured: false,
        date: "2026-06-08",
      },
      tempDir,
    );

    const updated = await updatePost(
      created.slug,
      {
        title: "Updated Title",
        excerpt: "Updated excerpt",
        body: "Updated body",
        tags: ["Published"],
        featured: true,
        date: "2026-06-09",
      },
      tempDir,
    );

    expect(updated.slug).toBe(created.slug);
    expect(updated).toMatchObject({
      title: "Updated Title",
      excerpt: "Updated excerpt",
      tags: ["Published"],
      featured: true,
      date: "2026-06-09",
    });
    await expect(getPostBySlug(created.slug, tempDir)).resolves.toMatchObject({
      content: "Updated body",
    });
  });

  it("deletes a post by slug", async () => {
    const created = await writePost(
      {
        title: "Delete Me",
        excerpt: "Temporary",
        body: "Temporary body",
        tags: [],
        featured: false,
        date: "2026-06-08",
      },
      tempDir,
    );

    await expect(deletePost(created.slug, tempDir)).resolves.toBe(true);
    await expect(getPostBySlug(created.slug, tempDir)).resolves.toBeNull();
    await expect(deletePost(created.slug, tempDir)).resolves.toBe(false);
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
