import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  getAdminPassword,
  getCookieMaxAgeSeconds,
  getSessionSecret,
  isAllowedOrigin,
  verifyPassword,
} from "@/lib/admin-auth";

const loginSchema = z.object({
  password: z.string().min(1),
});

function cookieIsSecure(request: NextRequest) {
  return request.headers.get("x-forwarded-proto") === "https";
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminPassword = getAdminPassword();
  const sessionSecret = getSessionSecret();

  if (!adminPassword || !sessionSecret) {
    return NextResponse.json(
      { error: "Admin credentials are not configured" },
      { status: 503 },
    );
  }

  const payload = loginSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success || !verifyPassword(payload.data.password, adminPassword)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    createSessionToken(sessionSecret),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieIsSecure(request),
      path: "/",
      maxAge: getCookieMaxAgeSeconds(),
    },
  );

  return response;
}
