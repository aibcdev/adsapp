import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminGate } from "../../components/admin/AdminGate";
import { adminFetch } from "../../lib/adminApi";

type UserDetail = {
  clientId: string;
  email: string | null;
  foundingMember: boolean;
  referralCode: string | null;
  earnings: { lifetime: number; payable: number; pending: number };
  payoutMethod: { rail: string; handle: string };
  impressions: { total: number; earned: number };
  lastActivityAt: string | null;
  payouts: Array<{ id: string; amount: number; status: string; createdAt: string }>;
  referrals: Array<{ clientId: string; email: string | null; qualified: boolean }>;
  limits: {
    maxRequestsPerDay: number;
    maxRequestsPerWeek: number;
    maxUsdPerDay: number;
  };
};

export function AdminUserDetailPage() {
  const { clientId = "" } = useParams();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [err, setErr] = useState("");

  return (
    <AdminGate>
      {(key) => (
        <UserDetailInner adminKey={key} clientId={clientId} detail={detail} setDetail={setDetail} err={err} setErr={setErr} />
      )}
    </AdminGate>
  );
}

function UserDetailInner({
  adminKey,
  clientId,
  detail,
  setDetail,
  err,
  setErr,
}: {
  adminKey: string;
  clientId: string;
  detail: UserDetail | null;
  setDetail: (d: UserDetail | null) => void;
  err: string;
  setErr: (e: string) => void;
}) {
  useEffect(() => {
    void adminFetch(`/v1/admin/users/${clientId}`, adminKey)
      .then(async (res) => {
        const body = (await res.json()) as UserDetail | { error?: string };
        if (!res.ok) throw new Error("error" in body ? body.error : "Failed");
        setDetail(body as UserDetail);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [adminKey, clientId]);

  if (err) return <p className="text-sm text-red-400">{err}</p>;
  if (!detail) return <p className="text-sm text-zinc-500">Loading…</p>;

  return (
    <div>
      <Link to="/admin/users" className="text-sm text-zinc-500 hover:text-zinc-300">
        ← Users
      </Link>
      <h2 className="mt-4 font-instrument-serif text-2xl text-white">{detail.email || detail.clientId}</h2>
      {detail.foundingMember ? (
        <span className="mt-2 inline-block rounded bg-amber-900/40 px-2 py-0.5 text-xs text-amber-300">
          Founding member (+5%)
        </span>
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="aibc-card p-4">
          <p className="text-xs text-zinc-500">Lifetime</p>
          <p className="text-xl text-emerald-400">${detail.earnings.lifetime.toFixed(2)}</p>
        </div>
        <div className="aibc-card p-4">
          <p className="text-xs text-zinc-500">Payable</p>
          <p className="text-xl">${detail.earnings.payable.toFixed(2)}</p>
        </div>
        <div className="aibc-card p-4">
          <p className="text-xs text-zinc-500">Impressions</p>
          <p className="text-xl">{detail.impressions.total}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        Payout: {detail.payoutMethod.rail || "—"} {detail.payoutMethod.handle || ""}
      </p>
      <p className="text-sm text-zinc-400">Referral code: {detail.referralCode || "—"}</p>
      <p className="text-sm text-zinc-400">
        Withdrawal limits: {detail.limits.maxRequestsPerDay}/day · {detail.limits.maxRequestsPerWeek}/week · $
        {detail.limits.maxUsdPerDay}/day max
      </p>
      <h3 className="mt-8 text-lg text-white">Payout history</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {detail.payouts.length === 0 ? <li className="text-zinc-500">None</li> : null}
        {detail.payouts.map((p) => (
          <li key={p.id} className="text-zinc-300">
            ${p.amount.toFixed(2)} · {p.status} · {new Date(p.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
      <h3 className="mt-8 text-lg text-white">Referrals</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {detail.referrals.length === 0 ? <li className="text-zinc-500">None</li> : null}
        {detail.referrals.map((r) => (
          <li key={r.clientId} className="text-zinc-300">
            {r.email || r.clientId.slice(0, 8)} · {r.qualified ? "qualified" : "pending"}
          </li>
        ))}
      </ul>
    </div>
  );
}
