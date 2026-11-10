import type { ReactNode } from "react";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "../SiteHeader";
import { MarketingPageHero } from "./MarketingPageHero";
import { TextLink } from "./SiteLink";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function AeoPage({
  eyebrow,
  title,
  description,
  jsonLd,
  primaryCta,
  primaryHref,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  jsonLd: unknown;
  primaryCta?: string;
  primaryHref?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <main>
        <MarketingPageHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          primaryCta={primaryCta}
          primaryHref={primaryHref}
        />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function HubSection({
  eyebrow,
  title,
  href,
  cta,
  children,
}: {
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700">{eyebrow}</p>
      <h2 className="mt-2 font-brand-heading text-3xl text-zinc-900">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-zinc-600">{children}</div>
      <p className="mt-6">
        <TextLink to={href}>{cta}</TextLink>
      </p>
    </section>
  );
}

export function RelatedLinks({ links }: { links: { href: string; label: string; note: string }[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {links.map((link) => (
        <li key={link.href} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <TextLink to={link.href}>{link.label}</TextLink>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600">{link.note}</p>
        </li>
      ))}
    </ul>
  );
}
