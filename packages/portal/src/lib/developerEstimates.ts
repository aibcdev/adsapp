/** Marketing floor for active developers — never show below this on the site. */
export const DEVELOPER_MONTHLY_EARNINGS_FLOOR_USD = 40;

export function normalizeMonthlyEarnings(usd: number | undefined | null): number {
  const n = typeof usd === "number" && Number.isFinite(usd) ? usd : DEVELOPER_MONTHLY_EARNINGS_FLOOR_USD;
  return Math.max(DEVELOPER_MONTHLY_EARNINGS_FLOOR_USD, Math.round(n));
}

export function formatMonthlyEarnings(usd: number): string {
  return `${normalizeMonthlyEarnings(usd)}+`;
}
