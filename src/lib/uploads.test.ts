import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { saveImageAsWebp } from "./uploads";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "myblog-uploads-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("uploads", () => {
  it("converts an uploaded image to webp and returns a public url", async () => {
    const png = await sharp({
      create: {
        width: 8,
        height: 8,
        channels: 3,
        background: "#e45745",
      },
    })
      .png()
      .toBuffer();

    const upload = await saveImageAsWebp(
      {
        name: "Hero Image.png",
        type: "image/png",
        size: png.byteLength,
        buffer: png,
      },
      tempDir,
    );

    expect(upload.url).toMatch(/^\/uploads\/hero-image-\d+\.webp$/);
    expect(upload.filename.endsWith(".webp")).toBe(true);
    await expect(stat(path.join(tempDir, upload.filename))).resolves.toBeTruthy();

    const saved = await readFile(path.join(tempDir, upload.filename));
    await expect(sharp(saved).metadata()).resolves.toMatchObject({
      format: "webp",
    });
  });

  it("rejects images larger than 5MB", async () => {
    await expect(
      saveImageAsWebp(
        {
          name: "too-large.png",
          type: "image/png",
          size: 5 * 1024 * 1024 + 1,
          buffer: Buffer.alloc(1),
        },
        tempDir,
      ),
    ).rejects.toThrow("Image must be 5MB or smaller");
  });
});
