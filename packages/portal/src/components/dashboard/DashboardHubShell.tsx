import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AibcLogo } from "../brand/AibcLogo";

export type DashboardTab = "developer" | "advertiser" | "publisher";

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "developer", label: "Developers" },
  { id: "advertiser", label: "Advertisers" },
  { id: "publisher", label: "Publishers" },
];

export function DashboardHubShell({
  tab,
  onTab,
  email,
  onSignOut,
  loggedIn,
  loginHeadline,
  loginSub,
  loginCard,
  children,
}: {
  tab: DashboardTab;
  onTab: (t: DashboardTab) => void;
  email?: string;
  onSignOut: () => void;
  loggedIn: boolean;
  loginHeadline: string;
  loginSub: string;
  loginCard: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={tab === "developer" ? "dashboard-shell min-h-screen text-zinc-900" : "min-h-screen bg-zinc-100 text-zinc-900"}>
      <header className={`border-b px-6 py-4 md:px-10 ${tab === "developer" ? "border-zinc-200/80 bg-white/80 backdrop-blur" : "border-zinc-200 bg-white"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/">
            <AibcLogo size="sm" variant="light" />
          </Link>
          {loggedIn && email ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-zinc-500 sm:inline">{email}</span>
              <button type="button" onClick={onSignOut} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-zinc-600 hover:bg-zinc-50">
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 md:px-10">
        <div className="mb-8 flex flex-wrap gap-2 border-b border-zinc-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTab(t.id)}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === t.id ? "border-emerald-600 text-emerald-800" : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!loggedIn ? (
          <div className="mx-auto max-w-lg">
            <h1 className="font-brand-heading text-3xl text-zinc-950">{loginHeadline}</h1>
            <p className="mt-2 text-zinc-600">{loginSub}</p>
            <div className="mt-8">{loginCard}</div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

export function PartnerDashboardShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{eyebrow}</p>
      <h1 className="mt-1 font-brand-heading text-2xl text-zinc-950 md:text-3xl">{title}</h1>
      <div className="mt-8">{children}</div>
    </div>
  );
}
