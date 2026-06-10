import { describe, expect, it } from "vitest";
import {
  filterPosts,
  getAvailableCategories,
  getAvailableTags,
} from "./post-filters";

const posts = [
  {
    slug: "next-notes",
    title: "Next.js Notes",
    excerpt: "Static rendering and metadata",
    tags: ["Next.js", "SEO"],
    categories: ["技术"],
  },
  {
    slug: "daily-log",
    title: "Daily Log",
    excerpt: "Life by the sea",
    tags: ["Life"],
    categories: ["生活", "随笔"],
  },
  {
    slug: "image-workflow",
    title: "Image Workflow",
    excerpt: "Upload png and convert it to webp",
    tags: ["Next.js", "Images"],
    categories: ["技术", "工具"],
  },
];

describe("post filters", () => {
  it("filters posts by title, excerpt, slug, and tag text", () => {
    expect(filterPosts(posts, { query: "metadata" }).map((post) => post.slug))
      .toEqual(["next-notes"]);
    expect(filterPosts(posts, { query: "webp" }).map((post) => post.slug))
      .toEqual(["image-workflow"]);
    expect(filterPosts(posts, { query: "life" }).map((post) => post.slug))
      .toEqual(["daily-log"]);
    expect(filterPosts(posts, { query: "image-workflow" }).map((post) => post.slug))
      .toEqual(["image-workflow"]);
    expect(filterPosts(posts, { query: "工具" }).map((post) => post.slug))
      .toEqual(["image-workflow"]);
  });

  it("filters posts by active tag and combines it with the query", () => {
    expect(filterPosts(posts, { activeTag: "Next.js" }).map((post) => post.slug))
      .toEqual(["next-notes", "image-workflow"]);
    expect(
      filterPosts(posts, { query: "metadata", activeTag: "Next.js" }).map(
        (post) => post.slug,
      ),
    ).toEqual(["next-notes"]);
    expect(filterPosts(posts, { query: "life", activeTag: "Next.js" })).toEqual(
      [],
    );
  });

  it("returns available tags sorted by usage then name", () => {
    expect(getAvailableTags(posts)).toEqual([
      { name: "Next.js", count: 2 },
      { name: "Images", count: 1 },
      { name: "Life", count: 1 },
      { name: "SEO", count: 1 },
    ]);
  });

  it("filters posts by one or more active categories with OR matching", () => {
    expect(
      filterPosts(posts, { activeCategories: ["生活"] }).map((post) => post.slug),
    ).toEqual(["daily-log"]);
    expect(
      filterPosts(posts, { activeCategories: ["生活", "工具"] }).map(
        (post) => post.slug,
      ),
    ).toEqual(["daily-log", "image-workflow"]);
    expect(
      filterPosts(posts, { query: "webp", activeCategories: ["生活", "工具"] })
        .map((post) => post.slug),
    ).toEqual(["image-workflow"]);
  });

  it("returns available categories sorted by usage then name", () => {
    expect(getAvailableCategories(posts)).toEqual([
      { name: "技术", count: 2 },
      { name: "工具", count: 1 },
      { name: "生活", count: 1 },
      { name: "随笔", count: 1 },
    ]);
  });
});
