#!/usr/bin/env node
/**
 * Sync open Kickbacks.ai GitHub issues into packages/portal/public/kickbacks-tracker.json
 * Run: npm run sync:kickbacks
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { aibcStatusForIssue, STATUS_LABELS } from "./kickbacks-aibc-status.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "packages/portal/public/kickbacks-tracker.json");
const REPO = "andrewmccalip/kickbacks.ai";

async function fetchAllOpenIssues() {
  const issues = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.github.com/repos/${REPO}/issues?state=open&per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "aibc-competitive-sync" },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    const filtered = batch.filter((i) => !i.pull_request);
    issues.push(...filtered);
    if (batch.length < 100) break;
  }
  return issues;
}

function summarize(rows) {
  const counts = {};
  for (const r of rows) {
    counts[r.aibcStatus] = (counts[r.aibcStatus] || 0) + 1;
  }
  return counts;
}

async function main() {
  console.log("[kickbacks-sync] Fetching open issues from", REPO);
  const issues = await fetchAllOpenIssues();
  issues.sort((a, b) => b.number - a.number);

  const rows = issues.map((issue) => {
    const mapped = aibcStatusForIssue(issue);
    return {
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      state: issue.state,
      labels: (issue.labels || []).map((l) => (typeof l === "string" ? l : l.name)),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      comments: issue.comments,
      aibcStatus: mapped.status,
      aibcStatusLabel: STATUS_LABELS[mapped.status] || mapped.status,
      aibcNote: mapped.note,
      aibcFix: mapped.fix || null,
    };
  });

  const payload = {
    syncedAt: new Date().toISOString(),
    source: `https://github.com/${REPO}/issues`,
    openCount: rows.length,
    summary: summarize(rows),
    aibcAdvantages: [
      "70% developer share vs ~50%",
      "Cursor + Windsurf + Open VSX + VS Code",
      "Stripe Connect + PayPal + Wise + UPI payouts",
      "No Claude/Codex file patching — cleaner uninstall",
      "No region block after Google OAuth",
      "Sample ads excluded from public leaderboard",
    ],
    issues: rows,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`[kickbacks-sync] Wrote ${rows.length} issues → ${OUT}`);
  console.log("[kickbacks-sync] Summary:", payload.summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
