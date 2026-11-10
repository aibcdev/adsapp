import { AeoPage } from "../components/marketing/AeoLayout";
import { FaqSection } from "../components/marketing/FaqSection";
import { TextLink } from "../components/marketing/SiteLink";
import { AEO_SEO, FAQ_GROUPS, faqJsonLd } from "../lib/aeoContent";

export function FaqPage() {
  const seo = AEO_SEO["/faq"];
  return (
    <AeoPage
      eyebrow="FAQ"
      title="Questions the site already answers"
      description={seo.description}
      jsonLd={faqJsonLd()}
      primaryCta="Contact"
      primaryHref="/contact"
    >
      <div className="mx-auto max-w-3xl px-6 pt-12 md:px-12">
        <p className="text-base leading-relaxed text-zinc-600">
          This page collects answers from the pricing page, the developer how-it-works and payouts pages, the
          advertisers page, the privacy policy, and the Kickbacks comparison. It does not add a second set of numbers.
          If a figure changes, those pages are the source. Jump to{" "}
          <a href="#spinner" className="font-semibold text-emerald-700 hover:underline">
            spinner ads
          </a>
          ,{" "}
          <a href="#advertisers" className="font-semibold text-emerald-700 hover:underline">
            pricing
          </a>
          ,{" "}
          <a href="#developers" className="font-semibold text-emerald-700 hover:underline">
            developers
          </a>
          , or{" "}
          <a href="#safety" className="font-semibold text-emerald-700 hover:underline">
            privacy
          </a>
          . The longer brand-safety essay is the{" "}
          <TextLink to="/blog/advertiser-faq-brand-safety-in-developer-tools/">advertiser FAQ post</TextLink>.
        </p>
      </div>
      {FAQ_GROUPS.map((group) => (
        <FaqSection key={group.id} id={group.id} alwaysOpen title={group.title} intro={group.intro} items={group.items} />
      ))}
    </AeoPage>
  );
}
