import { AeoPage, HubSection, RelatedLinks } from "../components/marketing/AeoLayout";
import { AEO_SEO, collectionJsonLd } from "../lib/aeoContent";

const VS_ITEMS = [
  { name: "AIBC vs Kickbacks", url: "/vs/kickbacks" },
  { name: "Kickbacks alternative", url: "/kickbacks-alternative" },
];

export function VsIndexPage() {
  const seo = AEO_SEO["/vs"];
  return (
    <AeoPage
      eyebrow="Comparisons"
      title="Spinner ads, compared with a source on each row"
      description={seo.description}
      jsonLd={collectionJsonLd("/vs", "AIBC comparisons", VS_ITEMS)}
      primaryCta="Open the Kickbacks comparison"
      primaryHref="/vs/kickbacks"
    >
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-16 md:px-12">
        <section className="space-y-4 text-base leading-relaxed text-zinc-600">
          <h2 className="font-brand-heading text-3xl text-zinc-900">Same slot, different published terms</h2>
          <p>
            AIBC and Kickbacks.ai both put one sponsored line in the thinking state of an AI coding tool. The
            comparison that matters is the one with a date and a source, not a slogan. The full table lives on the
            Kickbacks page. It was last checked on 28 Oct 2026. This page is the map of that table, plus the other
            page people land on when they search for an alternative.
          </p>
          <p>
            Kickbacks is the category's first mover. It publishes a paid-out counter, and it supports the OpenAI Codex
            VS Code extension. AIBC does not publish a paid-out counter yet. Pick from the rows below rather than from
            a single winner line.
          </p>
        </section>

        <HubSection
          eyebrow="Full table"
          title="AIBC vs Kickbacks.ai"
          href="/vs/kickbacks"
          cta="Read the sourced comparison"
        >
          <p>The rows below are the ones on that page. Kickbacks cells cite Kickbacks, not AIBC's own measurement.</p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="p-3 font-medium"> </th>
                  <th className="p-3 font-medium">AIBC</th>
                  <th className="p-3 font-medium">Kickbacks, as cited</th>
                </tr>
              </thead>
              <tbody className="text-zinc-700">
                <tr className="border-t border-zinc-200">
                  <th className="p-3 font-medium text-zinc-900">Minimum per 1,000 views</th>
                  <td className="p-3">$0.25, published</td>
                  <td className="p-3">Not published. Reviews report $0.50 (go-to-agency.com, 17 Oct 2026) or $1.00</td>
                </tr>
                <tr className="border-t border-zinc-200">
                  <th className="p-3 font-medium text-zinc-900">Market price on 28 Oct 2026</th>
                  <td className="p-3">Your bid, from $0.25</td>
                  <td className="p-3">$2.48 in the editor, $0.74 in the terminal (public leaderboard)</td>
                </tr>
                <tr className="border-t border-zinc-200">
                  <th className="p-3 font-medium text-zinc-900">Developer share</th>
                  <td className="p-3">Up to 60% of ad spend. Most developers earn 10–20%</td>
                  <td className="p-3">Terms v1.4: estimated at 50% of net ad revenue after expenses, not guaranteed</td>
                </tr>
                <tr className="border-t border-zinc-200">
                  <th className="p-3 font-medium text-zinc-900">Payouts</th>
                  <td className="p-3">Stripe Connect, or PayPal, Wise, and UPI. $10 minimum</td>
                  <td className="p-3">Stripe Connect only. $10 minimum. Balances under $10 are forfeited when an account closes</td>
                </tr>
                <tr className="border-t border-zinc-200">
                  <th className="p-3 font-medium text-zinc-900">Editors</th>
                  <td className="p-3">VS Code, Cursor, Windsurf on Open VSX, and Claude Code</td>
                  <td className="p-3">VS Code extension and CLI. Not on Open VSX</td>
                </tr>
                <tr className="border-t border-zinc-200">
                  <th className="p-3 font-medium text-zinc-900">Where the line runs</th>
                  <td className="p-3">Worldwide, with optional country targeting</td>
                  <td className="p-3">Private Mode only, meaning internal ads, for UK, EU, and Swiss users (terms §3.3)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            On Claude Code, the comparison page says AIBC adds a small script that floats the line over the “Thinking…”
            word, and that the script is removed on uninstall or with “Restore Claude Code”. It says Kickbacks modifies
            the Claude Code bundle, citing third-party security reviews. Kickbacks' public paid-out total on 28 Oct 2026
            was $98,128 to 2,904 developers. AIBC has not published an equivalent counter.
          </p>
          <p>
            The page's own recommendation is narrow. Choose AIBC for the lowest published entry price, for PayPal, Wise,
            or UPI, or for Cursor and Windsurf through Open VSX. Choose Kickbacks if you want the larger existing
            impression volume.
          </p>
        </HubSection>

        <section>
          <h2 className="font-brand-heading text-3xl text-zinc-900">If you are ready to act on it</h2>
          <RelatedLinks
            links={[
              { href: "/kickbacks-alternative", label: "Kickbacks alternative", note: "The shorter landing page for the same comparison." },
              { href: "/guides/migrate-from-kickbacks", label: "Migration guide", note: "Export, pause, recreate the line, or cash out and reinstall." },
              { href: "/pricing", label: "Pricing", note: "The $0.25 block price, deposits, and what a view means." },
              { href: "/faq", label: "FAQ", note: "The same facts as questions, including brand safety and privacy." },
            ]}
          />
        </section>
      </div>
    </AeoPage>
  );
}
