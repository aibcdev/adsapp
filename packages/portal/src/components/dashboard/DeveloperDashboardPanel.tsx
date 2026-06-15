import { Link } from "react-router-dom";
import { StatCards } from "./StatCards";
import { EarningsChart } from "./EarningsChart";
import { PayoutsPanel } from "./PayoutsPanel";
import { ActivityLedger } from "./ActivityLedger";
import { AccountSection } from "./AccountSection";
import { ReferralSection } from "./ReferralSection";
import { EarnMorePanel } from "./EarnMorePanel";
import { PartnerDashboardShell } from "./DashboardHubShell";

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
  yield?: {
    usdPerAgentHour: number;
    earningsLastHour: number;
    targetUsdPerAgentHour: number;
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

export function DeveloperDashboardPanel({
  earnings,
  activity,
  activityLoaded,
  activityLoading,
  payoutRail,
  payoutHandle,
  email,
  foundingMember,
  referral,
  onSaveMethod,
  onRequestPayout,
  onConnectStripe,
  onLoadConnectStatus,
  onRetrieveActivity,
}: {
  earnings: Earnings;
  activity: Activity[];
  activityLoaded: boolean;
  activityLoading: boolean;
  payoutRail: string;
  payoutHandle: string;
  email?: string;
  foundingMember: boolean;
  referral: ReferralStats | null;
  onSaveMethod: (rail: string, handle: string) => Promise<void>;
  onRequestPayout: () => Promise<{ autoPaid?: boolean }>;
  onConnectStripe: () => Promise<string>;
  onLoadConnectStatus: () => Promise<{
    connected: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    stripeEnabled: boolean;
  }>;
  onRetrieveActivity: () => void;
}) {
  return (
    <PartnerDashboardShell eyebrow="Developer earnings" title="Your balance & activity">
      <div className="mb-6 flex justify-end">
        <Link to="/advertisers#launch" className="text-sm font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4">
          Advertise on AIBC →
        </Link>
      </div>

      <StatCards
        today={earnings.today}
        month={earnings.month}
        lifetime={earnings.lifetime}
        caps={earnings.caps}
        yieldMetrics={earnings.yield}
      />

      <div className="mb-6">
        <EarnMorePanel />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <EarningsChart activity={activity} />
        </div>
        <div className="lg:col-span-2">
          <PayoutsPanel
            payable={earnings.payable}
            rail={payoutRail}
            handle={payoutHandle}
            payoutLimits={earnings.payoutLimits}
            onSaveMethod={onSaveMethod}
            onRequestPayout={onRequestPayout}
            onConnectStripe={onConnectStripe}
            onLoadConnectStatus={onLoadConnectStatus}
          />
        </div>
      </div>

      <div className="mb-6">
        <ActivityLedger rows={activity} loaded={activityLoaded} loading={activityLoading} onRetrieve={onRetrieveActivity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReferralSection stats={referral} />
        {email ? <AccountSection email={email} foundingMember={foundingMember} /> : null}
      </div>
    </PartnerDashboardShell>
  );
}
