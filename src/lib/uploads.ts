import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export type ImageUploadInput = {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
};

export function resolveUploadsDirectory() {
  return (
    process.env.BLOG_UPLOADS_DIR ??
    path.join(process.cwd(), "public", "uploads")
  );
}

function slugifyFilename(name: string) {
  const basename = path.parse(name).name;
  const slug = basename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "image";
}

export async function saveImageAsWebp(
  input: ImageUploadInput,
  directory = resolveUploadsDirectory(),
) {
  if (input.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller");
  }

  if (!allowedImageTypes.has(input.type)) {
    throw new Error("Unsupported image type");
  }

  await mkdir(directory, { recursive: true });

  const filename = `${slugifyFilename(input.name)}-${Date.now()}.webp`;
  const outputPath = path.join(directory, filename);
  const webp = await sharp(input.buffer, { animated: false })
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  await writeFile(outputPath, webp);

  return {
    filename,
    path: outputPath,
    url: `/uploads/${filename}`,
  };
}
