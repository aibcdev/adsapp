import { Link } from "react-router-dom";
import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";

export function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-12">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function BlogBackLink() {
  return (
    <Link to="/blog" className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-emerald-700">
      ← All posts
    </Link>
  );
}
