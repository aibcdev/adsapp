#!/usr/bin/env node
/**
 * Generate one blog post from topic queue using Google Gemini Flash.
 * Requires GEMINI_API_KEY. Run manually or via GitHub Actions.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const blogDir = join(root, "packages", "portal", "content", "blog");
const queuePath = join(blogDir, "topic-queue.json");
const usedPath = join(blogDir, ".topic-used.json");

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

if (!apiKey) {
  console.log("[blog] GEMINI_API_KEY not set — skipping auto-publish");
  process.exit(0);
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function existingSlugs() {
  return new Set(
    readdirSync(blogDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, "")),
  );
}

const queue = JSON.parse(readFileSync(queuePath, "utf8"));
const used = existsSync(usedPath) ? JSON.parse(readFileSync(usedPath, "utf8")) : [];
const usedTopics = new Set(used);
const slugs = existingSlugs();

const next = queue.find((t) => !usedTopics.has(t.topic));
if (!next) {
  console.log("No unused topics in queue");
  process.exit(0);
}

const slug = slugify(next.topic);
if (slugs.has(slug)) {
  used.push(next.topic);
  writeFileSync(usedPath, JSON.stringify(used, null, 2));
  console.log(`Slug collision, marked used: ${next.topic}`);
  process.exit(0);
}

const prompt = `Write a blog post for AIBC Media (developer spinner monetization — install free, keep 70%, Claude Code / Cursor / VS Code).

Topic: ${next.topic}

Style: Guillermo Flor LinkedIn / Substack founder voice. First person where natural. Bold hook. Short paragraphs. One numbered list. Honest, not hype. 700-1000 words.

SEO keywords to weave naturally: ${next.keywords.join(", ")}

End with soft CTA linking to /#install or /developers/how-it-works using markdown links.

Return ONLY valid markdown with YAML frontmatter:
---
title: "..."
slug: "${slug}"
description: "150 chars max meta description with primary keyword"
publishedAt: "${new Date().toISOString()}"
author: "AIBC"
tags: [${next.tags.map((t) => `"${t}"`).join(", ")}]
keywords: [${next.keywords.map((k) => `"${k}"`).join(", ")}]
draft: false
---

(body markdown)`;

const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 4096,
    },
  }),
});

if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}

const data = await res.json();
const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
if (!text.includes("---")) {
  console.error("Invalid response format:", text.slice(0, 200));
  process.exit(1);
}

writeFileSync(join(blogDir, `${slug}.md`), text.trim() + "\n");
used.push(next.topic);
writeFileSync(usedPath, JSON.stringify(used, null, 2));
console.log(`Published: ${slug}.md — ${next.topic} (via ${model})`);
