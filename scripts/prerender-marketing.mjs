/**
 * Write full HTML for the AEO pages into dist/<path>/index.html.
 * The Vite app is a client-rendered SPA. AI crawlers need the article in the
 * first response, so this renders the same React pages with renderToString
 * and drops that markup into the built index.html shell.
 */
import { mkdtempSync, readFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const portalDir = join(root, "packages", "portal");
const distDir = join(portalDir, "dist");
const SITE = "https://aibcmedia.com";

function escapeAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function replaceMeta(html, attr, key, content) {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`);
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function applyHead(template, { title, description, path }) {
  const url = `${SITE}${path}`;
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`);
  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "property", "og:url", url);
  html = replaceMeta(html, "name", "twitter:title", title);
  html = replaceMeta(html, "name", "twitter:description", description);
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${url}" />`,
  );
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/, "");
  return html;
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const REQUIRED = {
  "/about": ["About AIBC Media", "AboutPage", "Organization", "AIBCMedia/aibc", "$0.25"],
  "/faq": ["FAQPage", "What is a spinner ad?", "How much does it cost to advertise?", "Does AIBC read code"],
  "/guides": ["How to advertise to developers", "/guides/migrate-from-kickbacks", "LAUNCH50"],
  "/developers": ["/developers/how-it-works", "/developers/payouts", "Open VSX", "10–20%"],
  "/vs": ["/vs/kickbacks", "Kickbacks", "$0.25", "Open VSX"],
};

const ssrOut = mkdtempSync(join(tmpdir(), "aibc-ssr-"));

const vitePath = createRequire(join(portalDir, "package.json")).resolve("vite");
const { build } = await import(pathToFileURL(vitePath).href);

try {
  await build({
    root: portalDir,
    configFile: join(portalDir, "vite.config.ts"),
    logLevel: "warn",
    build: {
      ssr: join(portalDir, "src/entry-server.tsx"),
      outDir: ssrOut,
      emptyOutDir: true,
      copyPublicDir: false,
    },
    ssr: { noExternal: true },
  });

  const entry = pathToFileURL(join(ssrOut, "entry-server.js")).href;
  const { render, PRERENDER_PATHS } = await import(entry);
  const template = readFileSync(join(distDir, "index.html"), "utf8");

  for (const path of PRERENDER_PATHS) {
    const rendered = render(path);
    const page = applyHead(template, rendered).replace(
      '<div id="root"></div>',
      () => `<div id="root">${rendered.html}</div>`,
    );
    const text = visibleText(page);
    const words = text.split(" ").filter(Boolean).length;
    const missing = (REQUIRED[path] || []).filter((needle) => !page.includes(needle));
    if (missing.length || words < 400) {
      throw new Error(
        `${path} prerender failed (${words} words). Missing: ${missing.join(", ") || "none"}`,
      );
    }
    const outDir = join(distDir, path.slice(1));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), page);
    console.log(`[prerender] ${path} → ${words} words`);
  }
} finally {
  rmSync(ssrOut, { recursive: true, force: true });
}
