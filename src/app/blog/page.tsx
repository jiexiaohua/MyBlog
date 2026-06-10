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

      <BlogExplorer posts={posts} />
    </main>
  );
}
