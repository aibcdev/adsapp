import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PlatformGrid } from "../components/PlatformGrid";
import { BrandHeading } from "../components/brand/BrandHeading";

export function PublishersPage() {
  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-zinc-200 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-12">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-600">For publishers</p>
          <BrandHeading as="h1" className="mt-4 text-4xl leading-tight text-zinc-900 md:text-5xl lg:text-6xl">
            Monetize your software audience
          </BrandHeading>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
            Plug native ad inventory into your IDE, app, or platform. Share revenue directly with users — without
            popups or code reading.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/#install" className="aibc-btn-primary px-8 py-3.5">
              Install the extension
            </Link>
            <Link to="/advertisers" className="aibc-btn-secondary px-8 py-3.5">
              I want to advertise
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <BrandHeading className="text-center text-3xl text-zinc-900">Built for platform owners</BrandHeading>
          <ul className="mt-10 space-y-4 text-zinc-600">
            {[
              "One-line native format — no workflow interruption",
              "Revenue share back to your users",
              "Works in VS Code, Cursor, Windsurf, OpenVSX",
              "Simple SDK — coming soon",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-emerald-600">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PlatformGrid title="Supported surfaces" />
      <SiteFooter />
    </div>
  );
}
