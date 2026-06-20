import { DEVELOPER_SHARE_PCT } from "@aibc/shared";
import { INTEGRATIONS } from "./integrations";

export const SITE_URL = "https://aibcmedia.com";
export const SITE_NAME = "AIBC Media";
export const SITE_TAGLINE = "Make Money Whilst You Code";
export const DEFAULT_DESCRIPTION =
  `Install free. Keep ${DEVELOPER_SHARE_PCT}%. One sponsored line in your AI spinner — no popups. Works with VS Code, Cursor, Windsurf, and Claude Code.`;
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export type SeoConfig = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  type?: "website" | "article";
};

const STATIC_SEO: Record<string, Omit<SeoConfig, "path">> = {
  "/": {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
  },
  "/advertisers": {
    title: `Advertise to Developers | ${SITE_NAME}`,
    description:
      "Reach developers during AI wait states. Auction-based bids, brand-safe inventory, captive attention in VS Code, Cursor, and Claude.",
  },
  "/advertisers/apply": {
    title: `Advertiser Application | ${SITE_NAME}`,
    description: "Apply to run developer-tool campaigns on the AIBC spinner network.",
    noindex: true,
  },
  "/developers/how-it-works": {
    title: `How It Works for Developers | ${SITE_NAME}`,
    description:
      `Install the extension, sign in, and earn ${DEVELOPER_SHARE_PCT}% when a sponsor line appears in your AI spinner. No popups. No code access.`,
  },
  "/developers/payouts": {
    title: `Developer Payouts | ${SITE_NAME}`,
    description:
      "Cash out at $10 minimum via Wise, PayPal, or UPI. 72-hour hold, manual review, founding-member priority.",
  },
  "/referral": {
    title: `Referral Program | ${SITE_NAME}`,
    description: "Earn $10 when your referral makes $10+ lifetime on AIBC. Share your code from the dashboard.",
  },
  "/contact": {
    title: `Contact | ${SITE_NAME}`,
    description: "Questions about installs, payouts, or advertising? Reach the AIBC team.",
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: "What AIBC collects, what we never touch, and how developer data is handled.",
  },
  "/terms": {
    title: `Terms of Service | ${SITE_NAME}`,
    description: "Terms for developers, advertisers, and payout rules on AIBC Media.",
  },
  "/blog": {
    title: `Blog | ${SITE_NAME}`,
    description:
      "Founder notes on AI coding, developer income, and monetizing your IDE with Claude, Cursor, and VS Code.",
  },
  "/publishers": {
    title: `Publishers | ${SITE_NAME}`,
    description: "Publisher information for the AIBC developer advertising network.",
  },
  "/login": {
    title: `Sign In | ${SITE_NAME}`,
    description: "Sign in to your AIBC developer or advertiser dashboard.",
    noindex: true,
  },
  "/forgot-password": {
    title: `Forgot Password | ${SITE_NAME}`,
    description: "Reset your AIBC Media account password.",
    noindex: true,
  },
  "/reset-password": {
    title: `Reset Password | ${SITE_NAME}`,
    description: "Choose a new password for your AIBC Media account.",
    noindex: true,
  },
  "/dashboard": {
    title: `Dashboard | ${SITE_NAME}`,
    description: "Your AIBC earnings, payout settings, and account overview.",
    noindex: true,
  },
  "/admin/alternate": {
    title: `Admin Alternate | ${SITE_NAME}`,
    description: "Presentation view of network metrics for partner demos.",
    noindex: true,
  },
  "/extension/connect": {
    title: `Connect Extension | ${SITE_NAME}`,
    description: "Link your IDE extension to your AIBC account.",
    noindex: true,
  },
};

const NOINDEX_PREFIXES = ["/admin"];

export function seoForPath(pathname: string): SeoConfig {
  const path = pathname.split("?")[0] || "/";
  const integrationMatch = path.match(/^\/integrations\/([^/]+)$/);
  if (integrationMatch) {
    const config = INTEGRATIONS[integrationMatch[1]];
    if (config) {
      return {
        path,
        title: `${config.headline} | ${SITE_NAME}`,
        description: config.description,
      };
    }
  }

  const staticSeo = STATIC_SEO[path];
  if (staticSeo) {
    return { path, ...staticSeo };
  }

  const noindex =
    NOINDEX_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) ||
    path.startsWith("/admin/");

  return {
    path,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    noindex,
  };
}
