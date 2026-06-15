/** Honest today + suggestive forward-looking lines — keep in sync across site. */
export const marketingCopy = {
  q2Inventory:
    "We expect to run the largest captive developer ad inventory in IDE spinners by the end of Q2 2026.",
  q2Developers:
    "We're building toward the largest opt-in developer install base in this category by the end of Q2.",
  yieldTarget:
    "We're targeting $1 per active agent-hour — transparent yield, with 70% paid to developers.",
  earlyCohort:
    "Opening cohort today — early installs earn first when premium campaigns switch on.",
  founderAdvertisers:
    "Founding advertisers get priority placement as inventory scales through Q2.",
  honestLaunch:
    "Live today: VS Code, Cursor, Windsurf, Open VSX, Stripe checkout, and 70% developer share.",
  targetingRollout:
    "Opt-in editor and language tags are live on the developer dashboard; advertiser filters expand as inventory grows.",
  cohortMixNote:
    "Projected cohort mix as we scale through Q2 — based on early install and signup trends.",
  scaleAmbition:
    "We're scaling install paths, payout rails, and founding advertiser demand in parallel — built to be the default way developers monetize AI wait time.",
  transparentYield:
    "Your dashboard shows $/agent-hour in real time — no black-box estimates.",
} as const;

export type ComparisonRow = {
  label: string;
  aibc: string;
  others: string;
  highlight?: boolean;
};

/** Homepage comparison — factual, no competitor names. */
export const AIBC_VS_OTHERS: ComparisonRow[] = [
  {
    label: "Developer revenue share",
    aibc: "70% — published on every page",
    others: "Typically ~50% or less",
    highlight: true,
  },
  {
    label: "Editors supported",
    aibc: "VS Code, Cursor, Windsurf, Open VSX",
    others: "Often VS Code / one stack only",
    highlight: true,
  },
  {
    label: "Payouts",
    aibc: "Stripe Connect auto cash-out + Wise / PayPal / UPI",
    others: "Manual review or “coming soon”",
  },
  {
    label: "Earn more (opt-in signal)",
    aibc: "Live — coarse tags, no source code, ~15% uplift",
    others: "Roadmap or not offered",
    highlight: true,
  },
  {
    label: "Transparent yield",
    aibc: "$/agent-hour on your dashboard — targeting $1/hr",
    others: "Opaque or estimated only",
  },
  {
    label: "Advertiser checkout",
    aibc: "Stripe live — bid without a sales call",
    others: "Waitlist or manual onboarding",
  },
  {
    label: "Sample vs real ads",
    aibc: "Sample inventory labeled; public leaderboard = paying brands only",
    others: "House ads often shown as live",
  },
  {
    label: "Q2 scale target",
    aibc: "Largest IDE spinner inventory + developer base in category",
    others: "Single-editor focus",
  },
];
