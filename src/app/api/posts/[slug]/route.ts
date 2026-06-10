import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionSecret,
  isAllowedOrigin,
  verifySessionToken,
} from "@/lib/admin-auth";
import { deletePost, getPostBySlug, updatePost } from "@/lib/posts";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const sessionSecret = getSessionSecret();
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  return verifySessionToken(sessionToken, sessionSecret);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;

  try {
    const post = await updatePost(slug, await request.json());
    return NextResponse.json({
      post: {
        slug: post.slug,
        title: post.title,
        date: post.date,
        excerpt: post.excerpt,
        tags: post.tags,
        categories: post.categories,
        attachments: post.attachments,
        featured: post.featured,
        content: post.content,
      },
      url: `/blog/${post.slug}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid post";
    return NextResponse.json(
      { error: message === "Post not found" ? "Not found" : "Invalid post" },
      { status: message === "Post not found" ? 404 : 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const deleted = await deletePost(slug);

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
