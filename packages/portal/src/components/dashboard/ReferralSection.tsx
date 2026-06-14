import { useState } from "react";

type ReferralStats = {
  referralCode: string;
  referralLink: string;
  referralsTotal: number;
  referralsQualified: number;
  referralBonusPaid: boolean;
  referralBonusPending: boolean;
  referralBonusUsd: number;
  qualifyUsd: number;
};

export function ReferralSection({ stats }: { stats: ReferralStats | null }) {
  const [copied, setCopied] = useState(false);
  if (!stats?.referralLink) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="aibc-card p-6">
      <h2 className="font-brand-heading text-xl text-zinc-900">Refer a developer</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Earn ${stats.referralBonusUsd} on your first payout when a referral earns ${stats.qualifyUsd}+.
      </p>
      <p className="mt-4 break-all font-mono text-xs text-emerald-700">{stats.referralLink}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>{stats.referralsQualified} qualified</span>
        <span>{stats.referralsTotal} invited</span>
        {stats.referralBonusPending ? <span className="text-amber-700">$10 bonus pending</span> : null}
        {stats.referralBonusPaid ? <span className="text-emerald-700">Bonus paid</span> : null}
      </div>
      <button type="button" onClick={() => void copy()} className="mt-4 text-sm font-medium text-emerald-700 underline">
        {copied ? "Copied!" : "Copy link"}
      </button>
    </section>
  );
}
