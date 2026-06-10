import type { Attachment } from "./attachments";

export type AdminPostForm = {
  title: string;
  excerpt: string;
  categories: string;
  tags: string;
  attachments: Attachment[];
  featured: boolean;
  body: string;
};

function normalizeTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(", ");
}

export function normalizePostForm(form: AdminPostForm): AdminPostForm {
  return {
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    categories: normalizeTags(form.categories),
    tags: normalizeTags(form.tags),
    attachments: form.attachments,
    featured: form.featured,
    body: form.body.trim(),
  };
}

export function formsAreEqual(left: AdminPostForm, right: AdminPostForm) {
  return (
    JSON.stringify(normalizePostForm(left)) ===
    JSON.stringify(normalizePostForm(right))
  );
}
