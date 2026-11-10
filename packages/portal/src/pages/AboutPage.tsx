import { DEVELOPER_SHARE_PCT } from "@aibc/shared";
import { AeoPage, RelatedLinks } from "../components/marketing/AeoLayout";
import { TextLink } from "../components/marketing/SiteLink";
import { AEO_SEO, aboutJsonLd } from "../lib/aeoContent";
import { EXTENSION_ID, OPEN_VSX_URL } from "../lib/installLinks";
import { SUPPORT_EMAIL } from "../lib/contact";

export function AboutPage() {
  const seo = AEO_SEO["/about"];
  return (
    <AeoPage
      eyebrow="Company"
      title="About AIBC Media"
      description={seo.description}
      jsonLd={aboutJsonLd()}
      primaryCta="Contact"
      primaryHref="/contact"
    >
      <article className="mx-auto max-w-3xl space-y-12 px-6 py-16 md:px-12">
        <section className="space-y-4 text-base leading-relaxed text-zinc-600">
          <h2 className="font-brand-heading text-3xl text-zinc-900">What this site is</h2>
          <p>
            AIBC Media runs aibcmedia.com. The product is a single sponsored line in the AI spinner inside VS Code,
            Cursor, Windsurf, and Claude Code. Developers install the extension <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800">{EXTENSION_ID}</code>.
            Advertisers buy that line. The line shows while the model is working and leaves when the response is back.
            It is not a popup and it is not a banner on a web page.
          </p>
          <p>
            The extension listing on Open VSX is{" "}
            <a href={OPEN_VSX_URL} className="font-semibold text-emerald-700 hover:underline">
              AIBCMedia/aibc
            </a>
            . VS Code and Cursor install the same extension from the Visual Studio Marketplace. Windsurf and VSCodium
            use the Open VSX listing.
          </p>
        </section>

        <section className="space-y-4 text-base leading-relaxed text-zinc-600">
          <h2 className="font-brand-heading text-3xl text-zinc-900">Two sides of the same line</h2>
          <p>
            <strong className="font-semibold text-zinc-900">Developers</strong> keep coding. When the AI wait state
            appears, a sponsor line can show in the spinner. The published share is up to {DEVELOPER_SHARE_PCT}% of ad
            spend. The pricing page says most developers earn 10–20%. Payouts start at $10. The{" "}
            <TextLink to="/developers/how-it-works">how it works</TextLink> page walks through install, the wait-state
            line, and the fact that the extension does not read source.{" "}
            <TextLink to="/developers/payouts">Payouts</TextLink> covers the $10 minimum and Stripe Connect.
          </p>
          <p>
            <strong className="font-semibold text-zinc-900">Advertisers</strong> pay for 1,000 placements at a time.
            The published minimum is $0.25 per 1,000 views. You set the price. A higher price puts the line ahead in
            the queue. It does not buy extra views. The minimum deposit is $5 via Stripe, and a line goes live about
            10 minutes after Stripe confirms payment. Details, the LAUNCH50 credit, and the refund rule are on{" "}
            <TextLink to="/pricing">pricing</TextLink>.
          </p>
          <p>
            <strong className="font-semibold text-zinc-900">Publishers</strong> who own an IDE, app, or platform can
            read the <TextLink to="/publishers">publisher page</TextLink>. It describes a one-line format with revenue
            shared back to users. The SDK on that page is listed as coming soon.
          </p>
        </section>

        <section className="space-y-4 text-base leading-relaxed text-zinc-600">
          <h2 className="font-brand-heading text-3xl text-zinc-900">What the product does not do</h2>
          <p>
            The privacy policy states the limit directly: AIBC never reads, stores, or transmits prompts, source code,
            or AI conversation content. Impression and click events are collected so earnings and fraud checks can
            work. Source code, prompts, and browsing history are listed as never collected. You can pause the extension
            or sign out.
          </p>
          <p>
            The same extension id, {EXTENSION_ID}, is what the migration guide tells developers to install after they
            leave Kickbacks. Comparison figures against Kickbacks, including the dates they were checked, are on the{" "}
            <TextLink to="/vs/kickbacks">Kickbacks comparison</TextLink>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-brand-heading text-3xl text-zinc-900">Where to go next</h2>
          <p className="text-base leading-relaxed text-zinc-600">
            The pages below are the long ones. The <TextLink to="/faq">FAQ</TextLink> compiles the questions those
            pages already answer. Email {SUPPORT_EMAIL}, or use the <TextLink to="/contact">contact form</TextLink>.
            The contact page says replies take 1–2 business days.
          </p>
          <RelatedLinks
            links={[
              { href: "/developers", label: "Developer hub", note: "Install, the spinner, the share, and payouts." },
              { href: "/guides", label: "Guides", note: "Advertising to developers, and moving from Kickbacks." },
              { href: "/vs", label: "Comparisons", note: "AIBC and Kickbacks on price, share, editors, and payouts." },
              { href: "/advertisers", label: "Advertise", note: "The advertiser overview and campaign checkout." },
              { href: "/privacy", label: "Privacy policy", note: "What is collected, and what is never touched." },
            ]}
          />
        </section>
      </article>
    </AeoPage>
  );
}
