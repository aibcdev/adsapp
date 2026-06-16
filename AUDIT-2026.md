# AUDIT-2026 — AIBC Platform End-to-End Audit

**Date:** 2026-06-14  
**Scope:** Three-lane audit (Product / Money / Growth) before growth mechanics launch.

---

## Lane A — Product (extension + CLI)

| Flow | Result | Notes | Owner | Target |
|------|--------|-------|-------|--------|
| Install → sign-in → impression → click → earnings | **Pass** | Metrics pipeline + 72h hold + dashboard sync | Product | — |
| Uninstall restore (Claude Code index.js) | **Pass** | Hardened restore strips injection; backup removed | Product | 2026-06-14 |
| Uninstall restore (~/.claude/settings.json) | **Pass** | Settings restored from backup or statusLine removed | Product | 2026-06-14 |
| ~/.aibc artifact cleanup on uninstall | **Pass** | cleanupAibcArtifacts on deactivate/restore | Product | 2026-06-14 |
| Incompatible — missing Claude Code | **Pass** | Clear preflight message + status bar | Product | 2026-06-14 |
| Incompatible — unknown version | **Fix planned** | Shows guidance; needs live version matrix | Product | 2026-06-21 |
| VS Code Marketplace install link | **Pass** | installLinks.ts + publisher profile | Ops | — |
| Open VSX install link | **Fail** | Not published yet — see MARKETPLACE.md | Ops | 2026-06-21 |
| CLI parity (packages/cli) | **Fix planned** | Exists; full parity audit pending | Product | 2026-06-21 |

---

## Lane B — Money

| Flow | Result | Notes | Owner | Target |
|------|--------|-------|-------|--------|
| Credit path: POST /v1/metrics → hold → payable | **Pass** | 72h settlement in ledger | Ops | — |
| Payout request (min $10) | **Pass** | Enforced in API + UI | Ops | — |
| Admin mark paid | **Pass** | /admin/payouts queue | Ops | — |
| Admin mark failed → restore payable | **Pass** | Failed payouts credit back base amount | Ops | 2026-06-14 |
| Terms vs code min payout | **Pass** | Aligned to $10 in Terms + economics | Ops | 2026-06-14 |
| Withdrawal day/week limits | **Pass** | Enforced on payout-request + UI | Ops | 2026-06-14 |
| Founding +5% in ledger | **Pass** | founding_member multiplier in credits | Ops | 2026-06-14 |
| Referral $10 first-payout bonus | **Pass** | Qualify at $10 lifetime; bonus on first payout | Growth | 2026-06-14 |
| Founding priority payout queue | **Pass** | Admin sorts founding DESC, created ASC | Ops | 2026-06-14 |
| Stripe advertiser checkout (prod) | **Fix planned** | Requires prod webhook verification | Ops | 2026-06-21 |
| Fraud / killswitch UI | **Fix planned** | killswitch table exists; no admin UI yet | Ops | 2026-06-21 |

---

## Lane C — Growth / ops

| Flow | Result | Notes | Owner | Target |
|------|--------|-------|-------|--------|
| Landing → install → login → dashboard | **Pass** | Full funnel works | Growth | — |
| Google login | **Pass** | OAuth + portal callback | Growth | — |
| Payout method setup | **Pass** | Wise / PayPal / UPI | Growth | — |
| Contact page + footer links | **Pass** | /contact, Privacy, Terms | Growth | — |
| Referral page + footer promo | **Pass** | /referral + dashboard section | Growth | 2026-06-14 |
| Header audience pills | **Pass** | Developers / Advertisers / Publishers | Growth | — |
| Admin users + limits | **Pass** | /admin/* shell | Ops | 2026-06-14 |
| PostHog / analytics events | **Fix planned** | Extension analytics partial; portal TBD | Growth | TBD |
| Legal copy accuracy (founding 15k) | **Pass** | DB-backed founding_member + badge | Growth | 2026-06-14 |

---

## Summary

| Lane | Pass | Fail | Fix planned |
|------|------|------|-------------|
| A Product | 7 | 1 | 2 |
| B Money | 9 | 0 | 2 |
| C Growth | 8 | 0 | 1 |

**Re-run target:** 2026-06-21 after Open VSX publish and Stripe prod verification.
