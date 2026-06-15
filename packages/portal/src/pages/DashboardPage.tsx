import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, getToken, setToken } from "../lib/api";
import {
  completeAuthFromState,
  completeEmailSignIn,
  consumeLoginRedirect,
  devSignInUrl,
  ensureAuthSession,
  googleRedirectUrl,
  redeemDashboardHandoff,
} from "../lib/auth";
import { LoginAuthCard } from "../components/auth/LoginAuthCard";
import {
  DashboardHubShell,
  type DashboardTab,
} from "../components/dashboard/DashboardHubShell";
import { DeveloperDashboardPanel } from "../components/dashboard/DeveloperDashboardPanel";
import { AdvertiserDashboardPanel } from "../components/dashboard/AdvertiserDashboardPanel";
import { PublisherDashboardPanel } from "../components/dashboard/PublisherDashboardPanel";

type Earnings = {
  today: number;
  month: number;
  lifetime: number;
  pending: number;
  payable: number;
  caps: { hourlyEarned: number; dailyEarned: number; hourlyCap: number; dailyCap: number };
  payoutLimits?: {
    requestsToday: number;
    requestsThisWeek: number;
    usdToday: number;
    maxRequestsPerDay: number;
    maxRequestsPerWeek: number;
    maxUsdPerDay: number;
  };
};

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

type Activity = { id: string; type: string; adId: string; amount: number; createdAt: string };

const LOGIN_COPY: Record<DashboardTab, { headline: string; sub: string }> = {
  developer: {
    headline: "Sign in to see your earnings",
    sub: "Track balance, request payouts, and view ad activity.",
  },
  advertiser: {
    headline: "Sign in to manage campaigns",
    sub: "View spend, add funds, and launch ads to developers.",
  },
  publisher: {
    headline: "Sign in to publisher dashboard",
    sub: "Monitor inventory and revenue share (SDK preview).",
  },
};

function parseTab(raw: string | null): DashboardTab {
  if (raw === "advertiser" || raw === "publisher") return raw;
  return "developer";
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = parseTab(params.get("tab"));
  const [email, setEmail] = useState<string>();
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
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
  const [foundingMember, setFoundingMember] = useState(false);
  const [referral, setReferral] = useState<ReferralStats | null>(null);
  const [authConfig, setAuthConfig] = useState({ devBypass: false });

  const loggedIn = Boolean(getToken());

  useEffect(() => {
    if (params.get("tab")) return;
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "developer");
        return next;
      },
      { replace: true },
    );
  }, [params, setParams]);

  const setTab = (t: DashboardTab) => {
    params.set("tab", t);
    setParams(params, { replace: true });
  };

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
    const me = await api<{ email: string; foundingMember?: boolean; referral?: ReferralStats }>("/v1/me");
    setEmail(me.email);
    setFoundingMember(Boolean(me.foundingMember));
    setReferral(me.referral ?? null);
  };

  const loadDeveloperData = async () => {
    if (!getToken()) return;
    await Promise.all([loadEarnings(), loadPayoutMethod(), loadProfile()]);
    await retrieveActivity();
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
    const handoff = params.get("handoff");
    if (handoff) {
      setAuthBusy(true);
      void redeemDashboardHandoff(handoff)
        .then(({ accessToken, email: e }) => {
          setToken(accessToken);
          setEmail(e);
          params.delete("handoff");
          setParams(params, { replace: true });
          return loadDeveloperData();
        })
        .catch(() => setAuthError("Could not connect your editor session. Sign in again."))
        .finally(() => setAuthBusy(false));
      return;
    }

    const authState = params.get("auth_state");
    if (!authState) {
      if (getToken()) void loadDeveloperData();
      return;
    }
    setAuthBusy(true);
    void completeAuthFromState(authState)
      .then(({ accessToken, email: e }) => {
        setToken(accessToken);
        setEmail(e);
        params.delete("auth_state");
        setParams(params, { replace: true });
        const redirect = consumeLoginRedirect();
        if (redirect) {
          navigate(redirect, { replace: true });
          return;
        }
        return loadDeveloperData();
      })
      .catch(() => setAuthError("Sign-in failed. Try again."))
      .finally(() => setAuthBusy(false));
  }, []);

  useEffect(() => {
    void fetch(`${import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com"}/v1/auth/config`)
      .then((r) => r.json())
      .then((c) => setAuthConfig({ devBypass: Boolean(c.devBypass) }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    void ensureAuthSession(signInState).then(setSignInState).catch(() => {});
  }, []);

  const signInGoogle = async () => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const state = await ensureAuthSession(signInState);
      setSignInState(state);
      window.location.href = googleRedirectUrl(state);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Could not start Google sign-in");
      setAuthBusy(false);
    }
  };

  const signInEmail = async (addr: string) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const state = await ensureAuthSession(signInState);
      setSignInState(state);
      const result = await completeEmailSignIn(state, addr);
      setToken(result.accessToken);
      navigate(`/dashboard?tab=${tab}`, { replace: true });
      await loadDeveloperData();
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Email sign-in failed");
      throw e;
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

  const loginCard = (
    <LoginAuthCard
      busy={authBusy}
      error={authError}
      devBypass={authConfig.devBypass}
      onGoogleSignIn={signInGoogle}
      onEmailSignIn={signInEmail}
      onDevSignIn={() => {
        void ensureAuthSession(signInState).then((s) => {
          window.location.href = devSignInUrl(s);
        });
      }}
    />
  );

  const copy = LOGIN_COPY[tab];

  return (
    <DashboardHubShell
      tab={tab}
      onTab={setTab}
      email={email}
      onSignOut={signOut}
      loggedIn={loggedIn}
      loginHeadline={copy.headline}
      loginSub={copy.sub}
      loginCard={loginCard}
    >
      {tab === "developer" ? (
        <DeveloperDashboardPanel
          earnings={earnings}
          activity={activity}
          activityLoaded={activityLoaded}
          activityLoading={activityLoading}
          payoutRail={payoutRail}
          payoutHandle={payoutHandle}
          email={email}
          foundingMember={foundingMember}
          referral={referral}
          onSaveMethod={(rail, handle) =>
            api("/v1/me/payout-method", { method: "POST", body: JSON.stringify({ rail, handle }) }).then(
              loadPayoutMethod,
            )
          }
          onRequestPayout={() => api("/v1/me/payout-request", { method: "POST" }).then(() => loadEarnings())}
          onRetrieveActivity={() => void retrieveActivity()}
        />
      ) : null}
      {tab === "advertiser" ? <AdvertiserDashboardPanel /> : null}
      {tab === "publisher" ? <PublisherDashboardPanel /> : null}
    </DashboardHubShell>
  );
}
