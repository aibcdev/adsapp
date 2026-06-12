# Deploy aibc → aibcmedia.com

**Read PRE-LAUNCH.md first.** Finish web + extension before deploying.

Env vars: **ENV.md**

---

## DNS records

### Website — Netlify (`aibcmedia.com`)

1. Netlify → Add site → Import from Git → `aibcdev/aibcmedia`
2. Build uses `netlify.toml` automatically
3. Set env var: `VITE_AIBC_API` = `https://api.aibcmedia.com`
4. Domain settings → add `aibcmedia.com` — Netlify shows DNS records

Usually:

| Type | Name | Value |
|------|------|--------|
| A or ALIAS | `@` | *(Netlify gives you an IP or ANAME)* |
| CNAME | `www` | `<your-site-name>.netlify.app` |

### API — Fly.io (`api.aibcmedia.com`)

After `fly deploy`:

```bash
fly certs add api.aibcmedia.com
```

| Type | Name | Value |
|------|------|--------|
| CNAME | `api` | `<your-app>.fly.dev` |

Check: `curl https://api.aibcmedia.com/health`

---

## 1. API (Fly) — do this first

```bash
fly auth login
fly launch
fly volumes create aibc_data --region lhr --size 1
fly secrets set ...   # see ENV.md
fly deploy
fly certs add api.aibcmedia.com
```

---

## 2. Website (Netlify) — after API works

1. Connect `aibcdev/aibcmedia` on Netlify
2. Set `VITE_AIBC_API=https://api.aibcmedia.com`
3. Deploy
4. Add custom domain `aibcmedia.com`

---

## 3. VS Code Marketplace

See **MARKETPLACE.md**

---

## Local dev

```bash
npm run dev:api
npm run dev:portal
npm run dev:stripe   # optional — Stripe webhooks
```
