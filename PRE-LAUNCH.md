# Pre-launch checklist

Finish these **before** Netlify deploy, Fly deploy, or VS Code publish.

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
- [ ] `npm run build && npm run package` — test VSIX locally
- [ ] F5 smoke test in Cursor
- [ ] VS Code publisher created + PAT
- [ ] `npm run publish:marketplace`

## API

- [x] Google OAuth flow coded
- [x] Stripe checkout + webhook coded
- [x] Docker + Fly config
- [ ] Fly app deployed
- [ ] DNS `api` → Fly
- [ ] Live Stripe webhook secret on Fly
- [ ] `curl https://api.aibcmedia.com/health` passes

## Order

1. Fill env vars → **ENV.md**
2. Deploy API (Fly) + DNS
3. Test API + Google login + Stripe
4. Deploy website (Netlify) — connect GitHub repo
5. Publish extension (Marketplace)

**Do not deploy website until API is live** — sign-in and payments need the API.
