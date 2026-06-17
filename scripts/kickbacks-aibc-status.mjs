/**
 * AIBC parity vs Kickbacks open issues — manual overrides + heuristics.
 * @see https://github.com/andrewmccalip/kickbacks.ai/issues
 */

/** @type {Record<number, { status: string; note: string; fix?: string }>} */
export const ISSUE_OVERRIDES = {
  128: {
    status: "fixed",
    note: "Portfolio sessions + impression-before-pay + hourly mint cap + earnings caps.",
    fix: "packages/api/src/billing/portfolioSession.ts, ledger.ts",
  },
  127: { status: "backlog", note: "GitHub Copilot CLI adapter — roadmap." },
  126: { status: "backlog", note: "Spend earned balance on ads — not shipped." },
  125: { status: "fixed", note: "UPI payout rail in dashboard.", fix: "PayoutsPanel + /v1/me/payout-method" },
  124: { status: "fixed", note: "PayPal payout rail live.", fix: "PayoutsPanel" },
  123: { status: "fixed", note: "No geo block after OAuth — sign-in completes for all regions.", fix: "auth/google.ts" },
  122: { status: "fixed", note: "Billable events require portfolio session + prior impression.", fix: "ledger.ts + MetricsService session_token" },
  121: { status: "backlog", note: "Positron paths — not targeted yet." },
  120: { status: "backlog", note: "India gift-card payouts — UPI manual rail instead." },
  119: { status: "fixed", note: "VS Code extension path; session-gated metrics.", fix: "extension + portfolio session" },
  118: { status: "wont_fix", note: "FUD — open source extension, no token exfil; privacy page documents behavior." },
  117: { status: "n/a", note: "Subjective UX complaint — opt-in ads only in spinner." },
  116: { status: "fixed", note: "India: Wise/PayPal/UPI manual payouts (no Stripe required).", fix: "stripeConnect + manual rails" },
  114: { status: "fixed", note: "Cursor via VS Marketplace.", fix: "MARKETPLACE.md + install links" },
  113: { status: "fixed", note: "PayPal supported.", fix: "PayoutsPanel" },
  112: { status: "backlog", note: "Aider adapter — not in scope." },
  109: { status: "backlog", note: "Ban appeal flow — admin manual today." },
  106: { status: "backlog", note: "Crypto payouts — not planned." },
  105: { status: "fixed", note: "VS Code extension model — no fragile Claude/Codex file patching.", fix: "extension architecture" },
  104: { status: "in_progress", note: "Caps + session anti-farm; full audit ongoing.", fix: "ledger caps, portfolioSession" },
  103: { status: "fixed", note: "No India account blocks.", fix: "no region gate" },
  102: { status: "fixed", note: "Stripe Connect optional; UPI/Wise/PayPal for India.", fix: "stripeConnect.ts" },
  101: { status: "partial", note: "packages/cli exists; parity audit pending.", fix: "packages/cli" },
  100: { status: "fixed", note: "No incompatible patch flow for VS Code/Cursor.", fix: "extension-only" },
  99: { status: "fixed", note: "Marketplace extension — no unknown incompatible state.", fix: "extension" },
  97: { status: "fixed", note: "deactivate() restores Claude patches + cleans ~/.aibc.", fix: "extension.ts deactivate" },
  96: { status: "backlog", note: "Claude Code terminal — CLI adapter backlog." },
  95: { status: "backlog", note: "OpenCode — backlog." },
  94: { status: "fixed", note: "No loopback shim patching in AIBC extension model.", fix: "architecture" },
  93: { status: "fixed", note: "No JSONC settings strip in extension path.", fix: "architecture" },
  87: { status: "fixed", note: "Open VSX publish path documented.", fix: "npm run publish:openvsx" },
  86: { status: "in_progress", note: "Security hardening ongoing.", fix: "portfolioSession rate limits" },
  85: { status: "backlog", note: "Razorpay — Stripe + manual rails today." },
  83: { status: "fixed", note: "No atomic patch writes — extension does not patch shims.", fix: "architecture" },
  82: { status: "backlog", note: "More CLI adapters — backlog." },
  81: { status: "backlog", note: "OpenCode — backlog." },
  80: { status: "backlog", note: "Antigravity editor — backlog." },
};

const TITLE_RULES = [
  { re: /paypal|upi|payout|india|stripe|razorpay|gift\s*card/i, status: "fixed", note: "Manual or Stripe Connect payout rails shipped." },
  { re: /cursor|windsurf|open\s*vsx|vscode/i, status: "fixed", note: "Multi-editor marketplace installs." },
  { re: /uninstall|patch|jsonc|loopback|atomic|incompatible/i, status: "fixed", note: "Extension model avoids Kickbacks patch issues." },
  { re: /security|farming|botnet|audit/i, status: "in_progress", note: "Session caps + ledger limits." },
  { re: /copilot|cli|aider|opencode|positron|antigravity|terminal/i, status: "backlog", note: "Adapter backlog." },
  { re: /crypto|bitcoin|lightning|usdt/i, status: "backlog", note: "Not on roadmap." },
];

export function aibcStatusForIssue(issue) {
  const n = issue.number;
  if (ISSUE_OVERRIDES[n]) return ISSUE_OVERRIDES[n];

  const title = issue.title || "";
  for (const rule of TITLE_RULES) {
    if (rule.re.test(title)) {
      return { status: rule.status, note: rule.note };
    }
  }

  return { status: "backlog", note: "Tracked — no AIBC action yet." };
}

export const STATUS_LABELS = {
  fixed: "Fixed in AIBC",
  in_progress: "In progress",
  partial: "Partial",
  backlog: "Backlog",
  wont_fix: "Won't fix",
  n_a: "N/A",
};
