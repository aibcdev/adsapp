import { api } from "./api";

export type AdvertiserCampaign = {
  id: string;
  adLine: string;
  destinationUrl: string;
  brandName: string;
  bidPer1k: number;
  blocks: number;
  showOnLeaderboard: number;
  status: string;
  impressions: number;
  spend: number;
  createdAt: string;
};

export function fetchAdvertiserBalance() {
  return api<{ balance: number }>("/v1/advertiser/balance");
}

export function fetchAdvertiserCampaigns() {
  return api<AdvertiserCampaign[]>("/v1/advertiser/campaigns");
}

export function startAdvertiserDeposit(amount: number) {
  return api<{ url: string }>("/v1/advertiser/deposit/checkout", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
