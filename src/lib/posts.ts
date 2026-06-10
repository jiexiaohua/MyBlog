import {
  access,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  removeAttachmentFiles,
  resolveAttachmentsDirectory,
  type Attachment,
} from "./attachments";

export const DEFAULT_CATEGORY = "随笔";

const listItemSchema = z.string().trim().min(1).max(32);

const categoriesSchema = z
  .array(listItemSchema)
  .max(8)
  .default([DEFAULT_CATEGORY])
  .transform((categories) =>
    categories.length > 0 ? categories : [DEFAULT_CATEGORY],
  );

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(180),
  filename: z.string().trim().regex(/^[a-z0-9][a-z0-9._-]{0,180}$/),
  url: z.string().trim().regex(/^\/attachments\/[a-z0-9][a-z0-9._-]{0,180}$/),
  size: z.number().int().nonnegative(),
  type: z.string().trim().min(1).max(120),
  uploadedAt: z.union([z.string(), z.date()]).transform((value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value.trim();
  }),
});

const attachmentsSchema = z.array(attachmentSchema).default([]);

const postInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  excerpt: z.string().trim().min(1).max(240),
  body: z.string().trim().min(1),
  tags: z.array(listItemSchema).max(8).default([]),
  categories: categoriesSchema,
  attachments: attachmentsSchema,
  featured: z.boolean().default(false),
  date: z.string().trim().min(10).max(32).optional(),
});

const frontMatterSchema = z.object({
  title: z.string().trim().min(1),
  date: z.union([z.string(), z.date()]).transform((value) => {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return value.slice(0, 10);
  }),
  excerpt: z.string().trim().optional(),
  tags: z.array(z.string()).default([]),
  categories: categoriesSchema,
  attachments: attachmentsSchema,
  featured: z.boolean().default(false),
});

export type PostInput = z.input<typeof postInputSchema>;

export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  categories: string[];
  attachments: Attachment[];
  featured: boolean;
  readingTime: string;
  content: string;
};

export function resolvePostsDirectory() {
  return (
    process.env.BLOG_CONTENT_DIR ??
    path.join(process.cwd(), "content", "posts")
  );
}

export function createSlug(title: string, date = new Date()) {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (slug) {
    return slug;
  }

  return `post-${date.toISOString().slice(0, 10)}`;
}

function estimateReadingTime(content: string) {
  const latinWords = content.match(/[A-Za-z0-9]+/g)?.length ?? 0;
  const cjkChars = content.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil((latinWords + cjkChars / 2) / 220));

  return `${minutes} min read`;
}

function deriveExcerpt(content: string) {
  const paragraph =
    content
      .split(/\n{2,}/)
      .map((item) => item.replace(/^#+\s*/, "").trim())
      .find(Boolean) ?? "";

  return paragraph.slice(0, 160);
}

function escapeYamlString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatYamlList(values: string[]) {
  return values.length > 0
    ? `\n${values
        .map((value) => `  - "${escapeYamlString(value)}"`)
        .join("\n")}`
    : " []";
}

function formatYamlAttachments(attachments: Attachment[]) {
  if (attachments.length === 0) {
    return " []";
  }

  return `\n${attachments
    .map(
      (attachment) =>
        `  - name: "${escapeYamlString(attachment.name)}"\n    filename: "${escapeYamlString(attachment.filename)}"\n    url: "${escapeYamlString(attachment.url)}"\n    size: ${attachment.size}\n    type: "${escapeYamlString(attachment.type)}"\n    uploadedAt: "${escapeYamlString(attachment.uploadedAt)}"`,
    )
    .join("\n")}`;
}

export function buildPostMarkdown(input: PostInput) {
  const parsed = postInputSchema.parse(input);
  const date = parsed.date ?? new Date().toISOString().slice(0, 10);
  const categories = formatYamlList(parsed.categories);
  const tags = formatYamlList(parsed.tags);
  const attachments = formatYamlAttachments(parsed.attachments);

  return `---\ntitle: "${escapeYamlString(parsed.title)}"\ndate: "${date}"\nexcerpt: "${escapeYamlString(parsed.excerpt)}"\ncategories:${categories}\ntags:${tags}\nattachments:${attachments}\nfeatured: ${parsed.featured}\n---\n\n${parsed.body}\n`;
}

export function parsePost(slug: string, fileContents: string): Post {
  const parsed = matter(fileContents);
  const frontMatter = frontMatterSchema.parse(parsed.data);
  const content = parsed.content.trim();

  return {
    slug,
    title: frontMatter.title,
    date: frontMatter.date,
    excerpt: frontMatter.excerpt || deriveExcerpt(content),
    tags: frontMatter.tags,
    categories: frontMatter.categories,
    attachments: frontMatter.attachments,
    featured: frontMatter.featured,
    readingTime: estimateReadingTime(content),
    content,
  };
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isValidSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

async function uniqueSlug(directory: string, baseSlug: string) {
  let slug = baseSlug;
  let index = 2;

  while (await fileExists(path.join(directory, `${slug}.md`))) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
}

export async function writePost(input: PostInput, directory = resolvePostsDirectory()) {
  const parsed = postInputSchema.parse(input);
  const date = parsed.date ?? new Date().toISOString().slice(0, 10);

  await mkdir(directory, { recursive: true });

  const slug = await uniqueSlug(directory, createSlug(parsed.title, new Date(date)));
  const markdown = buildPostMarkdown({ ...parsed, date });
  const filePath = path.join(directory, `${slug}.md`);

  await writeFile(filePath, markdown, "utf8");

  return parsePost(slug, markdown);
}

export async function updatePost(
  slug: string,
  input: PostInput,
  directory = resolvePostsDirectory(),
  attachmentsDirectory = resolveAttachmentsDirectory(),
) {
  if (!isValidSlug(slug)) {
    throw new Error("Invalid slug");
  }

  const filePath = path.join(directory, `${slug}.md`);
  if (!(await fileExists(filePath))) {
    throw new Error("Post not found");
  }

  const existing = parsePost(slug, await readFile(filePath, "utf8"));
  const parsed = postInputSchema.parse(input);
  const date = parsed.date ?? new Date().toISOString().slice(0, 10);
  const markdown = buildPostMarkdown({ ...parsed, date });

  await writeFile(filePath, markdown, "utf8");
  await removeAttachmentFiles(
    existing.attachments.filter(
      (attachment) =>
        !parsed.attachments.some((current) => current.filename === attachment.filename),
    ),
    attachmentsDirectory,
  );

  return parsePost(slug, markdown);
}

export async function deletePost(
  slug: string,
  directory = resolvePostsDirectory(),
  attachmentsDirectory = resolveAttachmentsDirectory(),
) {
  if (!isValidSlug(slug)) {
    return false;
  }

  const filePath = path.join(directory, `${slug}.md`);

  if (!(await fileExists(filePath))) {
    return false;
  }

  const post = parsePost(slug, await readFile(filePath, "utf8"));
  await rm(filePath);
  await removeAttachmentFiles(post.attachments, attachmentsDirectory);
  return true;
}

export async function getAllPosts(directory = resolvePostsDirectory()) {
  await mkdir(directory, { recursive: true });

  const filenames = await readdir(directory);
  const posts = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith(".md"))
      .map(async (filename) => {
        const slug = filename.replace(/\.md$/, "");
        const fileContents = await readFile(path.join(directory, filename), "utf8");
        return parsePost(slug, fileContents);
      }),
  );

  return posts.sort((left, right) => right.date.localeCompare(left.date));
}

export async function getPostBySlug(
  slug: string,
  directory = resolvePostsDirectory(),
) {
  if (!isValidSlug(slug)) {
    return null;
  }

  try {
    const fileContents = await readFile(path.join(directory, `${slug}.md`), "utf8");
    return parsePost(slug, fileContents);
  } catch {
    return null;
  }
}
