import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { AibcLogo } from "./brand/AibcLogo";

export function LegalLayout({
  title,
  badge,
  updated,
  children,
  nav,
}: {
  title: string;
  badge: string;
  updated: string;
  nav: { id: string; label: string }[];
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-32 md:px-12 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
        <aside className="mb-8 lg:sticky lg:top-28 lg:self-start">
          <AibcLogo size="sm" variant="light" />
          <p className="mb-2 mt-4 font-mono text-xs uppercase tracking-widest text-emerald-600">{badge}</p>
          <h1 className="font-brand-heading text-3xl text-zinc-900">{title}</h1>
          <p className="mt-2 text-sm text-zinc-500">Last updated: {updated}</p>
          <nav className="mt-8 hidden space-y-2 lg:block">
            <p className="font-mono text-xs uppercase text-zinc-400">On this page</p>
            {nav.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="block text-sm text-zinc-600 hover:text-emerald-700">
                {item.label}
              </a>
            ))}
          </nav>
          <Link to="/" className="mt-6 inline-block text-sm text-emerald-700 hover:underline">
            ← Back to home
          </Link>
        </aside>
        <article className="prose max-w-none prose-headings:font-brand-heading prose-a:text-emerald-700">
          {children}
        </article>
      </div>
      <SiteFooter />
    </div>
  );
}
