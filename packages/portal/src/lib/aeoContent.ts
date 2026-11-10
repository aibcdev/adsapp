import { DEVELOPER_SHARE_PCT } from "@aibc/shared";
import { SUPPORT_EMAIL } from "./contact";
import { EXTENSION_ID, OPEN_VSX_URL } from "./installLinks";

/**
 * About, FAQ, and hub copy.
 * Limited to facts already on the marketing pages in this repo and on the live
 * site (pricing, /vs/kickbacks, the two guides, developer guide, payouts, contact),
 * checked 10 Nov 2026. No company history, team, or install totals.
 */
export const SITE_ORIGIN = "https://aibcmedia.com";

export const AEO_SEO: Record<string, { title: string; description: string }> = {
  "/about": {
    title: "About | AIBC Media",
    description:
      "AIBC Media runs one sponsored line in the AI spinner in VS Code, Cursor, Windsurf, and Claude Code. Advertisers start at $0.25 per 1,000 views. Developers earn up to 60% of ad spend.",
  },
  "/faq": {
    title: "FAQ | AIBC Media",
    description:
      "Answers on AIBC spinner ads: how a view works, pricing from $0.25 per 1,000 views, the developer share, payouts, brand safety, and what the extension does not read.",
  },
  "/guides": {
    title: "Guides | AIBC Media",
    description:
      "Practical guides for advertising to developers and moving from Kickbacks to AIBC, with the pricing, comparison, and install pages linked from one place.",
  },
  "/developers": {
    title: "Developers | AIBC Media",
    description:
      "Install AIBC, earn from one sponsor line in the AI spinner, and cash out from $10. Guides for how it works, payouts, and the editors that are supported.",
  },
  "/vs": {
    title: "Comparisons | AIBC Media",
    description:
      "How AIBC compares with Kickbacks on entry price, developer share, editors, and payouts. Sources and the full comparison are on the Kickbacks page.",
  },
};

export type FaqItem = { q: string; a: string };

export type FaqGroup = {
  id: string;
  title: string;
  intro: string;
  items: FaqItem[];
};

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "spinner",
    title: "How spinner ads work",
    intro:
      "These answers match the how-it-works page, the privacy policy, and the pricing page. A spinner ad is one line during the AI wait, not a popup and not a banner on a website.",
    items: [
      {
        q: "What is a spinner ad?",
        a: "When an AI coding tool is working, the editor shows a wait state. AIBC uses that moment for one sponsored line. The how-it-works page describes the sequence as: the model processes the request, a dev-tool sponsor line appears in the spinner, and the line is gone when the response is back. Your editing workflow stays the same. There are no popups.",
      },
      {
        q: "What counts as a view?",
        a: "The pricing page defines a view as your line on screen in a developer's editor for at least 5 seconds. Each view also has to pass session checks. Advertisers pay for views only. A higher price moves the line forward in the queue. It does not buy extra views.",
      },
      {
        q: "Which editors does AIBC support?",
        a: `The extension runs in VS Code, Cursor, Windsurf, and Claude Code. VS Code and Cursor install from the Visual Studio Marketplace. Windsurf and VSCodium install from Open VSX at ${OPEN_VSX_URL}. The extension id is ${EXTENSION_ID}. In the command palette the install command is ext install ${EXTENSION_ID}.`,
      },
      {
        q: "Will the extension slow down the editor?",
        a: "The how-it-works page says no. Ads load asynchronously, and only during AI wait states.",
      },
    ],
  },
  {
    id: "advertisers",
    title: "Advertisers and pricing",
    intro:
      "Prices below are the ones published on the pricing page. Kickbacks figures are the ones that page attributes to a third-party review and to Kickbacks' own leaderboard, not numbers AIBC measured.",
    items: [
      {
        q: "How much does it cost to advertise?",
        a: "Campaigns start at $0.25 per 1,000 views. You buy placements in blocks of 1,000 and you set the price per 1,000 views. The minimum deposit is $5 via Stripe. The minimum charge is $0.50. The ad is one text line of up to 60 characters, plus an optional icon (PNG, JPG, or WebP, up to 64 KB), shown while the AI works. There is no contract. You can pause from the dashboard.",
      },
      {
        q: "How does that price compare with Kickbacks?",
        a: "AIBC publishes a minimum of $0.25 per 1,000 views. The pricing and comparison pages say Kickbacks has not published a minimum. A third-party review on go-to-agency.com (17 Oct 2026) reports $0.50, and other reviews report $1.00. On 28 Oct 2026 the Kickbacks public leaderboard showed $2.48 per 1,000 in the editor and $0.74 per 1,000 in the terminal. Those leaderboard numbers are a market price on that date, not a rate AIBC sets.",
      },
      {
        q: "How does a campaign go live?",
        a: "The pricing page says a line goes live about 10 minutes after Stripe confirms payment. There is no manual review queue. Lines that break the ad rules can be paused. Unspent cash balance is refunded on request, minus Stripe fees. Promo credit is never refundable. Reporting in the dashboard is views, clicks, click rate, spend, and effective CPM.",
      },
      {
        q: "What is the LAUNCH50 offer?",
        a: "Deposit $50 and receive $50 of ad credit. The credit unlocks after $50 of real deposits has cleared. It is one per account, and the credit does not expire.",
      },
      {
        q: "Can I choose which developers see the line?",
        a: "The pricing page says you can run worldwide or pick countries. The advertisers page says developers can opt in to share coarse tags (editor, language, stack) so a line can match better. Those tags are not source code. Editor and language filters on the advertiser side are described as expanding as inventory grows.",
      },
      {
        q: "What is not allowed in an ad?",
        a: "The advertisers page limits inventory to developer tools and B2B products. It excludes gambling, adult content, politics, crypto scams, and spam. Links on that page are described as HTTPS.",
      },
    ],
  },
  {
    id: "developers",
    title: "Developers and payouts",
    intro:
      "The share and the payout minimum are published on the pricing, how-it-works, and payouts pages. Dollar-per-month estimates are not repeated here.",
    items: [
      {
        q: "How much do developers earn?",
        a: `Developers earn up to ${DEVELOPER_SHARE_PCT}% of ad spend. The pricing page says most developers earn 10–20%. The developer pages describe the ${DEVELOPER_SHARE_PCT}% figure as a share of what the advertiser pays: if a brand pays $1 for a view on your machine, the published split is ${DEVELOPER_SHARE_PCT}¢ to you. There is no separate fee taken out of that share on your side.`,
      },
      {
        q: "How do payouts work?",
        a: "The minimum payout is $10. The payouts page lists Stripe Connect as the automatic cash-out, with processing in 1–5 business days, and says AIBC does not charge a withdrawal fee. Wise, PayPal, and UPI are named as payout methods on the how-it-works page, the comparison page, and the privacy policy. The payouts page is the place to confirm which rails are open on an account. The comparison page describes PayPal, Wise, and UPI as manually reviewed.",
      },
      {
        q: "How do I install AIBC and get paid?",
        a: `Add ${EXTENSION_ID} in VS Code, Cursor, or Windsurf, then sign in with Google or email. The how-it-works page lists that as the start of the flow, and earnings are tracked in the dashboard. Cash out from the payouts page once the balance reaches $10. You can pause or sign out at any time.`,
      },
      {
        q: "Can I switch from Kickbacks?",
        a: "The migration guide splits this in two. Advertisers export their Kickbacks impressions, clicks, and spend, pause or finish the Kickbacks campaign, and recreate the line on AIBC (60 characters, optional icon, price from $0.25 per 1,000 views, deposit of $5 or more). Developers are told to cash out of Kickbacks first, because that guide cites Kickbacks' terms: the minimum payout is $10 and balances under $10 are forfeited when an account closes. Then uninstall Kickbacks, install AIBC, sign in, and add a payout method. You can run both extensions. AIBC does not remove another extension's code, but both compete for the same spinner spot.",
      },
    ],
  },
  {
    id: "safety",
    title: "Brand safety and privacy",
    intro:
      "The privacy policy is the constraint on data. The pricing page is the constraint on review. The longer brand-safety essay on the blog argues the same placement from the advertiser's side.",
    items: [
      {
        q: "Does AIBC read code, prompts, or chats?",
        a: "No. The privacy policy says AIBC never reads, stores, or transmits prompts, source code, or AI conversation content. The extension's network use is for fetching ads, reporting impressions, and signing in. A local loopback on 127.0.0.1 is used for click and view attribution. Source code, prompts, and browsing history are listed as never collected.",
      },
      {
        q: "Is the placement brand-safe for an advertiser?",
        a: "The line sits in the AI spinner inside the editor, which is a single controlled slot rather than a page on the open web. The advertisers page restricts what can run to developer tools and B2B products. The pricing page says there is no manual review queue before a paid line goes live, and that lines which break the ad rules can be paused. The privacy rules above still apply: the product does not read the file the developer has open in order to place the ad.",
      },
      {
        q: "How do I contact AIBC?",
        a: `Use the contact page. The form asks for a name, email, topic, and message, and the page says replies take 1–2 business days. The address on the site and in the contact form is ${SUPPORT_EMAIL}.`,
      },
      {
        q: "Is there a program for publishers?",
        a: "The publishers page is for platform owners who want a one-line native format inside an IDE, app, or platform, with revenue shared back to users, and without popups or code reading. It lists an SDK as coming soon. Partnership questions go through the contact page.",
      },
    ],
  },
];

export function allFaqItems(): FaqItem[] {
  return FAQ_GROUPS.flatMap((group) => group.items);
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: "AIBC Media",
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/icon-512.png`,
    email: SUPPORT_EMAIL,
    description: AEO_SEO["/about"].description,
  };
}

export function aboutJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "AboutPage",
        "@id": `${SITE_ORIGIN}/about#webpage`,
        url: `${SITE_ORIGIN}/about`,
        name: "About AIBC Media",
        description: AEO_SEO["/about"].description,
        isPartOf: { "@type": "WebSite", name: "AIBC Media", url: SITE_ORIGIN },
        about: { "@id": `${SITE_ORIGIN}/#organization` },
        mainEntity: { "@id": `${SITE_ORIGIN}/#organization` },
        publisher: { "@id": `${SITE_ORIGIN}/#organization` },
      },
    ],
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${SITE_ORIGIN}/faq`,
    isPartOf: { "@type": "WebSite", name: "AIBC Media", url: SITE_ORIGIN },
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    mainEntity: allFaqItems().map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function collectionJsonLd(path: string, name: string, items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: `${SITE_ORIGIN}${path}`,
    name,
    description: AEO_SEO[path].description,
    isPartOf: { "@type": "WebSite", name: "AIBC Media", url: SITE_ORIGIN },
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url.startsWith("http") ? item.url : `${SITE_ORIGIN}${item.url}`,
      })),
    },
  };
}
