# aibc

Get paid while you code. Developer discovery, spinner ads, earnings dashboard, and advertiser campaigns.

## Go live

Env vars: **[ENV.md](./ENV.md)** · Pre-launch: **[PRE-LAUNCH.md](./PRE-LAUNCH.md)**

## Quick start (local dev)

```bash
cd /Users/akeemojuko/Workspace/flux
npm install
node scripts/gen-icon.mjs
```

**Terminal 1 — API:**
```bash
npm run dev:api
```

**Terminal 2 — Portal:**
```bash
npm run dev:portal
```

**Terminal 3 — Extension:**
```bash
npm run build
```
Open in Cursor → **F5** → click **aibc** in the sidebar.

## What's included

| Part | URL / location |
|------|----------------|
| API | http://127.0.0.1:8787 |
| Portal dashboard | http://127.0.0.1:5175/dashboard |
| VS Code extension | Activity bar → aibc |
| Terminal CLI | `aibc` command (no IDE needed) |

## Terminal only (no IDE)

For users who run **Claude Code in the terminal** only:

```bash
npm run dev:api          # start API first
npm run build --workspace=@aibc/cli
node packages/cli/dist/index.js login
node packages/cli/dist/index.js install claude
node packages/cli/dist/index.js refresh
```

Then restart `claude` in your terminal. You'll see a sponsored line in the status bar.

**Commands:**
- `aibc login` — sign in
- `aibc install claude` — hook terminal status line
- `aibc refresh` — pull latest ad
- `aibc restore` — undo changes

Install globally: `npm link --workspace=@aibc/cli` then use `aibc` anywhere.

## Features

- **Earn** — spinner ads in Claude Code, status bar balance, 60% revenue share
- **Discover** — tools, MCP, resources (sidebar tabs)
- **Advertise** — place campaigns, prepaid balance (portal)
- **Dashboard** — IdleAds-style Earn + Advertise layout

## Sign in (dev)

Set `AIBC_DEV_BYPASS=1` (default in dev:api). Click **Sign in** — opens dev auth page.

## Commands

- `aibc: Sign in` / `aibc: Sign out`
- `aibc: Menu`
- `aibc: Restore Claude Code`
- `aibc: Refresh Content`

## Settings

- `aibc.apiBase` — default `https://api.aibcmedia.com`
- `aibc.portalBase` — default `https://aibcmedia.com`
- `aibc.viewThresholdSeconds` — default `5`
- `aibc.posthogKey` — optional analytics

## Build & package

```bash
npm run build
npm run package
```

## Publish

```bash
npm run publish:marketplace
npm run publish:openvsx
```

Replace publisher `aibcdev` in `packages/extension/package.json` if needed before publishing.
