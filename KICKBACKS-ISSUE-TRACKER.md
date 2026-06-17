# Kickbacks issue tracker — AIBC parity

Mirrors [kickbacks.ai/issues](https://github.com/andrewmccalip/kickbacks.ai/issues).

## Auto-sync

```bash
npm run sync:kickbacks
```

Writes `packages/portal/public/kickbacks-tracker.json`.  
GitHub Actions runs this **weekly** (`.github/workflows/sync-kickbacks.yml`).

## Admin UI

`/admin/competitive` — filter by AIBC status, links to each GitHub issue.

## Edit mappings

Override status per issue in `scripts/kickbacks-aibc-status.mjs`, then re-run sync.

Status values: `fixed` | `in_progress` | `partial` | `backlog` | `wont_fix` | `n_a`

## Latest snapshot (auto-generated)

Run sync to refresh counts. Typical split: **~33 fixed**, **~40 backlog** (adapters/CLI), **~7 in progress** (security).

## Key AIBC wins vs open Kickbacks issues

| Theme | AIBC |
|-------|------|
| Payouts | Stripe Connect + PayPal + Wise + UPI |
| India | No region block; manual rails |
| Editors | VS Code, Cursor, Windsurf, Open VSX |
| Uninstall | `deactivate()` restores patches — no stale shims |
| Anti-farm | Portfolio session + hourly mint cap |
| Split | 70% vs ~50% |
