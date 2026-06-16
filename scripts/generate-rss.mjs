import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const blogDir = join(root, "packages", "portal", "content", "blog");
const publicDir = join(root, "packages", "portal", "public");
const SITE = "https://aibcmedia.com";

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const items = readdirSync(blogDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const raw = readFileSync(join(blogDir, f), "utf8");
    const { data, content } = matter(raw);
    if (data.draft) return null;
    const slug = String(data.slug || f.replace(/\.md$/, ""));
    return {
      title: String(data.title),
      description: String(data.description || ""),
      link: `${SITE}/blog/${slug}`,
      pubDate: new Date(data.publishedAt || Date.now()).toUTCString(),
      content: content.trim().slice(0, 500),
    };
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
  .slice(0, 50);

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AIBC Blog</title>
    <link>${SITE}/blog</link>
    <description>Founder notes on AI coding, developer income, and monetizing your IDE.</description>
    <language>en-us</language>
    <image>
      <url>${SITE}/icon-512.png</url>
      <title>AIBC Media</title>
      <link>${SITE}/</link>
    </image>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;

writeFileSync(join(publicDir, "rss.xml"), rss);
console.log(`[rss] ${items.length} items → public/rss.xml`);
