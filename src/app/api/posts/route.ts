import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionSecret,
  isAllowedOrigin,
  verifySessionToken,
} from "@/lib/admin-auth";
import { writePost } from "@/lib/posts";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sessionSecret = getSessionSecret();
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifySessionToken(sessionToken, sessionSecret)) {
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
          featured: post.featured,
        },
        url: `/blog/${post.slug}`,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  }
}
