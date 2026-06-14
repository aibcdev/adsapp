export function AccountSection({ email }: { email: string }) {
  return (
    <section className="aibc-card p-6">
      <h2 className="font-brand-heading text-xl text-zinc-900">Account</h2>
      <p className="mt-1 text-sm text-zinc-500">The identity tied to this dashboard and your extension.</p>
      <dl className="mt-4">
        <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Email</dt>
        <dd className="mt-1 text-sm font-medium text-zinc-800">{email}</dd>
      </dl>
    </section>
  );
}
