import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminGate } from "../../components/admin/AdminGate";
import { adminFetch } from "../../lib/adminApi";

type UserRow = {
  clientId: string;
  email: string | null;
  createdAt: string;
  lifetime: number;
  payable: number;
  foundingMember: boolean;
  referralCode: string | null;
  referralsTotal: number;
};

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<UserRow[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (key: string, q: string) => {
    setBusy(true);
    setErr("");
    try {
      const url = q.trim()
        ? `/v1/admin/users?search=${encodeURIComponent(q.trim())}&limit=100`
        : "/v1/admin/users?limit=100";
      const res = await adminFetch(url, key);
      const body = (await res.json()) as UserRow[] | { error?: string };
      if (!res.ok) throw new Error("error" in body ? body.error : "Failed");
      setRows(body as UserRow[]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminGate>
      {(key) => (
        <UsersInner
          adminKey={key}
          search={search}
          setSearch={setSearch}
          rows={rows}
          err={err}
          busy={busy}
          load={load}
        />
      )}
    </AdminGate>
  );
}

function UsersInner({
  adminKey,
  search,
  setSearch,
  rows,
  err,
  busy,
  load,
}: {
  adminKey: string;
  search: string;
  setSearch: (s: string) => void;
  rows: UserRow[];
  err: string;
  busy: boolean;
  load: (key: string, q: string) => Promise<void>;
}) {
  useEffect(() => {
    void load(adminKey, search);
  }, [adminKey]);

  return (
    <div>
      <h2 className="font-instrument-serif text-2xl text-white">Users</h2>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load(adminKey, search);
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search email, client ID, referral code"
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm"
        />
        <button type="submit" className="aibc-btn-primary px-4 py-2 text-sm">
          Search
        </button>
      </form>
      {err ? <p className="mt-4 text-sm text-red-400">{err}</p> : null}
      {busy ? <p className="mt-4 text-sm text-zinc-500">Loading…</p> : null}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr>
              <th className="pb-2">Email</th>
              <th className="pb-2">Lifetime</th>
              <th className="pb-2">Payable</th>
              <th className="pb-2">Referrals</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.clientId} className="border-t border-zinc-800">
                <td className="py-3">
                  {r.email || r.clientId.slice(0, 8)}
                  {r.foundingMember ? (
                    <span className="ml-2 rounded bg-amber-900/40 px-1.5 py-0.5 text-[10px] text-amber-300">
                      founding
                    </span>
                  ) : null}
                </td>
                <td className="py-3">${r.lifetime.toFixed(2)}</td>
                <td className="py-3">${r.payable.toFixed(2)}</td>
                <td className="py-3">{r.referralsTotal}</td>
                <td className="py-3 text-right">
                  <Link to={`/admin/users/${r.clientId}`} className="text-emerald-400 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
