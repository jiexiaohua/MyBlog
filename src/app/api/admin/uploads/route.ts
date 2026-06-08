import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionSecret,
  isAllowedOrigin,
  verifySessionToken,
} from "@/lib/admin-auth";
import { saveImageAsWebp } from "@/lib/uploads";

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
  const file = data.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 });
  }

  try {
    const upload = await saveImageAsWebp({
      name: file.name,
      type: file.type,
      size: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
    });

    return NextResponse.json(
      {
        url: upload.url,
        filename: upload.filename,
        markdown: `![${file.name.replace(/\.[^.]+$/, "")}](${upload.url})`,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
