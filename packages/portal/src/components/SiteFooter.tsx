import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Send, Check } from "lucide-react";
import { AibcLogo } from "./brand/AibcLogo";

export function SiteFooter() {
  const location = useLocation();
  const [time, setTime] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const isDevelopers = location.pathname === "/" || location.pathname.startsWith("/waitlist");
  const isAdvertisers = location.pathname.startsWith("/advertisers");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-zinc-200 bg-white pb-6 pt-20">
      <div className="mx-auto mb-12 grid max-w-[1800px] grid-cols-1 gap-12 border-b border-zinc-100 px-6 pb-16 md:px-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h3 className="mb-3 font-brand-heading text-3xl text-zinc-900 md:text-4xl">
            Capture the next <span className="text-emerald-600 italic font-normal">paradigm shift.</span>
          </h3>
          <p className="max-w-md text-sm font-light leading-relaxed text-zinc-600 md:text-base">
            Updates on developer payouts, live campaigns, and platform news from AIBC Media.
          </p>
          <div className="mt-6 flex gap-4 font-mono text-xs">
            <Link
              to="/"
              className={`border-b pb-1 ${isDevelopers ? "border-emerald-600 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}
            >
              For Developers
            </Link>
            <Link
              to="/advertisers"
              className={`border-b pb-1 ${isAdvertisers ? "border-emerald-600 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}
            >
              For Advertisers
            </Link>
            <Link to="/publishers" className="border-b border-transparent pb-1 text-zinc-500 hover:text-zinc-900">
              Publishers
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-center lg:col-span-6">
          {subscribed ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-3.5 w-3.5" />
              </div>
              <span className="font-mono font-medium">Subscribed (demo — no backend yet).</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to subscribe"
                required
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <span>Subscribe</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mx-auto mb-12 flex max-w-[1800px] flex-col items-center justify-between gap-6 px-6 md:flex-row md:px-12">
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-sm text-zinc-600">
          <span className="text-zinc-900">{time}</span>
          <span className="text-zinc-300">|</span>
          <span>UTC</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono text-sm font-medium uppercase tracking-wide text-zinc-500">
          <Link to="/privacy" className="transition-colors hover:text-zinc-900">
            Privacy
          </Link>
          <Link to="/terms" className="transition-colors hover:text-zinc-900">
            Terms
          </Link>
          <Link to="/dashboard" className="transition-colors hover:text-zinc-900">
            Dashboard
          </Link>
        </div>

        <AibcLogo size="sm" variant="light" />
      </div>

      <div className="relative w-full select-none overflow-hidden font-brand-heading text-zinc-200">
        <div className="marquee-container-text">
          <div className="flex items-center whitespace-nowrap">
            <span className="px-8 text-[12vw] leading-none">AIBC MEDIA © REGISTER TODAY —</span>
            <span className="px-8 text-[12vw] leading-none">AIBC MEDIA © REGISTER TODAY —</span>
          </div>
          <div className="flex items-center whitespace-nowrap" aria-hidden="true">
            <span className="px-8 text-[12vw] leading-none">AIBC MEDIA © REGISTER TODAY —</span>
            <span className="px-8 text-[12vw] leading-none">AIBC MEDIA © REGISTER TODAY —</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
