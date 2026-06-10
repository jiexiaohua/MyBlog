export type FilterablePost = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
};

export type PostFilterOptions = {
  query?: string;
  activeTag?: string | null;
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

  return posts.filter((post) => {
    const matchesTag = activeTag ? post.tags.includes(activeTag) : true;
    const haystack = [
      post.slug,
      post.title,
      post.excerpt,
      ...post.tags,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = query ? haystack.includes(query) : true;

    return matchesTag && matchesQuery;
  });
}

export function getAvailableTags(posts: FilterablePost[]) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
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
