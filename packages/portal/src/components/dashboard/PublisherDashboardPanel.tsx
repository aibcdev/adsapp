import { Link } from "react-router-dom";
import { PartnerDashboardShell } from "./DashboardHubShell";

export function PublisherDashboardPanel() {
  return (
    <PartnerDashboardShell eyebrow="Publisher portal" title="Inventory & revenue">
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        SDK integration is coming soon. Stats below are placeholders for preview.
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Est. monthly RPM", value: "$2.40" },
          { label: "Active placements", value: "—" },
          { label: "Fill rate", value: "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900">SDK status</h2>
          <p className="mt-2 text-sm text-zinc-600">Publisher SDK and dashboard API are in development.</p>
          <Link to="/publishers" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
            Learn about publishing →
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900">Get early access</h2>
          <p className="mt-2 text-sm text-zinc-600">Partner with us to monetize your developer audience.</p>
          <Link to="/contact" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
            Contact partnerships →
          </Link>
        </div>
      </div>
    </PartnerDashboardShell>
  );
}
