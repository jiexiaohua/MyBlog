import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MAX_ATTACHMENT_SIZE_BYTES, saveAttachment } from "./attachments";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "myblog-attachments-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("attachments", () => {
  it("saves any uploaded file type and returns public download metadata", async () => {
    const buffer = Buffer.from("hello attachment");

    const attachment = await saveAttachment(
      {
        name: "季度 报告.Final.PDF",
        type: "application/pdf",
        size: buffer.byteLength,
        buffer,
      },
      tempDir,
      new Date("2026-06-10T10:00:00.000Z"),
    );

    expect(attachment).toMatchObject({
      name: "季度 报告.Final.PDF",
      size: buffer.byteLength,
      type: "application/pdf",
      uploadedAt: "2026-06-10T10:00:00.000Z",
    });
    expect(attachment.filename).toMatch(/^final-\d+\.pdf$/);
    expect(attachment.url).toBe(`/attachments/${attachment.filename}`);
    await expect(stat(path.join(tempDir, attachment.filename))).resolves.toBeTruthy();
    await expect(readFile(path.join(tempDir, attachment.filename), "utf8")).resolves
      .toBe("hello attachment");
  });

  it("rejects attachments larger than 20MB", async () => {
    await expect(
      saveAttachment(
        {
          name: "too-large.zip",
          type: "application/zip",
          size: MAX_ATTACHMENT_SIZE_BYTES + 1,
          buffer: Buffer.alloc(1),
        },
        tempDir,
      ),
    ).rejects.toThrow("Attachment must be 20MB or smaller");
  });
});
