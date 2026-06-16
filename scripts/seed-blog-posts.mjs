#!/usr/bin/env node
/**
 * Writes seed blog posts to packages/portal/content/blog/
 * Run: node scripts/seed-blog-posts.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "..", "packages", "portal", "content", "blog");
mkdirSync(dir, { recursive: true });

const posts = [
  {
    slug: "claude-code-paid-solopreneurs",
    title: "Claude Code is creating a new generation of paid solopreneurs",
    description:
      "Junior devs ship 10x faster with Claude. Here's why the spinner — not the side project — is where the money hides.",
    publishedAt: "2026-06-01T08:00:00Z",
    tags: ["claude-code", "solopreneur", "developer-income"],
    keywords: ["claude code monetization", "make money coding", "ai solopreneur"],
    body: `I stopped treating Claude Code's wait spinner like dead air.

Every time the model thinks, millions of developers stare at the same blank loop. That loop is attention. Attention has value. Most of us give it away for free.

I'm not saying quit your job tomorrow. I'm saying the math changed. When a junior dev can ship a feature in an afternoon that used to take a week, the bottleneck isn't typing. It's **distribution** and **monetization while you build**.

Three things I'm seeing in the wild:

1. **Build speed is table stakes.** Claude, Cursor, Copilot — pick your poison. The gap is closing fast.
2. **The creative win.** The people who know a niche — finance ops, indie SaaS, vertical workflows — can now build without a co-founder who codes.
3. **Micro-monetization matters.** Not every product needs a $29/mo subscription on day one. Sometimes you monetize the workflow itself.

That's why we built AIBC: one sponsored line in the spinner. No popup. No tab hijack. You keep 70%.

If you're coding 80% of your week with AI, the other 20% should include getting paid for the attention you're already giving away.

[Install free →](/#install) · [How it works →](/developers/how-it-works)`,
  },
  {
    slug: "ai-spinner-undervalued-ad-slot",
    title: "Why your AI spinner is the most undervalued ad slot on the internet",
    description:
      "Developers hate ads. They don't hate relevant one-liners while Claude thinks. Here's the economics.",
    publishedAt: "2026-06-02T08:00:00Z",
    tags: ["developer-ads", "monetization", "ai-coding"],
    keywords: ["developer advertising", "ai spinner ads", "monetize ide"],
    body: `Popups trained a generation of developers to install ad blockers.

Fair. I'd do the same.

But the AI spinner is different. You're already waiting. You're already reading the status line. One relevant sponsor message — dev tools, infra, B2B SaaS — doesn't feel like an interruption. It feels like a tip while the model loads.

Advertisers pay for intent. A developer staring at a spinner during a production deploy has **high intent**.

What we won't run: gambling, crypto scams, politics, adult content. Developer trust is the whole product.

The model is simple:

- Impression when the ad renders in the spinner
- Click pays more (auction-based, like search ads)
- 72-hour hold, then payable balance
- You cash out at $10 minimum

If you're going to wait anyway, you might as well get paid.

[See payout rules →](/developers/payouts) · [Install →](/#install)`,
  },
  {
    slug: "eighty-percent-claude-twenty-percent-rest",
    title: "I coded 80% of my week with Claude — here's what I do with the other 20%",
    description:
      "Build speed isn't the hard part anymore. Distribution, judgment, and getting paid while you ship — that's the other 20%.",
    publishedAt: "2026-06-03T08:00:00Z",
    tags: ["claude-code", "productivity", "founder"],
    keywords: ["claude code workflow", "ai coding productivity", "developer founder"],
    body: `Last month I tracked my time honestly. About 80% inside Claude Code or Cursor. The rest wasn't Netflix.

It was:

1. **Talking to users** — even five DMs beat another feature nobody asked for
2. **Writing content** — SEO compounds; your README doesn't
3. **Checking the money** — payouts, caps, fraud flags. Boring. Necessary.

The Guillermo Flor crowd is right: creative people can build anything now. The comment section is also right: **100M companies don't die from slow code**. They die on judgment calls.

AI handles the repeatable 80%. The 20% that needs a human — positioning, trust, pricing — that's where you win.

I run AIBC on every machine I code on. Not because I'm sentimental. Because those spinner minutes add up to real dollars while I'm already working.

Your move: ship faster *and* capture the attention you're already spending.

[Dashboard →](/dashboard) · [Refer a dev, earn $10 →](/referral)`,
  },
  {
    slug: "make-money-while-claude-thinks",
    title: "Make money while Claude thinks: an honest guide for junior devs",
    description:
      "No get-rich-quick. Just how developer spinner monetization actually works for people starting out.",
    publishedAt: "2026-06-04T08:00:00Z",
    tags: ["junior-developer", "claude-code", "side-income"],
    keywords: ["make money while coding", "junior developer side income", "claude code earnings"],
    body: `If you're junior, you're probably tired of "just build a SaaS" advice.

So here's the honest version.

You won't retire from spinner ads in week one. You might cover your Claude subscription in month one if you code daily. That's still a win.

How it works:

1. Install the AIBC extension (VS Code, Cursor, Windsurf — same idea)
2. Sign in once
3. When Claude shows the thinking spinner, a single sponsor line can appear
4. Valid impressions and clicks credit your balance after a 72-hour hold
5. Request payout at $10+ via Wise, PayPal, or UPI

Caps exist so nobody games the system: earning limits per hour/day, withdrawal limits per week. Read them. They're in the dashboard.

Don't click your own ads. Don't bot impressions. We review payouts manually.

The opportunity isn't "replace your salary." It's **get paid for time you're already losing to the spinner**.

[Install →](/#install) · [Terms →](/terms)`,
  },
  {
    slug: "developer-ad-share-2026",
    title: "What actually pays developers in 2026",
    description:
      "Spinner monetization in plain English — developer share, caps, restore behavior, and what to compare.",
    publishedAt: "2026-06-05T08:00:00Z",
    tags: ["comparison", "developer-income", "economics"],
    keywords: ["developer ad share", "spinner monetization", "ide extension earnings"],
    body: `Developers will tolerate one line in the spinner if the economics are fair.

Here's where AIBC lands in 2026:

**Core model**
- ~70% developer share on validated events
- Auction-style bids from advertisers
- Claude Code / CLI integration path
- No popups — spinner only

**What we added**
- Founding member +5% for the first 15,000 devs
- Referral bonus: $10 when your referral earns $10+ lifetime
- Admin tools: user search, payout restore on failed sends
- Clean uninstall restore (no stale patches — we harden this constantly)

**What we're still building**
- Open VSX publish (in progress)
- India rails beyond manual UPI review

If you're comparing tools, compare **payout history, restore behavior, and caps** — not landing page copy.

[Install AIBC →](/#install)`,
  },
  {
    slug: "ten-dollar-minimum-payout-why",
    title: "The $10 payout threshold — why we set it that way",
    description:
      "Not arbitrary. Fraud review, Wise fees, and keeping the queue manageable for a small team.",
    publishedAt: "2026-06-06T08:00:00Z",
    tags: ["payouts", "trust", "developers"],
    keywords: ["developer minimum payout", "aibc payout threshold", "wise developer payments"],
    body: `Someone always asks: why not $1?

Because we're not a casino micro-payment app. Every payout is **manually reviewed**. Wise and PayPal have friction below certain amounts. A $1 queue of 10,000 requests would kill a two-person ops team.

$10 is the line where:

1. Real usage shows up (not install-and-forget)
2. Fees don't eat the payment
3. Fraudsters lose interest

You also get withdrawal limits: requests per day/week, max USD per day. Earning caps ($20/hr, $200/day) are separate — those protect the advertiser pool.

Terms and code now both say **$10**. We fixed the mismatch.

Founding members get +5% on credits forever (first 15k). Referrals can add $10 on your first payout.

[Set up payouts →](/developers/payouts) · [Dashboard →](/dashboard)`,
  },
  {
    slug: "cursor-windsurf-vscode-where-ads-work",
    title: "Cursor, Windsurf, VS Code: where developer ads actually work",
    description:
      "Not every surface is equal. Why the AI wait state beats banners, sidebars, and notification spam.",
    publishedAt: "2026-06-07T08:00:00Z",
    tags: ["cursor", "vscode", "windsurf"],
    keywords: ["cursor extension ads", "vscode developer monetization", "windsurf ads"],
    body: `I've seen every bad idea: sidebar banners, notification spam, injected tabs.

Developers nuke them.

The AI wait state is different. You're blocked anyway. Eyes on the status line. One text link with a relevant dev tool — Linear, Supabase, whatever bid won the auction — feels native.

Platforms we target:

- **VS Code** — marketplace + Open VSX path
- **Cursor** — same extension roots, Claude Code webview patch
- **Windsurf** — Open VSX install flow
- **Claude CLI** — status line hook for terminal purists

What doesn't work: interrupting flow during typing, hiding close buttons, tracking code content. We don't want your source. We want a single monetized moment you already have.

Advertisers: if you're B2B dev tools, [this is your inventory →](/advertisers).

Developers: [pick your platform →](/#install)`,
  },
  {
    slug: "founding-member-five-percent-forever",
    title: "Founding member +5% forever — why we're capping at 15,000",
    description:
      "Scarcity with a reason. First 15k authenticated devs get a permanent earnings multiplier.",
    publishedAt: "2026-06-08T08:00:00Z",
    tags: ["founding-member", "economics", "growth"],
    keywords: ["aibc founding member", "developer bonus earnings", "early adopter developer"],
    body: `We could've made "+5% bonus" marketing fluff.

Instead it's in the ledger: **founding_member = 1** → 1.05× on validated credits.

Enrollment: first authenticated session while global count < 15,000. No coupon code. No influencer backdoor.

Why cap?

1. **Budget predictability** for advertisers
2. **Reward early believers** without infinite liability
3. **Priority payout sort** in admin queue — founding members first when cash is moving

You'll see a badge on your dashboard when you're in.

If you're reading this and we're under 15k — install and sign in. The counter is real.

[Install →](/#install) · [Dashboard badge →](/dashboard)`,
  },
  {
    slug: "refer-a-developer-earn-ten-dollars",
    title: "Refer a developer, earn $10: the math behind our referral program",
    description:
      "Qualified when they earn $10 lifetime. Bonus hits your first payout. Simple rules, no MLM nonsense.",
    publishedAt: "2026-06-09T08:00:00Z",
    tags: ["referral", "growth", "developers"],
    keywords: ["developer referral program", "refer a developer earn money", "aibc referral"],
    body: `Referral programs usually feel like pyramid schemes wearing a hoodie.

Ours is boring on purpose:

1. You get a code like \`AIBC-XXXX\`
2. Friend installs, signs in with your link
3. When **their lifetime earnings hit $10**, you qualify
4. On **your first payout request**, we add **$10** to the amount

One bonus per referrer. No infinite chain.

Why $10 qualification? Proves real usage, not install farming.

Share link lives in dashboard and [/referral](/referral).

If you're the person who sends Guillermo-style resource lists to your group chat — this is the link to add at the bottom.

[Get your link →](/referral)`,
  },
  {
    slug: "vibe-coding-ten-percent-code-ninety-distribution",
    title: "Vibe coding is 10% code, 90% distribution (and how to fix that)",
    description:
      "You can ship in a weekend. Getting found is the hard part. SEO, community, and monetizing while you build.",
    publishedAt: "2026-06-10T08:00:00Z",
    tags: ["vibe-coding", "distribution", "seo"],
    keywords: ["vibe coding distribution", "ai saas marketing", "developer seo"],
    body: `The lie: vibe coding tools let everyone build a $10M SaaS by Friday.

The truth: you **can** build. Distribution still sucks.

Code is 10%. The rest:

- Landing page that ranks
- Content that sounds human
- Community proof
- A monetization path before you have paying users

While you're building with Claude, AIBC monetizes the spinner you're already staring at. That's not a business model alone — it's **cash flow while you figure out the real product**.

This blog exists for the 90%: SEO-heavy, founder voice, twice a day. We're eating our own cooking.

Your homework:

1. Ship the weird tool that solves your own annoyance
2. Write one honest post about what you learned
3. Install something that pays you during the wait states

[Blog home →](/blog) · [Install →](/#install)`,
  },
  {
    slug: "what-advertisers-pay-inside-your-ide",
    title: "What advertisers pay for inside your IDE (without popups)",
    description:
      "Auction mechanics, CPM-style bids, and why dev-tool brands want spinner inventory.",
    publishedAt: "2026-06-11T08:00:00Z",
    tags: ["advertisers", "economics", "transparency"],
    keywords: ["developer advertising rates", "ide ad pricing", "b2b dev tool ads"],
    body: `Advertisers don't buy "developers" as a demographic blob. They buy **moments of intent**.

Spinner = waiting = cognitive pause = readable line of text.

Economics (simplified):

- Bid per 1,000 impressions
- Developer share ~70%
- Clicks pay a multiple of impressions
- Campaigns exhaust when budget/impression cap hits

We block sketchy categories. Dev trust is inventory.

If you're a brand: you're not buying popups. You're buying a single native line in the AI wait state. [Launch a campaign →](/advertisers).

If you're a dev: you're the supply side. [Keep 70% →](/developers/how-it-works).`,
  },
  {
    slug: "tuesday-afternoon-problem-building-is-easy",
    title: "The Tuesday afternoon problem: building is easy, getting paid is hard",
    description:
      "Parag Agrawal nailed it. The code works. Silence is worse than complaints. Here's what we optimize for.",
    publishedAt: "2026-06-12T08:00:00Z",
    tags: ["founder", "mindset", "building-in-public"],
    keywords: ["technical founder struggles", "building in public", "developer founder"],
    body: `Tuesday, 2pm. Fourteen outreach messages. Zero replies.

The demo works. Deployments pass. Tests green.

Silence.

Every technical founder knows this. AI made the green tests part **easier**. It didn't fix LinkedIn, investors, or the inbox.

AIBC won't solve your GTM. It will pay you while you're in the IDE suffering through the Tuesday afternoon anyway.

Small dollars matter psychologically when you're pre-revenue. Seeing a balance tick up during a real Claude session beats another zero on Stripe.

Build the company. But stop giving away every wait state for free.

[Dashboard →](/dashboard)`,
  },
  {
    slug: "claude-code-uninstall-anxiety-clean-restore",
    title: "Claude Code uninstall anxiety — why clean restore matters",
    description:
      "Patches that don't revert kill trust. How we restore index.js, settings.json, and ~/.aibc artifacts.",
    publishedAt: "2026-06-13T08:00:00Z",
    tags: ["claude-code", "trust", "extension"],
    keywords: ["claude code extension uninstall", "aibc restore", "developer trust"],
    body: `The #1 fear with any Claude Code patcher: **what if uninstall leaves garbage?**

Fair. We harden restore constantly:

- \`index.js\` injection stripped or restored from backup
- \`~/.claude/settings.json\` status line removed
- \`~/.aibc/*\` artifacts deleted on deactivate
- \`aibc: Restore Claude Code\` command if you want manual control

Every uninstall bug we fix is a reminder: trust is the product.

If restore fails, you won't recommend us. Neither will Reddit.

Try it. Uninstall. Check your files. We bet you'll come back.

[Install →](/#install) · [Privacy →](/privacy)`,
  },
  {
    slug: "seo-for-developers-who-hate-marketing",
    title: "SEO for developers who hate marketing (write once, rank forever)",
    description:
      "You don't need a growth team. You need honest posts targeting searches you already understand.",
    publishedAt: "2026-06-14T08:00:00Z",
    tags: ["seo", "content", "developers"],
    keywords: ["developer seo", "technical blog seo", "ai coding content marketing"],
    body: `Marketing makes devs itch.

SEO is just **answering questions people already type into Google**.

Examples that matter for us:

- "make money with claude code"
- "developer ad share spinner"
- "monetize cursor extension"

Write like a human. First person. Specific numbers. No AI-slop listicles with zero opinion.

Technical checklist we run on every post:

1. Title + meta description with primary keyword
2. JSON-LD Article schema
3. Static HTML for crawlers
4. Internal links to product pages
5. RSS + sitemap

You're reading the system working.

Steal the playbook. Or just read twice a week — we publish daily.

[All posts →](/blog)`,
  },
  {
    slug: "first-hundred-dollars-coding-ads-dashboard",
    title: "My first $100 from coding ads — what the dashboard actually showed",
    description:
      "Realistic timeline: impressions, hold period, payable balance, and the first manual payout request.",
    publishedAt: "2026-06-14T18:00:00Z",
    tags: ["earnings", "dashboard", "payouts"],
    keywords: ["developer ad earnings", "aibc dashboard", "coding side income proof"],
    body: `Nobody believes screenshots. Fine — here's the narrative.

Week 1: pennies in **pending**. 72-hour hold feels long. It is.

Week 2: **payable** crosses $10. Set Wise handle. Request payout.

Week 3: manual review. Paid. Referral bonus on first payout if you qualified someone.

Dashboard shows:

- Today / month / lifetime
- Hourly and daily earning caps (separate from withdrawal limits)
- Activity ledger when you pull it
- Founding badge if you enrolled early

It's not life-changing money for most people yet. It's **proof the model works** while you build the thing that is life-changing.

Your turn.

[Open dashboard →](/dashboard) · [Install →](/#install)`,
  },
];

for (const p of posts) {
  const path = join(dir, `${p.slug}.md`);
  if (existsSync(path)) {
    console.log(`skip ${p.slug} (exists)`);
    continue;
  }
  const front = `---
title: "${p.title.replace(/"/g, '\\"')}"
slug: "${p.slug}"
description: "${p.description.replace(/"/g, '\\"')}"
publishedAt: "${p.publishedAt}"
author: "AIBC"
tags: [${p.tags.map((t) => `"${t}"`).join(", ")}]
keywords: [${p.keywords.map((k) => `"${k}"`).join(", ")}]
draft: false
---

`;
  writeFileSync(path, front + p.body + "\n");
  console.log(`wrote ${p.slug}`);
}

console.log(`done — ${posts.length} posts in ${dir}`);
