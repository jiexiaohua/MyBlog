import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionSecret,
  isAllowedOrigin,
  verifySessionToken,
} from "@/lib/admin-auth";
import { getAllPosts, writePost } from "@/lib/posts";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const sessionSecret = getSessionSecret();
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  return verifySessionToken(sessionToken, sessionSecret);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await getAllPosts();
  return NextResponse.json({
    posts: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      tags: post.tags,
      categories: post.categories,
      featured: post.featured,
      content: post.content,
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const post = await writePost(await request.json());
    return NextResponse.json(
      {
        post: {
          slug: post.slug,
          title: post.title,
          date: post.date,
          excerpt: post.excerpt,
          tags: post.tags,
          categories: post.categories,
          featured: post.featured,
          content: post.content,
        },
        url: `/blog/${post.slug}`,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  }
}
