# Deploy aibc → aibcmedia.com

## DNS records (add at your registrar)

### Website — `aibcmedia.com` (Vercel)

If Vercel hosts the site, use the records Vercel shows after you connect the GitHub repo. Usually:

| Type | Name | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` (Vercel — confirm in Vercel dashboard) |
| CNAME | `www` | `cname.vercel-dns.com` |

### API — `api.aibcmedia.com` (Fly.io)

After `fly deploy` and `fly certs add api.aibcmedia.com`, Fly prints the exact records. Typically:

| Type | Name | Value |
|------|------|--------|
| CNAME | `api` | `<your-app-name>.fly.dev` |

Or A/AAAA records if Fly gives those instead of CNAME.

**Check when live:** `curl https://api.aibcmedia.com/health`

---

## 1. API (Fly.io)

```bash
fly auth login
fly launch --no-deploy   # app name e.g. aibc-api
fly volumes create aibc_data --region lhr --size 1

fly secrets set \
  GOOGLE_CLIENT_ID=xxx \
  GOOGLE_CLIENT_SECRET=xxx \
  STRIPE_SECRET_KEY=sk_live_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \
  AIBC_PUBLIC_URL=https://api.aibcmedia.com \
  AIBC_PORTAL_URL=https://aibcmedia.com \
  AIBC_CORS_ORIGINS=https://aibcmedia.com,https://www.aibcmedia.com

fly deploy
fly certs add api.aibcmedia.com
```

**Google OAuth redirect:** `https://api.aibcmedia.com/v1/auth/google/callback`

**Stripe webhook (live):** `https://api.aibcmedia.com/v1/webhooks/stripe`  
Event: `checkout.session.completed`

Create live webhook:
```bash
stripe webhook_endpoints create --live \
  --url="https://api.aibcmedia.com/v1/webhooks/stripe" \
  -d "enabled_events[0]=checkout.session.completed"
```

Stripe account: **AIBC** (watchaibc@gmail.com). Test webhook already created via CLI.

---

## 2. Website (Vercel + GitHub)

1. Push repo to GitHub (`aibcdev/aibcmedia`)
2. [vercel.com](https://vercel.com) → Import project → select repo
3. Build settings:
   - **Build command:** `npm run build --workspace=@aibc/portal`
   - **Output directory:** `packages/portal/dist`
   - **Install command:** `npm ci`
4. Environment variable: `VITE_AIBC_API` = `https://api.aibcmedia.com`
5. Add domain `aibcmedia.com` + `www.aibcmedia.com`

---

## 3. VS Code Marketplace

See **MARKETPLACE.md** in this repo.

---

## 4. Local dev + Stripe

Terminal 1: `npm run dev:api`  
Terminal 2: `npm run dev:portal`  
Terminal 3: `npm run dev:stripe` (forwards test webhooks to localhost)

`.env` in repo root holds test Stripe keys (gitignored).

---

## Smoke test

- [ ] `https://aibcmedia.com` loads
- [ ] `https://api.aibcmedia.com/health` returns OK
- [ ] Google sign-in works
- [ ] Stripe deposit on Advertise tab
- [ ] Extension install + sign-in
