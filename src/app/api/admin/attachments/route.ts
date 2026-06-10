import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionSecret,
  isAllowedOrigin,
  verifySessionToken,
} from "@/lib/admin-auth";
import { saveAttachment } from "@/lib/attachments";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const sessionSecret = getSessionSecret();
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  return verifySessionToken(sessionToken, sessionSecret);
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.formData();
  const file = data.get("attachment");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attachment is required" }, { status: 400 });
  }

  try {
    const attachment = await saveAttachment({
      name: file.name,
      type: file.type,
      size: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
