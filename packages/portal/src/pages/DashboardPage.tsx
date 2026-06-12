import { useEffect, useState } from "react";
import { api, getToken, setToken, signIn, startDeposit } from "../lib/api";
import { DashboardShell, SetupPanel, StatGrid } from "../components/DashboardShell";

type Earnings = { today: number; month: number; pending: number; payable: number };
type Activity = { id: string; type: string; adId: string; amount: number; createdAt: string };
type Campaign = {
  id: string;
  adLine: string;
  destinationUrl: string;
  status: string;
  impressions: number;
  spend: number;
};

export function DashboardPage() {
  const [tab, setTab] = useState<"earn" | "advertise">("earn");
  const [email, setEmail] = useState<string>();
  const [earnings, setEarnings] = useState<Earnings>({ today: 0, month: 0, pending: 0, payable: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [balance, setBalance] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rail, setRail] = useState("wise");
  const [handle, setHandle] = useState("");
  const [deposit, setDeposit] = useState("50");
  const [form, setForm] = useState({
    adLine: "",
    destinationUrl: "https://",
    brandName: "",
    bidPer1k: "5",
    blocks: "10",
    showOnLeaderboard: true,
  });

  const load = async () => {
    if (!getToken()) return;
    const e = await api<Earnings>("/v1/me/earnings");
    setEarnings(e);
    const a = await api<Activity[]>("/v1/me/activity");
    setActivity(a);
    const b = await api<{ balance: number }>("/v1/advertiser/balance");
    setBalance(b.balance);
    const c = await api<Campaign[]>("/v1/advertiser/campaigns");
    setCampaigns(c);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("deposit") === "success") {
      void load();
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [tab]);

  const handleSignIn = async () => {
    const e = await signIn();
    setEmail(e);
    await load();
  };

  const signOut = () => {
    setToken("");
    setEmail(undefined);
  };

  return (
    <DashboardShell email={email} tab={tab} onTab={setTab}>
      {!getToken() ? (
        <div className="rounded-xl border border-aibc-border bg-aibc-card p-8 text-center">
          <p className="mb-4 text-neutral-400">Sign in to view earnings and campaigns.</p>
          <button
            type="button"
            onClick={() => void handleSignIn()}
            className="rounded-full bg-aibc-green px-6 py-2 font-semibold text-black"
          >
            Sign in
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-right">
            <button type="button" onClick={signOut} className="text-xs text-neutral-500">
              Sign out
            </button>
          </div>

          {tab === "earn" ? (
            <>
              <SetupPanel />
              <StatGrid stats={earnings} />
              <div className="mb-8 rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-sm text-amber-200/80">
                Payouts are manual. Minimum $5.00. PayPal, Wise, and UPI supported.
              </div>

              <section className="mb-8 rounded-xl border border-aibc-border bg-aibc-card p-6">
                <h2 className="mb-4 font-serif text-2xl">Cash out</h2>
                <p className="mb-4 font-serif text-4xl text-aibc-gold">${earnings.payable.toFixed(2)}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-xs text-neutral-500">
                    Rail
                    <select
                      value={rail}
                      onChange={(e) => setRail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-aibc-border bg-black px-3 py-2"
                    >
                      <option value="wise">wise</option>
                      <option value="paypal">paypal</option>
                      <option value="upi">upi</option>
                    </select>
                  </label>
                  <label className="block text-xs text-neutral-500">
                    Account / handle
                    <input
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="email"
                      className="mt-1 w-full rounded-lg border border-aibc-border bg-black px-3 py-2"
                    />
                  </label>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      void api("/v1/me/payout-method", {
                        method: "POST",
                        body: JSON.stringify({ rail, handle }),
                      })
                    }
                    className="rounded-full border border-neutral-600 px-4 py-2 text-sm"
                  >
                    Save method
                  </button>
                  <button
                    type="button"
                    onClick={() => void api("/v1/me/payout-request", { method: "POST" }).then(load)}
                    className="rounded-full bg-aibc-green px-4 py-2 text-sm font-semibold text-black"
                  >
                    Request payout
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-aibc-border bg-aibc-card p-6">
                <h2 className="mb-4 font-serif text-2xl">Activity</h2>
                {activity.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No credited events yet. Keep coding with the extension installed.
                  </p>
                ) : (
                  <ul className="space-y-2 font-mono text-xs">
                    {activity.map((a) => (
                      <li key={a.id} className="flex justify-between border-b border-aibc-border py-2">
                        <span>{a.type} · {a.adId}</span>
                        <span className="text-aibc-gold">+${a.amount.toFixed(4)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : (
            <>
              <div className="mb-8 grid gap-6 md:grid-cols-2">
                <section className="rounded-xl border border-aibc-border bg-aibc-card p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    Prepaid balance
                  </p>
                  <p className="mt-2 font-serif text-4xl text-aibc-gold">${balance.toFixed(2)}</p>
                  <div className="mt-4 flex gap-2">
                    <input
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-24 rounded-lg border border-aibc-border bg-black px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => void startDeposit(Number(deposit)).then(load)}
                      className="rounded-full bg-aibc-green px-4 py-2 text-sm font-semibold text-black"
                    >
                      Add funds
                    </button>
                  </div>
                </section>

                <section className="rounded-xl border border-aibc-border bg-aibc-card p-6">
                  <h2 className="mb-4 font-serif text-2xl">Place a campaign</h2>
                  <div className="space-y-3">
                    <input
                      placeholder="Ad line (3-60 chars)"
                      value={form.adLine}
                      onChange={(e) => setForm({ ...form, adLine: e.target.value })}
                      className="w-full rounded-lg border border-aibc-border bg-black px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Destination URL (https)"
                      value={form.destinationUrl}
                      onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
                      className="w-full rounded-lg border border-aibc-border bg-black px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-neutral-500">
                      Runs in Claude Code / Codex spinners and terminal status lines.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        placeholder="Brand (optional)"
                        value={form.brandName}
                        onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                        className="rounded-lg border border-aibc-border bg-black px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="Bid / 1k imps"
                        value={form.bidPer1k}
                        onChange={(e) => setForm({ ...form, bidPer1k: e.target.value })}
                        className="rounded-lg border border-aibc-border bg-black px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="Blocks"
                        value={form.blocks}
                        onChange={(e) => setForm({ ...form, blocks: e.target.value })}
                        className="rounded-lg border border-aibc-border bg-black px-3 py-2 text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-neutral-400">
                      <input
                        type="checkbox"
                        checked={form.showOnLeaderboard}
                        onChange={(e) => setForm({ ...form, showOnLeaderboard: e.target.checked })}
                      />
                      Show on public leaderboard
                    </label>
                    <p className="text-xs text-neutral-500">
                      Floor $2.00 · est. max spend $
                      {((Number(form.bidPer1k) * Number(form.blocks) * 1000) / 1000).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        void api("/v1/advertiser/campaigns", {
                          method: "POST",
                          body: JSON.stringify({
                            adLine: form.adLine,
                            destinationUrl: form.destinationUrl,
                            brandName: form.brandName,
                            bidPer1k: Number(form.bidPer1k),
                            blocks: Number(form.blocks),
                            showOnLeaderboard: form.showOnLeaderboard,
                          }),
                        }).then(load)
                      }
                      className="float-right rounded-full bg-aibc-green px-5 py-2 text-sm font-semibold text-black"
                    >
                      Go live
                    </button>
                  </div>
                </section>
              </div>

              <section className="rounded-xl border border-aibc-border bg-aibc-card p-6">
                <h2 className="mb-4 font-serif text-2xl">Campaigns</h2>
                {campaigns.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No campaigns yet. Place one above to enter the auction.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {campaigns.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between rounded-lg border border-aibc-border px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{c.adLine}</p>
                          <p className="text-xs text-neutral-500">{c.destinationUrl}</p>
                        </div>
                        <div className="text-right text-xs text-neutral-400">
                          <p>{c.impressions} imps</p>
                          <p>${c.spend.toFixed(2)} spend</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <p className="mt-6 text-xs text-neutral-600">
                Validated = visible long enough to count. Filtered = blocked or invalid traffic.
              </p>
            </>
          )}
        </>
      )}
    </DashboardShell>
  );
}
