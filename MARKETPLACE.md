# Marketplace submission — aibc extension

**One extension. Two stores.** That covers VS Code, Cursor, Windsurf, and VSCodium.

| Store | Covers |
|-------|--------|
| **VS Code Marketplace** | VS Code, Cursor (default), Windsurf |
| **Open VSX** | VSCodium, some Linux IDEs |

There is **no separate Cursor store**. Publish to both below and you're done.

---

## Before you submit (must be live)

- [x] API live — `curl https://api.aibcmedia.com/health`
- [ ] Website live on Netlify — `https://aibcmedia.com`
- [ ] Privacy page live — `https://aibcmedia.com/privacy` *(stores check this)*
- [x] VSIX builds — `npm run package` → `packages/extension/aibc-0.1.0.vsix`
- [ ] Test install locally — `code --install-extension packages/extension/aibc-0.1.0.vsix`
- [ ] Sign-in works against production API

**Do Netlify first.** Stores reject extensions whose privacy URL is down.

---

## Part 1 — VS Code Marketplace (~10 min)

### 1. Create publisher

1. Sign in: https://marketplace.visualstudio.com/manage (use **watchaibc@gmail.com**)
2. **Create publisher**
   - ID: `aibcdev` *(must match `package.json`)*
   - Name: **aibc**

### 2. Create token

1. Publisher → **Personal Access Tokens** → **New Token**
2. Name: `vsce-publish`
3. Scope: **Marketplace → Manage**
4. Copy token *(shown once)*

### 3. Log in on your Mac

```bash
cd ~/Workspace/flux/packages/extension
npx vsce login aibcdev
```

Paste the token.

### 4. Publish

```bash
cd ~/Workspace/flux
npm run publish:marketplace
```

### 5. Check listing

https://marketplace.visualstudio.com/items?itemName=aibcdev.aibc

First publish can take 5–15 minutes to appear.

---

## Part 2 — Open VSX (~10 min)

For VSCodium and other Open VSX–based editors.

### 1. Create namespace

1. Sign in: https://open-vsx.org/ (GitHub — use **aibcdev** org account if possible)
2. **User Settings → Access Tokens** → create token
3. **Namespaces → Create** → name: `AIBCMedia` *(must match publisher in package.json)*

### 2. Log in

```bash
cd ~/Workspace/flux/packages/extension
npx ovsx login
```

Paste Open VSX token.

### 3. Publish

```bash
cd ~/Workspace/flux
npm run publish:openvsx
```

### 4. Check listing

https://open-vsx.org/extension/AIBCMedia/aibc

---

## Publish both at once

After both logins are done:

```bash
cd ~/Workspace/flux
npm run publish:all
```

---

## Install commands (for your website)

```bash
# VS Code / Cursor / Windsurf
code --install-extension AIBCMedia.aibc

# VSCodium
codium --install-extension aibcdev.aibc
```

---

## Optional (helps approval)

- Add 1–3 screenshots (1280×720) under `packages/extension/media/` and reference in README
- Add a short demo GIF

---

## Updates later

Bump version in `packages/extension/package.json` and `CHANGELOG.md`, then:

```bash
npm run publish:all
```

---

## Support links in listing

| Field | URL |
|-------|-----|
| Homepage | https://aibcmedia.com |
| Privacy | https://aibcmedia.com/privacy |
| Repository | https://github.com/aibcdev/adsapp |
| Support email | watchaibc@gmail.com |
