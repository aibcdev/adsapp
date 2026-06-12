import { Link } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-aibc-bg text-white">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-mono text-sm">
          ← aibc
        </Link>
      </header>
      <article className="mx-auto max-w-3xl px-6 pb-16">
        <h1 className="font-serif text-4xl">Terms of Service</h1>
        <p className="text-neutral-400 mt-2">Last updated: June 2026</p>

        <section className="mt-8 space-y-4 text-neutral-300">
          <p>
            aibc shows sponsored developer tools during AI wait states. Developers earn a
            revenue share. Advertisers prepay for inventory.
          </p>
          <h2 className="font-serif text-2xl text-white">Earners</h2>
          <p>
            Payouts require a minimum balance of $5.00. We may verify traffic quality.
            Invalid or fraudulent impressions are not paid.
          </p>
          <h2 className="font-serif text-2xl text-white">Advertisers</h2>
          <p>
            Campaigns must link to legitimate developer products. We may pause campaigns
            that violate policy. Prepaid balance is non-refundable except where required by law.
          </p>
          <h2 className="font-serif text-2xl text-white">Contact</h2>
          <p>
            <a href="mailto:watchaibc@gmail.com" className="text-aibc-green">
              watchaibc@gmail.com
            </a>
          </p>
        </section>
      </article>
      <SiteFooter />
    </div>
  );
}
