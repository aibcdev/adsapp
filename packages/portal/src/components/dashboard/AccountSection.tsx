export function AccountSection({
  email,
  foundingMember,
}: {
  email: string;
  foundingMember?: boolean;
}) {
  return (
    <section className="aibc-card p-6">
      <h2 className="font-brand-heading text-xl text-zinc-900">Account</h2>
      <p className="mt-1 text-sm text-zinc-500">The identity tied to this dashboard and your extension.</p>
      {foundingMember ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
          Founding member · +5% earnings forever
        </div>
      ) : null}
      <dl className="mt-4">
        <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Email</dt>
        <dd className="mt-1 text-sm font-medium text-zinc-800">{email}</dd>
      </dl>
    </section>
  );
}
