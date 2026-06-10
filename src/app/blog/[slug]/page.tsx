import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { SiteHeader } from "@/components/SiteHeader";
import { getPostBySlug } from "@/lib/posts";

type BlogPostParams = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostParams): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章不存在",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: ["/luffy.png"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: BlogPostParams) {
  await connection();
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-5 py-10">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-black text-[var(--ocean-dark)] transition hover:bg-[var(--paper)]"
        >
          <ArrowLeft size={16} />
          返回博客
        </Link>

        <header className="mb-8 border-b border-[var(--line)] pb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm font-bold text-[var(--muted)]">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={15} />
              {post.date}
            </span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className="text-4xl font-black leading-tight text-[var(--foreground)] sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            {post.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[var(--line)] bg-white px-2 py-1 text-xs font-bold text-[var(--ocean-dark)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <MarkdownArticle content={post.content} />
      </article>
    </main>
  );
}
