# Kickbacks Issue Tracker — AIBC / Flux Cross-Track

Mirrors [kickbacks.ai/issues](https://github.com/andrewmccalip/kickbacks.ai/issues).  
Admin UI: `/admin/competitive` (loads `packages/portal/public/kickbacks-tracker.json`).

| Kickbacks # | Title | AIBC status | Flux fix | Owner | ETA |
|-------------|-------|-------------|----------|-------|-----|
| [#97](https://github.com/andrewmccalip/kickbacks.ai/issues/97) | Uninstall leaves patches | **Fixed in flux** | Hardened `deactivate()` + restore; delete `~/.aibc/*` artifacts | Product | 2026-06-14 |
| [#99](https://github.com/andrewmccalip/kickbacks.ai/issues/99) | Incompatible (unknown) | **Fixed in flux** | Clear preflight messages; troubleshooting in status bar | Product | 2026-06-14 |
| [#100](https://github.com/andrewmccalip/kickbacks.ai/issues/100) | Incompatible on missing Claude | **Fixed in flux** | Install guidance when Claude Code not found | Product | 2026-06-14 |
| [#87](https://github.com/andrewmccalip/kickbacks.ai/issues/87) | Open VSX publish | **In progress** | Complete namespace + `npm run publish:openvsx` per MARKETPLACE.md | Ops | 2026-06-21 |
| [#104](https://github.com/andrewmccalip/kickbacks.ai/issues/104) | Security / revenue audit | **In progress** | Lane B audit + cap review + admin fraud flags (backlog) | Ops | 2026-06-21 |
| [#102](https://github.com/andrewmccalip/kickbacks.ai/issues/102) | India / Stripe blocked | **Phase 2** | Manual UPI rail; Stripe Connect later | Ops | TBD |
| [#103](https://github.com/andrewmccalip/kickbacks.ai/issues/103) | India payout rail | **Phase 2** | UPI in payout method; manual admin review | Ops | TBD |
| [#101](https://github.com/andrewmccalip/kickbacks.ai/issues/101) | Terminal-only CLI agent | **Partial** | `packages/cli` exists — parity audit pending | Product | 2026-06-21 |
| [#94](https://github.com/andrewmccalip/kickbacks.ai/issues/94) | IPv6 loopback | **Backlog** | Port if same code paths in flux adapters | Product | TBD |
| [#93](https://github.com/andrewmccalip/kickbacks.ai/issues/93) | JSONC strip bug | **Fixed in flux** | Safe `parseSettingsJson` in ClaudeCliAdapter | Product | 2026-06-14 |
| [#95](https://github.com/andrewmccalip/kickbacks.ai/issues/95) | OpenCode support | **Backlog** | Roadmap only | Product | TBD |

## How to update

1. Edit this file for documentation.
2. Edit `packages/portal/public/kickbacks-tracker.json` for the admin Competitive tab.
