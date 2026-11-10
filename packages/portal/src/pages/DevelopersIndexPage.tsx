import { DEVELOPER_SHARE_PCT } from "@aibc/shared";
import { AeoPage, HubSection, RelatedLinks } from "../components/marketing/AeoLayout";
import { TextLink } from "../components/marketing/SiteLink";
import { AEO_SEO, collectionJsonLd } from "../lib/aeoContent";
import { EXTENSION_ID, OPEN_VSX_URL } from "../lib/installLinks";

const DEVELOPER_ITEMS = [
  { name: "Developer guide", url: "/developers/guide" },
  { name: "How it works", url: "/developers/how-it-works" },
  { name: "Payouts", url: "/developers/payouts" },
];

export function DevelopersIndexPage() {
  const seo = AEO_SEO["/developers"];
  return (
    <AeoPage
      eyebrow="Developers"
      title="Earn from the AI wait, without handing over your repo"
      description={seo.description}
      jsonLd={collectionJsonLd("/developers", "AIBC for developers", DEVELOPER_ITEMS)}
      primaryCta="Install free"
      primaryHref="/#install"
    >
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-16 md:px-12">
        <section className="space-y-4 text-base leading-relaxed text-zinc-600">
          <h2 className="font-brand-heading text-3xl text-zinc-900">What you actually install</h2>
          <p>
            AIBC is the extension <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800">{EXTENSION_ID}</code>.
            It shows one sponsor line in the spinner while Claude, Cursor, Copilot, or another supported agent is
            working. VS Code and Cursor install it from the Marketplace. Windsurf and VSCodium install it from{" "}
            <a href={OPEN_VSX_URL} className="font-semibold text-emerald-700 hover:underline">
              Open VSX
            </a>
            . Claude Code is supported as well. The homepage install buttons and the{" "}
            <TextLink to="/install">install page</TextLink> are the same extension.
          </p>
          <p>
            You sign in with Google or email. Earnings accumulate in the dashboard. The published share is up to{" "}
            {DEVELOPER_SHARE_PCT}% of ad spend, and the pricing page says most developers earn 10–20%. The privacy
            policy is the other half of the offer: prompts, source code, and AI conversations are never read, stored,
            or transmitted. You can pause or sign out.
          </p>
        </section>

        <HubSection
          eyebrow="Short version"
          title="Developer guide"
          href="/developers/guide"
          cta="Open the developer guide"
        >
          <p>
            The developer guide is the one-page version: install, the spinner line, up to {DEVELOPER_SHARE_PCT}% of ad
            spend, the note that most developers earn 10–20%, payouts, and privacy. It states the same limit as the
            privacy policy, in one line: the extension does not read source or prompts. Use it when you want the
            constraints before the walkthrough.
          </p>
        </HubSection>

        <HubSection
          eyebrow="Walkthrough"
          title="How it works"
          href="/developers/how-it-works"
          cta="Read how it works"
        >
          <p>
            The how-it-works page is the longer developer explanation. AI processing starts, a relevant sponsor line
            appears in the spinner, and {DEVELOPER_SHARE_PCT}% of advertiser spend is credited to the account. Install
            is described as under a minute in VS Code, Cursor, or Windsurf, followed by Google or email sign-in. The
            line shows only during the wait and is gone when the model responds. Withdrawal on that page starts at $10.
          </p>
          <p>
            It also answers the practical objections: ads load asynchronously during wait states, the ads are developer
            tools and infrastructure rather than random consumer ads, and the supported editors are VS Code, Cursor,
            Windsurf, and other marketplace-compatible editors. A demo of the line in the editor sits on that page.
          </p>
        </HubSection>

        <HubSection
          eyebrow="Cash out"
          title="Payouts"
          href="/developers/payouts"
          cta="Read payouts"
        >
          <p>
            The minimum is $10. Stripe Connect is the automatic bank transfer, processed in 1–5 business days, and the
            payouts page says AIBC does not charge a withdrawal fee. You reach $10, add Stripe details, request the
            payout, and it is processed in that window. Wise, PayPal, and UPI are the other methods named on the
            how-it-works page, the comparison page, and the privacy policy. The comparison page describes those three
            as manually reviewed. Check the payouts page for which method your account can use today.
          </p>
        </HubSection>

        <section className="space-y-4">
          <h2 className="font-brand-heading text-3xl text-zinc-900">By editor</h2>
          <p className="text-base leading-relaxed text-zinc-600">
            The integration pages repeat the same extension for each tool: one line in the spinner, no prompt or source
            access, and the same account across editors.
          </p>
          <RelatedLinks
            links={[
              { href: "/integrations/claude", label: "Claude Code", note: "The line hooks into the Claude Code spinner. Pro billing is unchanged." },
              { href: "/integrations/cursor", label: "Cursor", note: "Marketplace install. The line sits in the AI spinner, not over the file." },
              { href: "/integrations/vscode", label: "VS Code", note: "Marketplace install of AIBCMedia.aibc." },
              { href: "/integrations/windsurf", label: "Windsurf", note: "Open VSX install. The same extension id." },
              { href: "/faq", label: "FAQ", note: "Share, payouts, privacy, and the Kickbacks switch, in one list." },
              { href: "/guides/migrate-from-kickbacks", label: "Move from Kickbacks", note: "Cash out first, restore Claude Code, then install AIBC." },
              { href: "/referral", label: "Referrals", note: "The referral page pays $10 when a referral reaches $10 lifetime." },
            ]}
          />
        </section>
      </div>
    </AeoPage>
  );
}
