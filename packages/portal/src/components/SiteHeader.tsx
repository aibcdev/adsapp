import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Terminal, Target, Radio } from "lucide-react";
import { AibcLogo } from "./brand/AibcLogo";
import { getAudienceCta } from "./AudienceSwitcher";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const cta = getAudienceCta(location.pathname);
  const isDevelopers = location.pathname === "/" || location.pathname.startsWith("/waitlist");
  const isAdvertisers = location.pathname.startsWith("/advertisers");
  const isPublishers = location.pathname.startsWith("/publishers");

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-6 py-5 text-zinc-900 backdrop-blur-md md:px-12 md:py-6">
      <Link to="/" onClick={closeMobile} className="shrink-0 transition-transform active:scale-95">
        <AibcLogo size="sm" variant="light" />
      </Link>

      <div className="hidden items-center gap-2 md:flex md:gap-4">
        <div className="flex rounded-full border border-zinc-200 bg-white p-1.5 text-xs">
          <Link
            to="/"
            onClick={closeMobile}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 font-mono leading-none transition-all duration-300 lg:px-4 ${
              isDevelopers ? "bg-white font-semibold text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>For Developers</span>
          </Link>
          <Link
            to="/advertisers"
            onClick={closeMobile}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 font-mono leading-none transition-all duration-300 lg:px-4 ${
              isAdvertisers ? "bg-white font-semibold text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>For Advertisers</span>
          </Link>
          <Link
            to="/publishers"
            onClick={closeMobile}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 font-mono leading-none transition-all duration-300 lg:px-4 ${
              isPublishers ? "bg-white font-semibold text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>For Publishers</span>
          </Link>
        </div>
      </div>

      <div className="hidden items-center gap-6 md:flex">
        <Link to="/dashboard" className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900">
          Dashboard
        </Link>
        <Link to="/login" className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900">
          User login
        </Link>
        <a href={cta.href} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
          {cta.label}
        </a>
      </div>

      <button
        type="button"
        className="text-zinc-900 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen ? (
        <div className="absolute left-0 right-0 top-full flex flex-col gap-4 border-b border-zinc-200 bg-white p-6 shadow-xl md:hidden">
          <Link
            to="/"
            onClick={closeMobile}
            className={`rounded-full px-4 py-2 font-mono text-sm ${isDevelopers ? "bg-emerald-50 text-zinc-900 font-semibold" : "text-zinc-500"}`}
          >
            For Developers
          </Link>
          <Link
            to="/advertisers"
            onClick={closeMobile}
            className={`rounded-full px-4 py-2 font-mono text-sm ${isAdvertisers ? "bg-emerald-50 text-zinc-900 font-semibold" : "text-zinc-500"}`}
          >
            For Advertisers
          </Link>
          <Link
            to="/publishers"
            onClick={closeMobile}
            className={`rounded-full px-4 py-2 font-mono text-sm ${isPublishers ? "bg-emerald-50 text-zinc-900 font-semibold" : "text-zinc-500"}`}
          >
            For Publishers
          </Link>
          <Link to="/dashboard" className="text-base text-zinc-700" onClick={closeMobile}>
            Dashboard
          </Link>
          <Link to="/login" className="text-base text-zinc-900" onClick={closeMobile}>
            User login
          </Link>
          <a
            href={cta.href}
            className="w-full rounded-full bg-emerald-600 py-3 text-center text-base font-semibold text-white"
            onClick={closeMobile}
          >
            {cta.label}
          </a>
        </div>
      ) : null}
    </nav>
  );
}
