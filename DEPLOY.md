# Deploy aibc → aibcmedia.com

**Read PRE-LAUNCH.md first.** Env vars: **ENV.md**

---

## DNS

| Subdomain | Host | Record |
|-----------|------|--------|
| `aibcmedia.com` | Netlify | *(Netlify dashboard)* |
| `api.aibcmedia.com` | **DigitalOcean Droplet** | **A** → droplet IP |

Check API: `curl https://api.aibcmedia.com/health`

---

## 1. API — DigitalOcean Droplet (do this first)

### One-time setup

1. DigitalOcean → **Create Droplet**
   - Ubuntu 22.04 or 24.04
   - Size: Basic $6/mo is enough to start
   - Region: London (or nearest users)
2. SSH in and install Docker:
   ```bash
   curl -fsSL https://get.docker.com | sh
   apt install -y docker-compose-plugin git
   ```
3. DNS: add **A record** `api` → your droplet IP
4. On your Mac:
   ```bash
   cp .env.fly deploy/digitalocean/.env
   ./scripts/deploy-digitalocean.sh root@YOUR_DROPLET_IP
   ```

Caddy auto-gets HTTPS for `api.aibcmedia.com`.

### Updates (redeploy)

```bash
./scripts/deploy-digitalocean.sh root@YOUR_DROPLET_IP
```

---

## 2. Website — Netlify

1. Connect repo: `aibcdev/adsapp` (or `aibcmedia`)
2. Env: `VITE_AIBC_API=https://api.aibcmedia.com`
3. Build uses `netlify.toml`
4. Domain: `aibcmedia.com`

---

## 3. VS Code Marketplace

See **MARKETPLACE.md**

---

## Local dev

```bash
npm run dev:api
npm run dev:portal
npm run dev:stripe
```
