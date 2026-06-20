/** Static presentation metrics — partner demo dashboard (not live data). */
export const ADMIN_ALTERNATE = {
  syncedAt: Date.now(),
  kpis: {
    usersSignedUp: 11_847,
    usersNew7d: 2_847,
    advertisers: 23,
    totalSpend: 28_634.87,
    liveAds: 17,
    impressionsPerMin: 824,
    impressionsToday: 68_247,
    pendingPayoutTotal: 3_847.52,
    pendingPayoutCount: 19,
  },
  downloads: {
    totals: {
      total: 16_923,
      today: 612,
      week: 4_218,
      month: 11_487,
    },
    marketplaces: [
      {
        id: "vscode",
        label: "VS Code Marketplace",
        note: "VS Code and Cursor",
        total: 5_892,
        today: 214,
        week: 1_476,
        month: 4_018,
      },
      {
        id: "openvsx",
        label: "Open VSX",
        note: "Windsurf (default), VSCodium, and other Open VSX editors",
        total: 11_031,
        today: 398,
        week: 2_742,
        month: 7_469,
      },
    ],
  },
} as const;
