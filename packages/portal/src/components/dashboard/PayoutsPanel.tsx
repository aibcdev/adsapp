import { useEffect, useState } from "react";

const MIN_PAYOUT = 10;

type PayoutLimits = {
  requestsToday: number;
  requestsThisWeek: number;
  usdToday: number;
  maxRequestsPerDay: number;
  maxRequestsPerWeek: number;
  maxUsdPerDay: number;
};

type ConnectStatus = {
  connected: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  stripeEnabled: boolean;
};

export function PayoutsPanel({
  payable,
  rail,
  handle,
  payoutLimits,
  onSaveMethod,
  onRequestPayout,
  onConnectStripe,
  onLoadConnectStatus,
}: {
  payable: number;
  rail: string;
  handle: string;
  payoutLimits?: PayoutLimits;
  onSaveMethod: (rail: string, handle: string) => Promise<void>;
  onRequestPayout: () => Promise<{ autoPaid?: boolean }>;
  onConnectStripe: () => Promise<string>;
  onLoadConnectStatus: () => Promise<ConnectStatus>;
}) {
  const [localRail, setLocalRail] = useState(rail || "stripe");
  const [localHandle, setLocalHandle] = useState(handle);
  const [connect, setConnect] = useState<ConnectStatus | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [setupOpen, setSetupOpen] = useState(!handle.trim() && rail !== "stripe");
  const toGo = Math.max(0, MIN_PAYOUT - payable);

  useEffect(() => {
    void onLoadConnectStatus()
      .then(setConnect)
      .catch(() => setConnect(null));
  }, [onLoadConnectStatus]);

  const stripeReady = Boolean(connect?.payoutsEnabled);
  const showManual = localRail !== "stripe";

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="aibc-card flex h-full flex-col p-6">
      <h2 className="font-brand-heading text-xl text-zinc-900">Payouts</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Stripe Connect pays out automatically. Or use Wise, PayPal, or UPI (manual review).
      </p>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
        <p className="font-medium text-zinc-800">Payable balance</p>
        <p className="mt-1 font-brand-heading text-3xl text-emerald-700">${payable.toFixed(2)}</p>

        {payable < MIN_PAYOUT ? (
          <p className="mt-2 text-xs text-zinc-500">${toGo.toFixed(2)} to go before you can cash out.</p>
        ) : (
          <p className="mt-2 text-xs text-emerald-700">You meet the ${MIN_PAYOUT} minimum — request a payout anytime.</p>
        )}

        {connect?.stripeEnabled !== false ? (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
            <p className="text-sm font-medium text-zinc-800">Stripe Connect</p>
            <p className="mt-1 text-xs text-zinc-500">
              {stripeReady
                ? "Connected — payouts go straight to your bank."
                : connect?.connected
                  ? "Finish setup to enable auto payouts."
                  : "Fastest path: connect once, cash out automatically."}
            </p>
            {!stripeReady ? (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const url = await onConnectStripe();
                    window.location.href = url;
                  })
                }
                className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {connect?.connected ? "Continue Stripe setup" : "Connect Stripe"}
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await onSaveMethod("stripe", "stripe_connect");
                    setMsg("Stripe set as default payout method.");
                    setSetupOpen(false);
                  })
                }
                className="mt-3 text-sm font-medium text-emerald-700 underline"
              >
                Use Stripe for payouts
              </button>
            )}
          </div>
        ) : null}

        {!setupOpen && (handle.trim() || rail === "stripe") ? (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600">
            {rail === "stripe" ? "STRIPE · auto transfer" : `${rail.toUpperCase()} · ${handle}`}
            <button
              type="button"
              onClick={() => setSetupOpen(true)}
              className="ml-2 text-emerald-700 underline hover:text-emerald-800"
            >
              Edit
            </button>
          </div>
        ) : setupOpen ? (
          <div className="mt-4 grid gap-3">
            <select
              value={localRail}
              onChange={(e) => setLocalRail(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              {connect?.stripeEnabled !== false ? <option value="stripe">Stripe (auto)</option> : null}
              <option value="wise">Wise</option>
              <option value="paypal">PayPal</option>
              <option value="upi">UPI</option>
            </select>
            {showManual ? (
              <input
                value={localHandle}
                onChange={(e) => setLocalHandle(e.target.value)}
                placeholder="Account email or handle"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2">
          {setupOpen ? (
            <button
              type="button"
              disabled={busy || (showManual && !localHandle.trim())}
              onClick={() =>
                void run(async () => {
                  if (localRail === "stripe") {
                    if (!stripeReady) {
                      const url = await onConnectStripe();
                      window.location.href = url;
                      return;
                    }
                    await onSaveMethod("stripe", "stripe_connect");
                  } else {
                    await onSaveMethod(localRail, localHandle.trim());
                  }
                  setMsg("Payout method saved.");
                  setSetupOpen(false);
                })
              }
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Save payout method
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy || payable < MIN_PAYOUT || (!stripeReady && !handle.trim())}
            onClick={() =>
              void run(async () => {
                const result = await onRequestPayout();
                setMsg(
                  result.autoPaid
                    ? "Paid via Stripe Connect."
                    : "Payout requested. We will review and send manually.",
                );
              })
            }
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Request payout
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        Manual rails are reviewed for fraud. Stripe Connect transfers are instant once approved.
      </p>
      {payoutLimits ? (
        <p className="mt-2 text-xs text-zinc-500">
          Withdrawal limits: {payoutLimits.requestsToday}/{payoutLimits.maxRequestsPerDay} today ·{" "}
          {payoutLimits.requestsThisWeek}/{payoutLimits.maxRequestsPerWeek} this week · $
          {payoutLimits.usdToday.toFixed(2)}/${payoutLimits.maxUsdPerDay} withdrawn today.
        </p>
      ) : null}

      {msg ? <p className="mt-3 text-sm text-emerald-700">{msg}</p> : null}
      {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
    </div>
  );
}
