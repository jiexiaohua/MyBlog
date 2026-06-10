export type FilterablePost = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  categories: string[];
};

export type PostFilterOptions = {
  query?: string;
  activeTag?: string | null;
  activeCategories?: string[];
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function filterPosts<TPost extends FilterablePost>(
  posts: TPost[],
  options: PostFilterOptions,
) {
  const query = normalizeSearch(options.query ?? "");
  const activeTag = options.activeTag?.trim();
  const activeCategories =
    options.activeCategories?.map((category) => category.trim()).filter(Boolean) ??
    [];

  return posts.filter((post) => {
    const matchesTag = activeTag ? post.tags.includes(activeTag) : true;
    const matchesCategory =
      activeCategories.length > 0
        ? post.categories.some((category) => activeCategories.includes(category))
        : true;
    const haystack = [
      post.slug,
      post.title,
      post.excerpt,
      ...post.tags,
      ...post.categories,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = query ? haystack.includes(query) : true;

    return matchesTag && matchesCategory && matchesQuery;
  });
}

function getAvailableValues(
  posts: FilterablePost[],
  selectValues: (post: FilterablePost) => string[],
) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const value of selectValues(post)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.name.localeCompare(right.name);
    });
}

export function getAvailableTags(posts: FilterablePost[]) {
  return getAvailableValues(posts, (post) => post.tags);
}

export function getAvailableCategories(posts: FilterablePost[]) {
  return getAvailableValues(posts, (post) => post.categories);
}
