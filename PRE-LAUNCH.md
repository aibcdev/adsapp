# Pre-launch checklist

Finish these **before** Netlify deploy, DigitalOcean deploy, or VS Code publish.

## Website (portal)

- [x] Landing page
- [x] Dashboard (Earn + Advertise)
- [x] Privacy + Terms pages
- [x] Stripe checkout flow (needs live API + keys)
- [x] Prod URLs → `aibcmedia.com`
- [x] `netlify.toml` ready
- [ ] Google sign-in working (needs `GOOGLE_CLIENT_ID` on API)
- [ ] Netlify env: `VITE_AIBC_API=https://api.aibcmedia.com`
- [ ] DNS pointed to Netlify

## Extension

- [x] Prod API + portal defaults
- [x] README + CHANGELOG for Marketplace
- [x] Publisher ID → `aibcdev`
- [x] `npm run build && npm run package` — VSIX ready
- [ ] Test install VSIX locally
- [ ] VS Code publisher + Open VSX namespace created
- [ ] `npm run publish:all` → **MARKETPLACE.md**

## API

- [x] Google OAuth flow coded
- [x] Stripe checkout + webhook coded
- [x] Docker + DigitalOcean config
- [x] DigitalOcean Droplet deployed
- [x] DNS `api` → Droplet IP
- [x] `curl https://api.aibcmedia.com/health` passes

## Order

1. Fill env vars → **ENV.md**
2. ~~Deploy API (DigitalOcean) + DNS~~ **Done**
3. Test API + Google login + Stripe
4. Deploy website (Netlify) — connect GitHub repo
5. Publish extension → **MARKETPLACE.md**

**Do not deploy website until API is live** — sign-in and payments need the API.
