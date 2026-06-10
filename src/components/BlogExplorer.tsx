"use client";

import { useMemo, useState } from "react";
import { FolderOpen, Search, X } from "lucide-react";
import { filterPosts, getAvailableCategories } from "@/lib/post-filters";
import type { Post } from "@/lib/posts";
import { PostCard } from "./PostCard";

export function BlogExplorer({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const categories = useMemo(() => getAvailableCategories(posts), [posts]);
  const filteredPosts = useMemo(
    () => filterPosts(posts, { query, activeCategories }),
    [activeCategories, posts, query],
  );
  const hasFilters = Boolean(query.trim() || activeCategories.length > 0);

  function clearFilters() {
    setQuery("");
    setActiveCategories([]);
  }

  function toggleCategory(category: string) {
    setActiveCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-8">
      <div className="grid gap-4">
        <div className="rounded-lg border border-[var(--line)] bg-white/82 p-3 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,360px)_1fr_auto] lg:items-center">
            <label className="relative block">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索文章、栏目、标签"
                className="h-10 w-full rounded-lg border border-[var(--line)] bg-white pl-10 pr-3 text-sm font-bold outline-none transition focus:border-[var(--ocean)] focus:ring-4 focus:ring-[rgba(11,114,133,0.15)]"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className={`inline-flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-black transition ${
                    activeCategories.includes(category.name)
                      ? "bg-[var(--ocean)] text-white"
                      : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ocean-dark)] hover:bg-white"
                  }`}
                >
                  <FolderOpen size={14} />
                  {category.name} · {category.count}
                </button>
              ))}
            </div>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-sm font-black text-[var(--foreground)]"
              >
                <X size={15} />
                清空
              </button>
            ) : null}
          </div>

          {hasFilters ? (
            <div className="mt-2 text-sm font-bold text-[var(--muted)]">
              找到 {filteredPosts.length} 篇
            </div>
          ) : null}
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid gap-3">
            {filteredPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--line)] bg-white/70 p-8 text-center">
            <h2 className="text-2xl font-black text-[var(--foreground)]">
              没找到对应文章
            </h2>
            <p className="mt-3 text-sm font-bold leading-7 text-[var(--muted)]">
              换个关键词，或者清空筛选再看看。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
