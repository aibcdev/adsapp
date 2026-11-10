import { AeoPage, HubSection, RelatedLinks } from "../components/marketing/AeoLayout";
import { AEO_SEO, collectionJsonLd } from "../lib/aeoContent";

const GUIDE_ITEMS = [
  { name: "How to advertise to developers", url: "/guides/advertise-to-developers" },
  { name: "Move from Kickbacks to AIBC", url: "/guides/migrate-from-kickbacks" },
];

export function GuidesIndexPage() {
  const seo = AEO_SEO["/guides"];
  return (
    <AeoPage
      eyebrow="Guides"
      title="Guides for buying and switching spinner ads"
      description={seo.description}
      jsonLd={collectionJsonLd("/guides", "AIBC guides", GUIDE_ITEMS)}
      primaryCta="See pricing"
      primaryHref="/pricing"
    >
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-16 md:px-12">
        <section className="space-y-4 text-base leading-relaxed text-zinc-600">
          <h2 className="font-brand-heading text-3xl text-zinc-900">Why these two, and not another list</h2>
          <p>
            Developers ignore most display ads. The advertising guide splits the moments you can still reach them into
            three: while they discover tools, while they search, and while they wait on a model. The third one is the
            spinner. The migration guide is the practical version of that for people who already buy or earn from
            Kickbacks.
          </p>
          <p>
            Both guides are specific. They name prices, character limits, and the order of steps. The blog already
            contains a large set of keyword variants. These two pages are the ones to read if you want the working
            detail, and this index only introduces them.
          </p>
        </section>

        <HubSection
          eyebrow="For advertisers"
          title="How to advertise to developers"
          href="/guides/advertise-to-developers"
          cta="Read the advertising guide"
        >
          <p>
            The guide compares channels by the moment they reach a developer, and it only prints prices that have a
            public source. EthicalAds is cited at $3.10–$8.00 CPM with a $1,000 minimum buy. Carbon, daily.dev, Stack
            Overflow, Reddit, LinkedIn, and Google are listed as quote, sales, or auction. Spinner lines are the wait
            moment: AIBC from $0.25 per 1,000 views, and Kickbacks' public leaderboard at $0.74–$2.48 per 1,000 on
            28 Oct 2026.
          </p>
          <p>
            The writing advice is short because the format is short. AIBC's line limit is 60 characters. Say what the
            product is and one benefit, send the click to a page made for developers, and judge the test on effective
            CPM and signups. The four-week plan in the guide starts with $50 on AIBC, using LAUNCH50 (deposit $50, get
            $50 of ad credit after $50 of real deposits clear), next to one newsletter slot.
          </p>
        </HubSection>

        <HubSection
          eyebrow="Switching"
          title="Move from Kickbacks to AIBC"
          href="/guides/migrate-from-kickbacks"
          cta="Read the migration guide"
        >
          <p>
            Advertisers can redo the setup in about 10 minutes. Export impressions, clicks, and spend from Kickbacks
            so you have a baseline. Pause that campaign or let the block finish, and check Kickbacks' own balance and
            refund terms first. AIBC cannot do that step. Reuse the line: one text line of up to 60 characters and an
            optional icon (PNG, JPG, or WebP, up to 64 KB). Set a price from $0.25 per 1,000 views, deposit $5 or more
            through Stripe, and the line goes live about 10 minutes after payment. Compare after 7 days on effective
            CPM and click rate.
          </p>
          <p>
            Developers can switch in about 3 minutes, after cashing out. The guide cites Kickbacks' terms: the minimum
            payout is $10, and balances under $10 are forfeited when an account closes. Remove Kickbacks with
            “Kickbacks.ai: Restore Claude Code” in the command palette, then uninstall. Install AIBC with{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800">ext install AIBCMedia.aibc</code>{" "}
            or from Open VSX in Cursor or Windsurf, sign in, and add Stripe Connect, PayPal, Wise, or UPI. Reload the
            window so Claude Code picks up the line. Running both extensions is possible. AIBC does not delete the
            other extension's code, but both want the same spinner spot.
          </p>
        </HubSection>

        <section>
          <h2 className="font-brand-heading text-3xl text-zinc-900">Related pages</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            The guides assume you can open the product pages. These are the ones they point at.
          </p>
          <RelatedLinks
            links={[
              { href: "/advertisers/guide", label: "Advertiser guide", note: "The product walkthrough for buying a line." },
              { href: "/pricing", label: "Pricing", note: "Blocks, the $0.25 minimum, deposits, and LAUNCH50." },
              { href: "/kickbacks-alternative", label: "Kickbacks alternative", note: "The short page for people comparing the two products." },
              { href: "/vs/kickbacks", label: "AIBC vs Kickbacks", note: "The sourced table: price, share, editors, payouts." },
              { href: "/advertisers", label: "Advertise on AIBC", note: "Campaign checkout from the advertiser overview." },
              {
                href: "/blog/advertiser-faq-brand-safety-in-developer-tools/",
                label: "Brand-safety essay",
                note: "The longer advertiser FAQ on why the spinner slot is a controlled placement.",
              },
            ]}
          />
        </section>
      </div>
    </AeoPage>
  );
}
