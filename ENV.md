# Environment variables

Copy values into the right place. **Do not commit secrets.**

---

## Local dev — `.env` (repo root)

Create from template: `cp .env.example .env`

| Variable | Example / value | Required |
|----------|-----------------|----------|
| `AIBC_DEV_BYPASS` | `1` | Yes (local only) |
| `AIBC_PUBLIC_URL` | `http://127.0.0.1:8787` | Yes |
| `AIBC_PORTAL_URL` | `http://localhost:5175` | Yes |
| `VITE_AIBC_API` | `http://127.0.0.1:8787` | Yes (portal) |
| `STRIPE_SECRET_KEY` | `sk_test_...` | For deposits |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | For deposits |
| `GOOGLE_CLIENT_ID` | *(empty for dev bypass)* | No locally |
| `GOOGLE_CLIENT_SECRET` | *(empty for dev bypass)* | No locally |

Local Stripe webhook forwarding:
```bash
npm run dev:stripe
```

---

## Netlify — website (`aibcmedia.com`)

**Site settings → Environment variables → Production**

| Variable | Value |
|----------|--------|
| `VITE_AIBC_API` | `https://api.aibcmedia.com` |
| `NODE_VERSION` | `22` *(optional — set in netlify.toml)* |

**Build settings** (or use `netlify.toml` in repo):

| Setting | Value |
|---------|--------|
| Build command | `npm ci && npm run build --workspace=@aibc/shared && npm run build --workspace=@aibc/portal` |
| Publish directory | `packages/portal/dist` |

Connect repo: `aibcdev/aibcmedia` on GitHub.

---

## Fly.io — API (`api.aibcmedia.com`)

```bash
fly secrets set \
  AIBC_PUBLIC_URL=https://api.aibcmedia.com \
  AIBC_PORTAL_URL=https://aibcmedia.com \
  AIBC_CORS_ORIGINS=https://aibcmedia.com,https://www.aibcmedia.com \
  GOOGLE_CLIENT_ID=YOUR_VALUE \
  GOOGLE_CLIENT_SECRET=YOUR_VALUE \
  STRIPE_SECRET_KEY=sk_live_YOUR_VALUE \
  STRIPE_WEBHOOK_SECRET=whsec_YOUR_VALUE \
  AIBC_POSTHOG_KEY= \
  AIBC_POSTHOG_HOST=https://us.i.posthog.com
```

| Variable | Where to get it |
|----------|-----------------|
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/) → APIs → Credentials → OAuth client |
| `GOOGLE_CLIENT_SECRET` | Same OAuth client |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Secret key (live) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → endpoint for `https://api.aibcmedia.com/v1/webhooks/stripe` |

**Do not set** `AIBC_DEV_BYPASS` in production.

---

## Google Cloud — OAuth client

| Setting | Value |
|---------|--------|
| Authorized redirect URI | `https://api.aibcmedia.com/v1/auth/google/callback` |
| Authorized JavaScript origins | `https://aibcmedia.com` |

---

## Stripe — webhooks

| Mode | URL | Event |
|------|-----|--------|
| Test (local) | `stripe listen --forward-to localhost:8787/v1/webhooks/stripe` | `checkout.session.completed` |
| Production | `https://api.aibcmedia.com/v1/webhooks/stripe` | `checkout.session.completed` |

Create production webhook:
```bash
stripe webhook_endpoints create --live \
  --url="https://api.aibcmedia.com/v1/webhooks/stripe" \
  -d "enabled_events[0]=checkout.session.completed"
```

Account: **AIBC** (watchaibc@gmail.com)

**Auto-sync from CLI:**
```bash
npm run stripe:sync    # updates .env + .env.fly template
npm run dev:stripe     # forward webhooks to local API
```

Test webhook on Stripe (for when API is deployed): `https://api.aibcmedia.com/v1/webhooks/stripe`  
Local dev uses `stripe listen` secret (synced by `stripe:sync`).

Live webhook: CLI restricted key cannot create it — add in [Stripe Dashboard](https://dashboard.stripe.com/webhooks) when you switch to live payments.

---

## VS Code extension

No env vars on the server. Defaults are in `packages/extension/package.json`:

| Setting | Default |
|---------|---------|
| `aibc.apiBase` | `https://api.aibcmedia.com` |
| `aibc.portalBase` | `https://aibcmedia.com` |

Publish token: create at https://marketplace.visualstudio.com/manage → Personal Access Tokens.

---

## DNS (registrar)

### Website — Netlify

After connecting the site, Netlify shows exact records. Usually:

| Type | Name | Value |
|------|------|--------|
| A | `@` | Netlify load balancer IP *(from Netlify UI)* |
| CNAME | `www` | `<your-site>.netlify.app` |

### API — Fly.io

After `fly certs add api.aibcmedia.com`:

| Type | Name | Value |
|------|------|--------|
| CNAME | `api` | `<your-fly-app>.fly.dev` |

---

## Quick copy — production `.env` template

```bash
# API (Fly secrets — not a file on server)
AIBC_PUBLIC_URL=https://api.aibcmedia.com
AIBC_PORTAL_URL=https://aibcmedia.com
AIBC_CORS_ORIGINS=https://aibcmedia.com,https://www.aibcmedia.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Netlify (dashboard only)
VITE_AIBC_API=https://api.aibcmedia.com
```
