import { IdeMockup } from "../aibc/ProductMockup";

import { marketingCopy } from "../../lib/marketingCopy";

const TRUST_ITEMS = [
  "We never read your code",
  "One small line — never a popup",
  "You keep 70%",
  "Uninstall and everything goes back to normal",
  marketingCopy.q2Developers,
];

type TrustSectionProps = {
  onOpenDashboard: () => void;
};

export function TrustSection({ onOpenDashboard }: TrustSectionProps) {
  return (
    <section className="border-b border-zinc-900/50 bg-zinc-950 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-instrument-serif text-4xl tracking-tight text-white md:text-5xl">
              Simple &amp; private
            </h2>
            <ul className="mt-8 space-y-4 text-zinc-400">
              {TRUST_ITEMS.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-emerald-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button type="button" onClick={onOpenDashboard} className="aibc-btn-primary mt-10">
              Open dashboard
            </button>
          </div>
          <div className="space-y-4">
            <IdeMockup
              variant="vscode"
              title="VS Code · extension host"
              subtitle="// waiting for model response"
              sponsor={{ brand: "ramp", name: "Ramp", text: "corporate cards that save finance teams time →" }}
            />
            <IdeMockup
              variant="cursor"
              title="Cursor · agent panel"
              subtitle="// generating implementation plan"
              sponsor={{ brand: "linear", name: "Linear", text: "issue tracking built for speed →" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
