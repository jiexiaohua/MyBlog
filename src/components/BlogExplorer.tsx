"use client";

import { useMemo, useState } from "react";
import { Search, Tags, X } from "lucide-react";
import { filterPosts, getAvailableTags } from "@/lib/post-filters";
import type { Post } from "@/lib/posts";
import { PostCard } from "./PostCard";

export function BlogExplorer({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const tags = useMemo(() => getAvailableTags(posts), [posts]);
  const filteredPosts = useMemo(
    () => filterPosts(posts, { query, activeTag }),
    [activeTag, posts, query],
  );
  const hasFilters = Boolean(query.trim() || activeTag);

  function clearFilters() {
    setQuery("");
    setActiveTag(null);
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1fr_280px]">
      <div className="grid gap-5">
        <div className="rounded-lg border border-[var(--line)] bg-white/82 p-4 shadow-sm">
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、摘要、标签"
              className="h-11 w-full rounded-lg border border-[var(--line)] bg-white pl-10 pr-3 text-sm font-bold outline-none transition focus:border-[var(--ocean)] focus:ring-4 focus:ring-[rgba(11,114,133,0.15)]"
            />
          </label>

          {hasFilters ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="font-bold text-[var(--muted)]">
                找到 {filteredPosts.length} 篇
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 font-black text-[var(--foreground)]"
              >
                <X size={15} />
                清空
              </button>
            </div>
          ) : null}
        </div>

        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostCard key={post.slug} post={post} />)
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

      <aside className="h-fit rounded-lg border border-[var(--line)] bg-white/72 p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-black text-[var(--foreground)]">
          <Tags size={17} />
          标签
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.name}
              type="button"
              onClick={() =>
                setActiveTag((current) =>
                  current === tag.name ? null : tag.name,
                )
              }
              className={`rounded-md px-2 py-1 text-xs font-bold transition ${
                activeTag === tag.name
                  ? "bg-[var(--ocean)] text-white"
                  : "bg-[var(--paper)] text-[var(--ocean-dark)] hover:bg-white"
              }`}
            >
              {tag.name} · {tag.count}
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
