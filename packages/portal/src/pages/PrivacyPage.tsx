import { Link } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-aibc-bg text-white">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-mono text-sm">
          ← aibc
        </Link>
      </header>
      <article className="mx-auto max-w-3xl px-6 pb-16 prose prose-invert prose-neutral">
        <h1 className="font-serif text-4xl">Privacy Policy</h1>
        <p className="text-neutral-400">Last updated: June 2026</p>

        <h2 className="font-serif text-2xl mt-8">What we collect</h2>
        <ul className="text-neutral-300 space-y-2">
          <li>Account email (via Google sign-in)</li>
          <li>Ad impressions and clicks (for earnings)</li>
          <li>Optional product analytics (PostHog) — tab views, card clicks</li>
        </ul>

        <h2 className="font-serif text-2xl mt-8">What we do not collect</h2>
        <ul className="text-neutral-300 space-y-2">
          <li>Your source code</li>
          <li>Editor file contents</li>
          <li>Clipboard data</li>
          <li>Terminal command history</li>
        </ul>

        <h2 className="font-serif text-2xl mt-8">Contact</h2>
        <p className="text-neutral-300">
          Questions: <a href="mailto:watchaibc@gmail.com">watchaibc@gmail.com</a>
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
