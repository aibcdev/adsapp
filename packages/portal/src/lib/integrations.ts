import type { IntegrationConfig } from "../components/marketing/IntegrationPage";

const EARNINGS = [
  { label: "Casual", amount: "$25–40/mo", detail: "~2–3 hrs/day" },
  { label: "Regular", amount: "$40–75/mo", detail: "~4–6 hrs/day" },
  { label: "Power user", amount: "$90–150/mo", detail: "8+ hrs/day" },
];

export const INTEGRATIONS: Record<string, IntegrationConfig> = {
  claude: {
    slug: "claude",
    toolName: "Claude",
    headline: "Get Paid Using Claude",
    description: "Earn while Claude Code or Claude CLI processes your requests. One sponsor line in the spinner — 70% to you.",
    logoSrc: "/logos/claude-code.svg",
    whyTitle: "Why Claude + AIBC works",
    whyPoints: [
      "Long AI wait times mean more earning moments.",
      "Hooks into Claude Code spinner — no workflow change.",
      "We never read your prompts or source code.",
      "Works alongside Claude Pro — offset your subscription.",
    ],
    steps: [
      { num: "1", title: "Install the extension", body: "Add AIBC to VS Code, Cursor, or Windsurf. One click." },
      { num: "2", title: "Sign in", body: "Connect with Google or email to track earnings." },
      { num: "3", title: "Use Claude as usual", body: "Keep coding with Claude Code or CLI." },
      { num: "4", title: "Earn automatically", body: "A relevant sponsor line appears during AI wait states." },
    ],
    earnings: EARNINGS,
    faqs: [
      { q: "Does AIBC read my Claude conversations?", a: "No. We only show ads during wait states. Your code and prompts stay private." },
      { q: "Does it work with Claude Pro?", a: "Yes. Install the extension in your editor — Pro subscription unchanged." },
      { q: "How much can I earn?", a: "Most active developers earn $40+/month — power users often hit $90–150. You keep 70% of advertiser spend." },
    ],
  },
  cursor: {
    slug: "cursor",
    toolName: "Cursor",
    headline: "Get Paid Using Cursor",
    description: "Monetize idle time in Cursor. Install from the marketplace and earn while the AI agent thinks.",
    logoSrc: "/logos/cursor.svg",
    whyTitle: "Built for Cursor users",
    whyPoints: [
      "Native VS Code extension — installs directly in Cursor.",
      "Ads appear in the AI spinner, not over your code.",
      "Premium dev-tool advertisers onboarding now.",
      "Same account works across VS Code and Windsurf too.",
    ],
    steps: [
      { num: "1", title: "Install in Cursor", body: "Search AIBC in Extensions or use our install link." },
      { num: "2", title: "Sign in", body: "Create your account in under a minute." },
      { num: "3", title: "Code with AI", body: "Use Cursor agents and chat as you already do." },
      { num: "4", title: "Collect earnings", body: "Balance updates in the sidebar and dashboard." },
    ],
    earnings: EARNINGS,
    faqs: [
      { q: "Will this slow down Cursor?", a: "No measurable impact. Ads load asynchronously during wait states only." },
      { q: "Is it allowed at work?", a: "Check your employer policy. The extension is opt-in and pausable anytime." },
      { q: "Minimum payout?", a: "$10 via Stripe when you request a withdrawal." },
    ],
  },
  v0: {
    slug: "v0",
    toolName: "V0",
    headline: "Get Paid Using V0",
    description: "Building with V0 means waiting on generations. AIBC turns that idle time into income.",
    logoSrc: "/logos/v0.svg",
    whyTitle: "Perfect for V0 sessions",
    whyPoints: [
      "UI generation runs take time — ideal for non-intrusive ads.",
      "Earn while V0 drafts components and layouts.",
      "Relevant dev-tool sponsors, not random banners.",
      "Stack earnings with your editor extension too.",
    ],
    steps: [
      { num: "1", title: "Install AIBC", body: "Start with the VS Code / Cursor extension for in-editor earnings." },
      { num: "2", title: "Sign in", body: "One account tracks all your earnings." },
      { num: "3", title: "Build with V0", body: "Keep prompting and iterating in V0." },
      { num: "4", title: "Earn on wait time", body: "Income accrues during AI processing across your toolchain." },
    ],
    earnings: EARNINGS,
    faqs: [
      { q: "Is there a V0 browser extension?", a: "Editor extension is live today. Browser coverage is on the roadmap." },
      { q: "What ads will I see?", a: "Developer tools, infra, and SaaS — products relevant to builders." },
      { q: "Can I disable ads?", a: "Yes. Pause anytime from the extension menu." },
    ],
  },
  antigravity: {
    slug: "antigravity",
    toolName: "Antigravity",
    headline: "Get Paid Using Antigravity",
    description: "Use Google's Antigravity IDE and earn while agent tasks run. AIBC fits naturally into long AI sessions.",
    logoSrc: "/logos/antigravity.svg",
    whyTitle: "Antigravity + passive income",
    whyPoints: [
      "Agent-first IDEs mean longer wait windows.",
      "Marketplace-compatible extension model.",
      "Privacy-first — no code leaves your machine.",
      "Early cohort gets first access to premium campaigns.",
    ],
    steps: [
      { num: "1", title: "Install the extension", body: "Add AIBC from the VS Code-compatible marketplace." },
      { num: "2", title: "Sign in", body: "Link your account to track balance." },
      { num: "3", title: "Work in Antigravity", body: "Run agents and builds as normal." },
      { num: "4", title: "Earn automatically", body: "Sponsor lines appear during processing." },
    ],
    earnings: EARNINGS,
    faqs: [
      { q: "Is Antigravity supported today?", a: "Any VS Code-compatible editor with our marketplace extension works." },
      { q: "Does it access my project files?", a: "No. We never read, store, or transmit your source code." },
      { q: "How do payouts work?", a: "$10 minimum. Request from your dashboard when ready." },
    ],
  },
};
