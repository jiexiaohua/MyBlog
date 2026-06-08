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

const postInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  excerpt: z.string().trim().min(1).max(240),
  body: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1).max(32)).max(8).default([]),
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
  featured: z.boolean().default(false),
});

export type PostInput = z.input<typeof postInputSchema>;

export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
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

export function buildPostMarkdown(input: PostInput) {
  const parsed = postInputSchema.parse(input);
  const date = parsed.date ?? new Date().toISOString().slice(0, 10);
  const tags =
    parsed.tags.length > 0
      ? `\n${parsed.tags
          .map((tag) => `  - "${escapeYamlString(tag)}"`)
          .join("\n")}`
      : " []";

  return `---\ntitle: "${escapeYamlString(parsed.title)}"\ndate: "${date}"\nexcerpt: "${escapeYamlString(parsed.excerpt)}"\ntags:${tags}\nfeatured: ${parsed.featured}\n---\n\n${parsed.body}\n`;
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
) {
  if (!isValidSlug(slug)) {
    throw new Error("Invalid slug");
  }

  const filePath = path.join(directory, `${slug}.md`);
  if (!(await fileExists(filePath))) {
    throw new Error("Post not found");
  }

  const parsed = postInputSchema.parse(input);
  const date = parsed.date ?? new Date().toISOString().slice(0, 10);
  const markdown = buildPostMarkdown({ ...parsed, date });

  await writeFile(filePath, markdown, "utf8");

  return parsePost(slug, markdown);
}

export async function deletePost(
  slug: string,
  directory = resolvePostsDirectory(),
) {
  if (!isValidSlug(slug)) {
    return false;
  }

  const filePath = path.join(directory, `${slug}.md`);

  if (!(await fileExists(filePath))) {
    return false;
  }

  await rm(filePath);
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
