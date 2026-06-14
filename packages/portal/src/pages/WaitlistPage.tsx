import { useSearchParams } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WaitlistForm } from "../components/aibc/WaitlistForm";
import { getWaitlistCount } from "../lib/waitlist";

export function WaitlistPage() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || undefined;
  const joined = getWaitlistCount();

  return (
    <div className="app-shell">
      <SiteHeader />
      <section className="mx-auto max-w-lg px-6 py-32 md:px-12">
        <p className="font-mono text-xs uppercase tracking-widest text-emerald-600">Founding members</p>
        <h1 className="mt-4 font-brand-heading text-3xl text-zinc-900">Reserve your spot</h1>
        <p className="mt-3 text-sm text-zinc-600">{Math.max(0, 15_000 - joined).toLocaleString()} spots left.</p>
        <div className="mt-10">
          <WaitlistForm referredBy={ref} />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
