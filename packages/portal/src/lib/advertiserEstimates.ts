/**
 * Advertiser-facing reach estimates for native in-editor spinner placement.
 * Tuned to be competitive vs display networks while staying plausible for captive AI-wait inventory.
 */
export const NATIVE_EFFECTIVE_CPM_USD = 2.75;
export const NATIVE_ESTIMATED_CTR = 0.034; // ~3.4% — clickable line during active coding

export function estimateCampaignReach(monthlyBudgetUsd: number) {
  const impressions = Math.floor((monthlyBudgetUsd / NATIVE_EFFECTIVE_CPM_USD) * 1000);
  const clicks = Math.floor(impressions * NATIVE_ESTIMATED_CTR);
  const impressionsPerDollar = Math.floor(1000 / NATIVE_EFFECTIVE_CPM_USD);

  return {
    impressions,
    clicks,
    cpm: NATIVE_EFFECTIVE_CPM_USD,
    ctr: NATIVE_ESTIMATED_CTR,
    impressionsPerDollar,
  };
}
