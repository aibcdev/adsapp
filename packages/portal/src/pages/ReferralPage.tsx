import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { api, getToken } from "../lib/api";

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

export function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const loggedIn = Boolean(getToken());

  useEffect(() => {
    if (!loggedIn) return;
    void api<ReferralStats>("/v1/me/referral").then(setStats).catch(() => {});
  }, [loggedIn]);

  const copy = async () => {
    if (!stats?.referralLink) return;
    await navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-24 md:px-12">
        <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-700">Referral program</p>
        <h1 className="mt-3 font-brand-heading text-4xl text-zinc-900">Refer a developer — earn $10</h1>
        <p className="mt-4 text-lg text-zinc-600">
          Share your link. When they sign up and earn at least $10 lifetime, you get a $10 bonus on your first payout.
        </p>

        <ol className="mt-8 space-y-4 text-sm text-zinc-700">
          <li className="aibc-card p-4">
            <strong>1.</strong> Share your personal link with another developer.
          </li>
          <li className="aibc-card p-4">
            <strong>2.</strong> They install AIBC and sign in with your link.
          </li>
          <li className="aibc-card p-4">
            <strong>3.</strong> Once they earn ${stats?.qualifyUsd ?? 10}+, you qualify for ${stats?.referralBonusUsd ?? 10} on your first cash-out.
          </li>
        </ol>

        {loggedIn && stats?.referralLink ? (
          <div className="mt-10 aibc-card p-6">
            <p className="text-sm font-medium text-zinc-800">Your link</p>
            <p className="mt-2 break-all font-mono text-sm text-emerald-700">{stats.referralLink}</p>
            <button type="button" onClick={() => void copy()} className="aibc-btn-primary mt-4 px-4 py-2 text-sm">
              {copied ? "Copied!" : "Copy link"}
            </button>
            <p className="mt-4 text-xs text-zinc-500">
              {stats.referralsQualified} qualified · {stats.referralsTotal} total referrals
              {stats.referralBonusPending ? " · $10 bonus pending on first payout" : ""}
              {stats.referralBonusPaid ? " · Bonus paid" : ""}
            </p>
          </div>
        ) : (
          <div className="mt-10 aibc-card p-6 text-center">
            <p className="text-sm text-zinc-600">Sign in to get your personal referral link.</p>
            <Link to="/login" className="aibc-btn-primary mt-4 inline-block px-6 py-2.5 text-sm">
              Sign in
            </Link>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
