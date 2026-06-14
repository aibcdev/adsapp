import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { MarketingPageHero } from "../components/marketing/MarketingPageHero";
import { StepsSection } from "../components/marketing/StepsSection";
import { FaqSection } from "../components/marketing/FaqSection";
import { DeveloperIdeDemo } from "../components/aibc/DeveloperIdeDemo";
import { Terminal, Code, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <MarketingPageHero
        eyebrow="For developers"
        title="Turn waiting into earning"
        description="Every time AI processes your request, you have idle time. AIBC fills that gap with relevant ads and shares 70% of revenue with you."
        primaryCta="Install free"
        primaryHref="/#install"
      />

      <StepsSection
        title="Three steps. Zero effort."
        subtitle="Simple, automatic, and passive"
        steps={[
          { num: "1", title: "AI processing", body: "Claude, Copilot, or Cursor processes your request.", icon: <Terminal className="h-5 w-5" /> },
          { num: "2", title: "Ad displayed", body: "A relevant dev-tool sponsor line appears in your spinner.", icon: <Code className="h-5 w-5" /> },
          { num: "3", title: "You earn", body: "70% of advertiser spend goes to your account.", icon: <Wallet className="h-5 w-5" /> },
        ]}
      />

      <StepsSection
        title="Start earning in 2 minutes"
        steps={[
          { num: "01", title: "Install the extension", body: "Add AIBC to VS Code, Cursor, or Windsurf. Under 30 seconds." },
          { num: "02", title: "Create your account", body: "Sign in with Google or email." },
          { num: "03", title: "Code with AI as usual", body: "Your workflow stays exactly the same." },
          { num: "04", title: "Ads appear during wait", body: "A small sponsor line shows while AI generates. Gone when it responds." },
          { num: "05", title: "Withdraw earnings", body: "$10 minimum payout via Stripe." },
        ]}
      />

      <section className="border-y border-zinc-200 bg-zinc-50/50 py-16">
        <div className="mx-auto max-w-4xl px-6 md:px-12">
          <h2 className="mb-8 text-center font-brand-heading text-3xl text-zinc-900">See it live</h2>
          <DeveloperIdeDemo />
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <h2 className="font-brand-heading text-3xl text-zinc-900">Your code stays yours</h2>
          <ul className="mt-8 space-y-4 text-left text-sm text-zinc-600">
            <li className="rounded-xl border border-zinc-200 bg-white p-4"><strong className="text-zinc-900">No code reading</strong> — we never read, store, or transmit your source.</li>
            <li className="rounded-xl border border-zinc-200 bg-white p-4"><strong className="text-zinc-900">Non-intrusive</strong> — ads only during AI wait states.</li>
            <li className="rounded-xl border border-zinc-200 bg-white p-4"><strong className="text-zinc-900">Full control</strong> — pause or sign out anytime.</li>
          </ul>
          <Link to="/privacy" className="mt-6 inline-block text-sm font-semibold text-emerald-700 hover:underline">Read privacy policy</Link>
        </div>
      </section>

      <FaqSection
        items={[
          { q: "Will this slow down my IDE?", a: "No. Ads load asynchronously during wait states only." },
          { q: "What kind of ads will I see?", a: "Developer tools, infra, and SaaS products — never random consumer ads." },
          { q: "How do I get paid?", a: "Request a payout from your dashboard once you hit $10." },
          { q: "Which editors work?", a: "VS Code, Cursor, Windsurf, and other marketplace-compatible editors." },
        ]}
      />

      <SiteFooter />
    </div>
  );
}
