import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const blogDir = join(root, "packages", "portal", "content", "blog");
const distDir = join(root, "packages", "portal", "dist", "blog");
const SITE = "https://aibcmedia.com";
const OG_IMAGE = `${SITE}/og-image.png`;

const SEO_HEAD = `
  <link rel="icon" href="/favicon.ico" sizes="any"/>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
  <meta property="og:site_name" content="AIBC Media"/>
  <meta property="og:image" content="${OG_IMAGE}"/>
  <meta property="og:image:alt" content="AIBC Media — Make money whilst you code"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:image" content="${OG_IMAGE}"/>`;

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const posts = readdirSync(blogDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const raw = readFileSync(join(blogDir, f), "utf8");
    const { data, content } = matter(raw);
    if (data.draft) return null;
    return {
      slug: String(data.slug || f.replace(/\.md$/, "")),
      title: String(data.title),
      description: String(data.description || ""),
      publishedAt: String(data.publishedAt || ""),
      author: String(data.author || "AIBC"),
      keywords: Array.isArray(data.keywords) ? data.keywords.join(", ") : "",
      html: marked.parse(content),
    };
  })
  .filter(Boolean);

for (const post of posts) {
  const url = `${SITE}/blog/${post.slug}`;
  const outDir = join(distDir, post.slug);
  mkdirSync(outDir, { recursive: true });

  const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(post.title)} | AIBC Blog</title>
  <meta name="description" content="${escapeHtml(post.description)}"/>
  <link rel="canonical" href="${url}"/>
  <meta property="og:title" content="${escapeHtml(post.title)}"/>
  <meta property="og:description" content="${escapeHtml(post.description)}"/>
  <meta property="og:url" content="${url}"/>
  <meta property="og:type" content="article"/>
  <meta name="twitter:title" content="${escapeHtml(post.title)}"/>
  <meta name="twitter:description" content="${escapeHtml(post.description)}"/>
  ${SEO_HEAD}
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.author },
    keywords: post.keywords,
    mainEntityOfPage: url,
    publisher: { "@type": "Organization", name: "AIBC Media", url: SITE, logo: `${SITE}/icon-512.png` },
    image: OG_IMAGE,
  })}</script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;600&display=swap"/>
  <style>
    body{font-family:Inter,system-ui,sans-serif;max-width:42rem;margin:0 auto;padding:2rem 1.5rem;line-height:1.7;color:#27272a}
    h1{font-family:"Instrument Serif",serif;font-size:2.25rem;line-height:1.2;color:#09090b}
    .desc{font-size:1.125rem;color:#52525b;margin-top:1rem}
    article{margin-top:2rem;font-size:1.125rem}
    article a{color:#047857;font-weight:500}
    .cta{margin-top:2.5rem;padding:1.25rem;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:1rem}
    .meta{font-size:.75rem;color:#71717a;margin-top:.5rem}
  </style>
</head>
<body>
  <a href="/blog" style="font-size:.75rem;color:#71717a;text-transform:uppercase;letter-spacing:.1em">← All posts</a>
  <p class="meta">${escapeHtml(post.author)} · ${post.publishedAt.slice(0, 10)}</p>
  <h1>${escapeHtml(post.title)}</h1>
  <p class="desc">${escapeHtml(post.description)}</p>
  <article>${post.html}</article>
  <div class="cta">
    <strong>Install free. Keep 60%.</strong>
    <p style="margin:.5rem 0 0;font-size:.875rem">One sponsored line in your AI spinner. <a href="/#install">Install now</a> · <a href="/developers/how-it-works">How it works</a></p>
  </div>
</body>
</html>`;

  writeFileSync(join(outDir, "index.html"), page);
}

const sorted = [...posts].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);
mkdirSync(join(distDir), { recursive: true });
const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>AIBC Blog — Make Money Whilst You Code</title>
  <meta name="description" content="Founder notes on AI coding, developer income, and monetizing your IDE. Claude, Cursor, VS Code."/>
  <link rel="canonical" href="${SITE}/blog"/>
  <link rel="alternate" type="application/rss+xml" title="AIBC Blog" href="/rss.xml"/>
  <meta property="og:title" content="AIBC Blog — Make Money Whilst You Code"/>
  <meta property="og:description" content="Founder notes on AI coding, developer income, and monetizing your IDE. Claude, Cursor, VS Code."/>
  <meta property="og:url" content="${SITE}/blog"/>
  <meta property="og:type" content="website"/>
  ${SEO_HEAD}
</head>
<body style="font-family:Inter,system-ui,sans-serif;max-width:42rem;margin:0 auto;padding:2rem 1.5rem;color:#27272a">
  <h1 style="font-family:'Instrument Serif',serif;font-size:2.5rem">AIBC Blog</h1>
  <p>Notes from the edge of AI coding — developer income, spinner monetization, honest founder takes.</p>
  <ul style="list-style:none;padding:0;margin-top:2rem">
${sorted
  .map(
    (p) => `    <li style="margin-bottom:1.5rem"><a href="/blog/${p.slug}" style="color:#047857;font-size:1.25rem;font-weight:600">${escapeHtml(p.title)}</a><br/><span style="font-size:.875rem;color:#71717a">${p.publishedAt.slice(0, 10)}</span></li>`,
  )
  .join("\n")}
  </ul>
</body>
</html>`;
writeFileSync(join(distDir, "index.html"), indexHtml);

console.log(`[blog-static] ${posts.length} posts + index → dist/blog/`);
