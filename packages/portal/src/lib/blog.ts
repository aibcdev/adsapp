import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  tags: string[];
  keywords: string[];
  draft: boolean;
  body: string;
  readMinutes: number;
};

const modules = import.meta.glob("../../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parsePost(slug: string, raw: string): BlogPost {
  const { data, content } = matter(raw);
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return {
    slug: String(data.slug || slug),
    title: String(data.title || slug),
    description: String(data.description || ""),
    publishedAt: String(data.publishedAt || new Date().toISOString()),
    author: String(data.author || "AIBC"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    draft: Boolean(data.draft),
    body: content.trim(),
    readMinutes: Math.max(1, Math.ceil(words / 200)),
  };
}

function allRawPosts(): BlogPost[] {
  return Object.entries(modules).map(([path, raw]) => {
    const slug = path.split("/").pop()?.replace(/\.md$/, "") || "post";
    return parsePost(slug, raw);
  });
}

export function getPublishedPosts(): BlogPost[] {
  return allRawPosts()
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getPublishedPosts().find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 2): BlogPost[] {
  const current = getPostBySlug(slug);
  if (!current) return getPublishedPosts().slice(0, limit);
  const tagSet = new Set(current.tags);
  return getPublishedPosts()
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const aScore = a.tags.filter((t) => tagSet.has(t)).length;
      const bScore = b.tags.filter((t) => tagSet.has(t)).length;
      return bScore - aScore;
    })
    .slice(0, limit);
}

export const SITE_URL = "https://aibcmedia.com";
