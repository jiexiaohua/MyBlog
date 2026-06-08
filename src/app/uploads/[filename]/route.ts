import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { resolveUploadsDirectory } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;

  if (!/^[a-z0-9-]+\.webp$/.test(filename)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const image = await readFile(path.join(resolveUploadsDirectory(), filename));
    return new NextResponse(image, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
