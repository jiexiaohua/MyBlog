export type AdminPostForm = {
  title: string;
  excerpt: string;
  tags: string;
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
    tags: normalizeTags(form.tags),
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
