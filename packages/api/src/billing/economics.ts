/** aibc economics — aligned with kickbacks.ai auction model, 70% developer share. */

export const DEVELOPER_SHARE = 0.7;
export const PLATFORM_SHARE = 0.3;
export const CLICK_MULTIPLIER = 50;
export const BLOCK_IMPRESSIONS = 1000;
export const BID_FLOOR_PER_1K = 1;
export const SETTLEMENT_HOLD_MS = 72 * 60 * 60 * 1000;
export const MIN_PAYOUT_USD = 10;
export const HOURLY_CAP_USD = 20;
export const DAILY_CAP_USD = 200;

/** Advertiser cost per single impression (bid is per 1k). */
export function advertiserCostPerImpression(bidPer1k: number): number {
  return bidPer1k / 1000;
}

/** Developer credit per validated impression. */
export function developerImpressionPay(bidPer1k: number): number {
  return advertiserCostPerImpression(bidPer1k) * DEVELOPER_SHARE;
}

/** Developer credit per validated click (50× impression rate). */
export function developerClickPay(bidPer1k: number): number {
  return developerImpressionPay(bidPer1k) * CLICK_MULTIPLIER;
}

export function bidPerBlock(bidPer1k: number): number {
  return (bidPer1k * BLOCK_IMPRESSIONS) / 1000;
}

export function campaignBudgetUsd(bidPer1k: number, blocks: number): number {
  return bidPerBlock(bidPer1k) * blocks;
}
