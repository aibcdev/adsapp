/** Static presentation metrics — anchored at ~8,147 signed-up developers. */
export const ADMIN_ALTERNATE = {
  syncedAt: Date.now(),
  kpis: {
    usersSignedUp: 8_147,
    usersNew7d: 651,
    advertisers: 4,
    totalSpend: 4_287.63,
    liveAds: 7,
    impressionsPerMin: 463,
    impressionsToday: 38_647,
    pendingPayoutTotal: 892.41,
    pendingPayoutCount: 12,
  },
  downloads: {
    totals: {
      total: 11_486,
      today: 127,
      week: 651,
      month: 2_847,
    },
    marketplaces: [
      {
        id: "vscode",
        label: "VS Code Marketplace",
        note: "VS Code and Cursor",
        total: 4_238,
        today: 47,
        week: 312,
        month: 1_084,
      },
      {
        id: "openvsx",
        label: "Open VSX",
        note: "Windsurf (default), VSCodium, and other Open VSX editors",
        total: 7_248,
        today: 80,
        week: 339,
        month: 1_763,
      },
    ],
  },
} as const;
