import Link from "next/link";
import { CalendarDays, FolderOpen } from "lucide-react";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block rounded-lg border border-[var(--line)] bg-white/78 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[rgba(11,114,133,0.15)]"
    >
      <article>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-normal text-[var(--muted)]">
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

        <h2 className="text-xl font-black leading-tight text-[var(--foreground)]">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-1 text-sm leading-6 text-[var(--muted)]">
          {post.excerpt}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.categories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-1 rounded-md bg-[var(--paper)] px-2 py-1 text-[11px] font-black text-[var(--ocean-dark)]"
            >
              <FolderOpen size={12} />
              {category}
            </span>
          ))}
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-[var(--line)] px-2 py-1 text-[11px] font-bold text-[var(--muted)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  );
}
