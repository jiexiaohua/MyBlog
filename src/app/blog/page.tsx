import type { Metadata } from "next";
import { connection } from "next/server";
import { BookOpen, Compass } from "lucide-react";
import { BlogExplorer } from "@/components/BlogExplorer";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "博客",
  description: "小花的文章列表。",
};

export default async function BlogPage() {
  await connection();
  const posts = await getAllPosts();
  const featuredPost = posts.find((post) => post.featured) ?? posts[0];
  const tags = [...new Set(posts.flatMap((post) => post.tags))];

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteHeader />

      <section className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-black text-[var(--ocean-dark)]">
              <Compass size={16} />
              Blog
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-[var(--foreground)] sm:text-5xl">
              技术、生活、灵感，都先写下来。
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              文章会按时间排序，新的日志会在后台发布后直接出现在这里。
            </p>
          </div>

          <aside className="rounded-lg border border-[var(--line)] bg-white p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-[var(--foreground)]">
              <BookOpen size={17} />
              当前收录
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-3xl font-black text-[var(--coral)]">
                  {posts.length}
                </div>
                <div className="text-sm font-semibold text-[var(--muted)]">
                  篇文章
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-[var(--ocean)]">
                  {tags.length}
                </div>
                <div className="text-sm font-semibold text-[var(--muted)]">
                  个标签
                </div>
              </div>
            </div>
            {featuredPost ? (
              <p className="mt-5 border-t border-[var(--line)] pt-4 text-sm leading-7 text-[var(--muted)]">
                最新精选：{featuredPost.title}
              </p>
            ) : null}
          </aside>
        </div>
      </section>

      <BlogExplorer posts={posts} />
    </main>
  );
}
