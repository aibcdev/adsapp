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

## DigitalOcean — API (`api.aibcmedia.com`)

On the Droplet, secrets live in `deploy/digitalocean/.env` (copy from `.env.fly` on your Mac):

```bash
cp .env.fly deploy/digitalocean/.env
./scripts/deploy-digitalocean.sh root@YOUR_DROPLET_IP
```

Required variables in that file:

```bash
AIBC_PUBLIC_URL=https://api.aibcmedia.com
AIBC_PORTAL_URL=https://aibcmedia.com
AIBC_CORS_ORIGINS=https://aibcmedia.com,https://www.aibcmedia.com
AIBC_DB_PATH=/data/aibc.db
GOOGLE_CLIENT_ID=YOUR_VALUE
GOOGLE_CLIENT_SECRET=YOUR_VALUE
STRIPE_SECRET_KEY=sk_live_YOUR_VALUE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_VALUE
AIBC_ADMIN_EMAILS=watchaibc@gmail.com
AIBC_POSTHOG_KEY=
AIBC_POSTHOG_HOST=https://us.i.posthog.com
```

| Variable | Where to get it |
|----------|-----------------|
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/) → APIs → Credentials → OAuth client |
| `GOOGLE_CLIENT_SECRET` | Same OAuth client |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Secret key (live) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → endpoint for `https://api.aibcmedia.com/v1/webhooks/stripe` |
| `AIBC_ADMIN_EMAILS` | Comma-separated Google emails allowed on `/v1/admin/*` and portal `/admin` (default: `watchaibc@gmail.com`) |

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

## Stripe — webhooks & keys

Account: **AIBC** (watchaibc@gmail.com)

### Why CLI looked “restricted”

`stripe login` (browser) saves **`rk_live_*`** — a limited CLI key. It **cannot** create webhooks. That is normal Stripe security, not a bug.

**Fix:** use the full **`sk_live_*`** secret key from the dashboard for webhooks and production.

```bash
npm run stripe:fix-live   # paste sk_live once — saves to .env
npm run stripe:sync       # refresh keys + ensure webhooks
npm run dev:stripe        # local webhook forwarding
```

| Key type | Prefix | Use for |
|----------|--------|---------|
| CLI OAuth live | `rk_live_` | `stripe listen` only |
| Full secret | `sk_live_` | API, webhooks, production |
| Test secret | `sk_test_` | Dev + pre-launch testing |

Test webhook: `https://api.aibcmedia.com/v1/webhooks/stripe` (test mode — active)

Live webhook: created automatically when `STRIPE_LIVE_SECRET_KEY` is in `.env`

---

## VS Code extension

No env vars on the server. Defaults are in `packages/extension/package.json`:

| Setting | Default |
|---------|---------|
| `aibc.apiBase` | `https://api.aibcmedia.com` |
| `aibc.portalBase` | `https://aibcmedia.com` |

**Developer earnings:** Paid campaigns credit **60%** of CPM automatically per validated view (72h hold, then payable). Sample filler ads pay **$0**. Cash-out to Wise/PayPal is **manual** admin review. One Google email = one wallet (extension + dashboard share the same balance). After deploy, run `node scripts/fix-duplicate-earnings.mjs` on the API server if old duplicate accounts exist.

Publish token: create at https://marketplace.visualstudio.com/manage → Personal Access Tokens.

---

## DNS (registrar)

### Website — Netlify

After connecting the site, Netlify shows exact records. Usually:

| Type | Name | Value |
|------|------|--------|
| A | `@` | Netlify load balancer IP *(from Netlify UI)* |
| CNAME | `www` | `<your-site>.netlify.app` |

### API — DigitalOcean Droplet

| Type | Name | Value |
|------|------|--------|
| A | `api` | Your Droplet IP |

HTTPS is handled by Caddy on the Droplet (Let's Encrypt).

---

## Quick copy — production `.env` template

```bash
# API (DigitalOcean — deploy/digitalocean/.env on server)
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

---

## GitHub — blog auto-publish (Gemini Flash)

**Repo → Settings → Secrets → Actions**

| Secret | Where to get it |
|--------|----------------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) or Google Cloud → API key with Generative Language API enabled |

Optional repo variable: `GEMINI_MODEL` (default `gemini-2.0-flash`).

Runs twice daily via `.github/workflows/blog-publish.yml`. Local test:

```bash
GEMINI_API_KEY=your_key node scripts/generate-blog-post.mjs
```
