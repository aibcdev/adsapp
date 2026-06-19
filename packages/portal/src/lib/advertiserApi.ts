import { api } from "./api";

export type AdvertiserBrand = {
  id: string;
  name: string;
  logoUrl?: string | null;
  createdAt: string;
};

export type AdvertiserCampaign = {
  id: string;
  adLine: string;
  destinationUrl: string;
  brandName: string;
  brandId?: string | null;
  bidPer1k: number;
  blocks: number;
  showOnLeaderboard: number;
  status: string;
  impressions: number;
  spend: number;
  createdAt: string;
  targetCountries?: string[];
};

export type AdvertiserSummary = {
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  campaignCount: number;
};

export type CampaignAnalytics = {
  campaign: {
    id: string;
    adLine: string;
    brandName: string | null;
    status: string;
    spend: number;
    bidPer1k: number;
    targetCountries: string | null;
    createdAt: string;
  };
  totals: {
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
    avgCpm: number;
  };
  breakdowns: {
    byEditor: { key: string; count: number }[];
    byCountry: { key: string; count: number }[];
    byLanguage: { key: string; count: number }[];
  };
  daily: { date: string; impressions: number; clicks: number }[];
};

export type PartnerDashboard = {
  code: string;
  commissionPct: number;
  commissionBasePct: number;
  commissionTierPct: number;
  commissionTierThresholdUsd: number;
  tierUnlocked: boolean;
  spendUntilTierUsd: number;
  referralLink: string;
  referrals: { clientId: string; email: string | null; attributedAt: string }[];
  totalReferredSpend: number;
  totalCommissionEarned: number;
};

export function fetchAdvertiserBalance() {
  return api<{ balance: number }>("/v1/advertiser/balance");
}

export function fetchAdvertiserProfile() {
  return api<{ accountType: string; isPartner: boolean }>("/v1/advertiser/profile");
}

export function fetchAdvertiserBrands() {
  return api<AdvertiserBrand[]>("/v1/advertiser/brands");
}

export function createAdvertiserBrand(name: string) {
  return api<{ id: string; name: string }>("/v1/advertiser/brands", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function fetchAdvertiserCampaigns(brandId?: string) {
  const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : "";
  return api<AdvertiserCampaign[]>(`/v1/advertiser/campaigns${q}`);
}

export function fetchAdvertiserSummary() {
  return api<AdvertiserSummary>("/v1/advertiser/analytics/summary");
}

export function fetchCampaignAnalytics(campaignId: string) {
  return api<CampaignAnalytics>(`/v1/advertiser/campaigns/${campaignId}/analytics`);
}

export function fetchPartnerDashboard() {
  return api<PartnerDashboard>("/v1/advertiser/partner");
}

export function attributePartnerReferral(partnerCode: string) {
  return api<{ ok: boolean; attributed: boolean }>("/v1/advertiser/referral/attribute", {
    method: "POST",
    body: JSON.stringify({ partnerCode }),
  });
}

export function startAdvertiserDeposit(amount: number) {
  return api<{ url: string }>("/v1/advertiser/deposit/checkout", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export function createAdvertiserCampaign(payload: Record<string, unknown>) {
  return api<{ id: string }>("/v1/advertiser/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
