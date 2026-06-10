import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;

export type Attachment = {
  name: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
};

export type AttachmentUploadInput = {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
};

export function resolveAttachmentsDirectory() {
  return (
    process.env.BLOG_ATTACHMENTS_DIR ??
    path.join(process.cwd(), "content", "attachments")
  );
}

function slugifyFilenameBase(name: string) {
  const basename = path.parse(name).name;
  const slug = basename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "attachment";
}

function safeExtension(name: string) {
  const extension = path.extname(name).toLowerCase().replace(/^\./, "");

  if (!/^[a-z0-9]{1,16}$/.test(extension)) {
    return "";
  }

  return `.${extension}`;
}

export function isSafeAttachmentFilename(filename: string) {
  return /^[a-z0-9][a-z0-9._-]{0,180}$/.test(filename);
}

function normalizeDisplayName(name: string) {
  const trimmed = name.trim();
  return (trimmed || "attachment").slice(0, 180);
}

export async function saveAttachment(
  input: AttachmentUploadInput,
  directory = resolveAttachmentsDirectory(),
  uploadedAt = new Date(),
): Promise<Attachment> {
  if (input.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new Error("Attachment must be 20MB or smaller");
  }

  await mkdir(directory, { recursive: true });

  const filename = `${slugifyFilenameBase(input.name)}-${Date.now()}${safeExtension(input.name)}`;
  const outputPath = path.join(directory, filename);

  await writeFile(outputPath, input.buffer);

  return {
    name: normalizeDisplayName(input.name),
    filename,
    url: `/attachments/${filename}`,
    size: input.size,
    type: input.type || "application/octet-stream",
    uploadedAt: uploadedAt.toISOString(),
  };
}

export async function readAttachmentFile(
  filename: string,
  directory = resolveAttachmentsDirectory(),
) {
  if (!isSafeAttachmentFilename(filename)) {
    return null;
  }

  try {
    return await readFile(path.join(directory, filename));
  } catch {
    return null;
  }
}

export async function removeAttachmentFiles(
  attachments: Attachment[],
  directory = resolveAttachmentsDirectory(),
) {
  await Promise.all(
    attachments.map(async (attachment) => {
      if (!isSafeAttachmentFilename(attachment.filename)) {
        return;
      }

      await rm(path.join(directory, attachment.filename), { force: true });
    }),
  );
}
