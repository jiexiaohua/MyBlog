import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white/78 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-normal text-[var(--muted)]">
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={14} />
          {post.date}
        </span>
        <span>{post.readingTime}</span>
        {post.featured ? (
          <span className="rounded-md bg-[var(--gold)] px-2 py-1 text-[var(--foreground)]">
            精选
          </span>
        ) : null}
      </div>

      <h2 className="text-2xl font-black leading-tight text-[var(--foreground)]">
        <Link href={`/blog/${post.slug}`} className="hover:text-[var(--ocean)]">
          {post.title}
        </Link>
      </h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)]">
        {post.excerpt}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-[var(--line)] px-2 py-1 text-xs font-bold text-[var(--ocean-dark)]"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-sm font-black text-[var(--coral)]"
        >
          阅读
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
