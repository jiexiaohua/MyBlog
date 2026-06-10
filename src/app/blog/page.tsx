import type { Metadata } from "next";
import { connection } from "next/server";
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

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteHeader />

      <section className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto w-full max-w-6xl px-5 py-8">
          <h1 className="text-3xl font-black leading-tight text-[var(--foreground)] sm:text-4xl">
            文章
          </h1>
        </div>
      </section>

      <BlogExplorer posts={posts} />
    </main>
  );
}
