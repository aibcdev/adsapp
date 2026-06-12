import { Link } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";

const MARKETPLACE =
  "https://marketplace.visualstudio.com/items?itemName=aibcdev.aibc";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-aibc-bg text-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="h-2 w-2 rounded-full bg-aibc-green" />
          aibc
        </div>
        <Link
          to="/dashboard"
          className="rounded-full bg-aibc-green px-4 py-2 text-sm font-semibold text-black"
        >
          Open dashboard
        </Link>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="max-w-2xl font-serif text-6xl leading-tight">
          Get paid while you code
        </h1>
        <p className="mt-6 max-w-xl text-lg text-neutral-400">
          aibc turns AI wait states into sponsored discovery — and shares revenue with developers.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            to="/dashboard"
            className="rounded-full bg-aibc-green px-6 py-3 font-semibold text-black"
          >
            Start earning
          </Link>
          <a
            href={MARKETPLACE}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-neutral-700 px-6 py-3"
          >
            Install extension
          </a>
        </div>
      </section>
      <section id="trust" className="border-t border-aibc-border py-16">
        <div className="mx-auto max-w-5xl px-6 text-neutral-400">
          Privacy-safe. No source code collection. Works in VS Code, Cursor, Windsurf, and VSCodium.
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
