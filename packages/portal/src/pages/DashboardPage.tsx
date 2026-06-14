import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, getToken, setToken } from "../lib/api";
import { completeAuthFromState, googleRedirectUrl, startAuthSession } from "../lib/auth";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { StatCards } from "../components/dashboard/StatCards";
import { EarningsChart } from "../components/dashboard/EarningsChart";
import { PayoutsPanel } from "../components/dashboard/PayoutsPanel";
import { ActivityLedger } from "../components/dashboard/ActivityLedger";
import { AccountSection } from "../components/dashboard/AccountSection";
import { devSignInUrl, GoogleSignInCard } from "../components/auth/GoogleSignInCard";

type Earnings = {
  today: number;
  month: number;
  lifetime: number;
  pending: number;
  payable: number;
  caps: {
    hourlyEarned: number;
    dailyEarned: number;
    hourlyCap: number;
    dailyCap: number;
  };
};

type Activity = { id: string; type: string; adId: string; amount: number; createdAt: string };

export function DashboardPage() {
  const [params, setParams] = useSearchParams();
  const [email, setEmail] = useState<string>();
  const [authBusy, setAuthBusy] = useState(false);
  const [signInState, setSignInState] = useState("");
  const [earnings, setEarnings] = useState<Earnings>({
    today: 0,
    month: 0,
    lifetime: 0,
    pending: 0,
    payable: 0,
    caps: { hourlyEarned: 0, dailyEarned: 0, hourlyCap: 20, dailyCap: 200 },
  });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [activityLoaded, setActivityLoaded] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [payoutRail, setPayoutRail] = useState("");
  const [payoutHandle, setPayoutHandle] = useState("");
  const [authConfig, setAuthConfig] = useState({ google: true, devBypass: false });

  const loadEarnings = async () => {
    const e = await api<Earnings>("/v1/me/earnings");
    setEarnings({
      ...e,
      caps: e.caps ?? { hourlyEarned: 0, dailyEarned: 0, hourlyCap: 20, dailyCap: 200 },
    });
  };

  const loadPayoutMethod = async () => {
    const m = await api<{ rail: string; handle: string }>("/v1/me/payout-method");
    setPayoutRail(m.rail || "");
    setPayoutHandle(m.handle || "");
  };

  const loadProfile = async () => {
    const me = await api<{ email: string }>("/v1/me");
    setEmail(me.email);
  };

  const loadAll = async () => {
    if (!getToken()) return;
    await Promise.all([loadEarnings(), loadPayoutMethod(), loadProfile()]);
  };

  const retrieveActivity = async () => {
    setActivityLoading(true);
    try {
      const a = await api<Activity[]>("/v1/me/activity");
      setActivity(a);
      setActivityLoaded(true);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    const authState = params.get("auth_state");
    if (!authState) {
      if (getToken()) void loadAll();
      return;
    }
    setAuthBusy(true);
    void completeAuthFromState(authState)
      .then(({ accessToken, email: e }) => {
        setToken(accessToken);
        setEmail(e);
        params.delete("auth_state");
        setParams(params, { replace: true });
        return loadAll();
      })
      .catch(() => {})
      .finally(() => setAuthBusy(false));
  }, []);

  useEffect(() => {
    void fetch(`${import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com"}/v1/auth/config`)
      .then((r) => r.json())
      .then((c) => setAuthConfig({ google: Boolean(c.google), devBypass: Boolean(c.devBypass) }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    void startAuthSession().then(setSignInState).catch(() => {});
  }, []);

  const signInGoogle = async () => {
    setAuthBusy(true);
    try {
      const state = signInState || (await startAuthSession());
      setSignInState(state);
      window.location.href = googleRedirectUrl(state);
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = () => {
    setToken("");
    setEmail(undefined);
    setActivity([]);
    setActivityLoaded(false);
  };

  if (!getToken()) {
    return (
      <DashboardLayout email={undefined} onSignOut={signOut}>
        <div className="mx-auto flex max-w-md justify-center py-12">
          <GoogleSignInCard
            compact
            busy={authBusy}
            devBypass={authConfig.devBypass}
            state={signInState}
            onGoogleSignIn={() => void signInGoogle()}
            onDevSignIn={() => {
              if (!signInState) return;
              window.location.href = devSignInUrl(signInState);
            }}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout email={email} onSignOut={signOut}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-700">User earnings portal</p>
          <h1 className="mt-1 font-brand-heading text-2xl text-zinc-950 md:text-3xl">Your balance & activity</h1>
        </div>
        <Link
          to="/advertisers#launch"
          className="text-sm font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
        >
          Advertise on AIBC →
        </Link>
      </div>

      <StatCards
        today={earnings.today}
        month={earnings.month}
        lifetime={earnings.lifetime}
        caps={earnings.caps}
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <EarningsChart activity={activity} />
        </div>
        <div className="lg:col-span-2">
          <PayoutsPanel
            payable={earnings.payable}
            rail={payoutRail}
            handle={payoutHandle}
            onSaveMethod={(rail, handle) =>
              api("/v1/me/payout-method", { method: "POST", body: JSON.stringify({ rail, handle }) }).then(
                loadPayoutMethod,
              )
            }
            onRequestPayout={() => api("/v1/me/payout-request", { method: "POST" }).then(() => loadEarnings())}
          />
        </div>
      </div>

      <div className="mb-6">
        <ActivityLedger
          rows={activity}
          loaded={activityLoaded}
          loading={activityLoading}
          onRetrieve={() => void retrieveActivity()}
        />
      </div>

      {email ? <AccountSection email={email} /> : null}
    </DashboardLayout>
  );
}
