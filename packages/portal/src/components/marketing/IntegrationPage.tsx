import { Link } from "react-router-dom";
import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";
import { MarketingPageHero } from "./MarketingPageHero";
import { StepsSection } from "./StepsSection";
import { FaqSection } from "./FaqSection";

export type IntegrationConfig = {
  slug: string;
  toolName: string;
  headline: string;
  description: string;
  logoSrc?: string;
  whyTitle: string;
  whyPoints: string[];
  steps: { num: string; title: string; body: string }[];
  earnings: { label: string; amount: string; detail: string }[];
  faqs: { q: string; a: string }[];
};

export function IntegrationPage({ config }: { config: IntegrationConfig }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <MarketingPageHero
        eyebrow={`Integrations · ${config.toolName}`}
        title={config.headline}
        description={config.description}
        primaryCta="Install free"
        primaryHref="/#install"
      />

      <section className="border-b border-zinc-200 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:px-12">
          <div>
            {config.logoSrc ? (
              <img src={config.logoSrc} alt="" className="mb-6 h-12 w-12 object-contain" />
            ) : null}
            <h2 className="font-brand-heading text-3xl text-zinc-900">{config.whyTitle}</h2>
            <ul className="mt-6 space-y-3">
              {config.whyPoints.map((p) => (
                <li key={p} className="flex gap-3 text-sm text-zinc-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {config.earnings.map((tier) => (
              <div key={tier.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-center">
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{tier.label}</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">{tier.amount}</p>
                <p className="mt-1 text-xs text-zinc-500">{tier.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StepsSection
        title="How it works"
        subtitle="Start earning in minutes"
        steps={config.steps}
      />

      <FaqSection items={config.faqs} />

      <section className="py-16 text-center">
        <Link to="/#install" className="inline-flex rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-emerald-700">
          Install for {config.toolName}
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
