import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { MarketingPageHero } from "../components/marketing/MarketingPageHero";
import { StepsSection } from "../components/marketing/StepsSection";
import { FaqSection } from "../components/marketing/FaqSection";
import { Wallet, Building2 } from "lucide-react";
import { marketingCopy } from "../lib/marketingCopy";

export function PayoutsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <MarketingPageHero
        eyebrow="Developers · Payouts"
        title="Your money, your way"
        description={`Withdraw via Stripe Connect (auto) or manual rails. No fees on our side. ${marketingCopy.q2Developers}`}
        primaryCta="Open dashboard"
        primaryHref="/dashboard?tab=developer"
        stats={[
          { label: "Minimum payout", value: "$10" },
          { label: "Fees", value: "Free" },
          { label: "Processing", value: "1–5 days" },
          { label: "Request", value: "Anytime" },
        ]}
      />

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 md:px-12">
          <h2 className="mb-8 text-center font-brand-heading text-3xl text-zinc-900">Payment methods</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-zinc-900">Stripe</h3>
              <p className="mt-2 text-sm text-zinc-600">Bank transfer via Stripe Connect. 1–5 business days.</p>
              <span className="mt-3 inline-block rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Available</span>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 opacity-75">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200 text-zinc-500">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-zinc-900">PayPal</h3>
              <p className="mt-2 text-sm text-zinc-600">Coming soon.</p>
              <span className="mt-3 inline-block rounded-full bg-zinc-300 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-600">Soon</span>
            </div>
          </div>
        </div>
      </section>

      <StepsSection
        title="How payouts work"
        subtitle="Simple 3-step process"
        steps={[
          { num: "01", title: "Reach $10 minimum", body: "Earnings accumulate automatically in your dashboard." },
          { num: "02", title: "Request a payout", body: "Add your Stripe details and click Request Payout." },
          { num: "03", title: "Get paid", body: "We process within 1–5 business days." },
        ]}
      />

      <section className="border-t border-zinc-200 bg-zinc-50/50 py-16">
        <div className="mx-auto max-w-md px-6 md:px-12">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Dashboard preview</p>
            <p className="mt-4 text-sm text-zinc-600">Available balance</p>
            <p className="font-brand-heading text-4xl text-emerald-700">$127.45</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-zinc-500">Total earned</span><p className="font-semibold">$427.80</p></div>
              <div><span className="text-zinc-500">Paid out</span><p className="font-semibold">$300.00</p></div>
            </div>
            <Link to="/dashboard?tab=developer" className="mt-6 block w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700">
              Open dashboard
            </Link>
          </div>
        </div>
      </section>

      <FaqSection
        items={[
          { q: "What is the minimum payout?", a: "$10 USD." },
          { q: "Are there fees?", a: "AIBC does not charge withdrawal fees. Stripe may apply standard processing." },
          { q: "How often can I request?", a: "Up to 1 request per day, 3 per week (limits shown in dashboard)." },
        ]}
      />

      <SiteFooter />
    </div>
  );
}
