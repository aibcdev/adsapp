import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const blogDir = join(root, "packages", "portal", "content", "blog");
const publicDir = join(root, "packages", "portal", "public");
const SITE = "https://aibcmedia.com";

const staticPages = [
  { loc: "/", priority: "1.0" },
  { loc: "/blog", priority: "0.9" },
  { loc: "/advertisers", priority: "0.8" },
  { loc: "/developers/how-it-works", priority: "0.8" },
  { loc: "/developers/payouts", priority: "0.7" },
  { loc: "/referral", priority: "0.7" },
  { loc: "/contact", priority: "0.5" },
  { loc: "/privacy", priority: "0.3" },
  { loc: "/terms", priority: "0.3" },
];

function loadPosts() {
  return readdirSync(blogDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = readFileSync(join(blogDir, f), "utf8");
      const { data } = matter(raw);
      if (data.draft) return null;
      return {
        slug: String(data.slug || f.replace(/\.md$/, "")),
        publishedAt: String(data.publishedAt || new Date().toISOString()),
      };
    })
    .filter(Boolean);
}

const posts = loadPosts();
const urls = [
  ...staticPages.map((p) => ({ loc: `${SITE}${p.loc}`, priority: p.priority, lastmod: new Date().toISOString().slice(0, 10) })),
  ...posts.map((p) => ({
    loc: `${SITE}/blog/${p.slug}`,
    priority: "0.8",
    lastmod: p.publishedAt.slice(0, 10),
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync(join(publicDir, "sitemap.xml"), xml);
console.log(`[sitemap] ${urls.length} URLs → public/sitemap.xml`);
