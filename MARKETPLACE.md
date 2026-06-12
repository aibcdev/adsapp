# VS Code Marketplace — step by step

Do this once. Takes ~15 minutes.

## 1. Create a Microsoft account

Use **watchaibc@gmail.com** (or your business email).

Go to: https://login.live.com/

## 2. Create a publisher

1. Open https://marketplace.visualstudio.com/manage
2. Sign in with Microsoft
3. Click **Create publisher**
4. Suggested ID: `aibcdev` (must be unique globally)
5. Display name: **aibc**

## 3. Update the extension package

Edit `packages/extension/package.json`:

```json
"publisher": "aibcdev"
```

(Must match your publisher ID exactly.)

## 4. Create a Personal Access Token (PAT)

1. Still on https://marketplace.visualstudio.com/manage
2. Click your publisher name → **Personal Access Tokens**
3. **New Token**
   - Name: `vsce-publish`
   - Expiration: 90 days (or custom)
   - Scope: **Marketplace** → **Manage**
4. Copy the token — you only see it once

## 5. Log in from your machine

```bash
cd /Users/akeemojuko/Workspace/flux/packages/extension
npx vsce login aibcdev
```

Paste the PAT when prompted.

## 6. Publish

From repo root:

```bash
npm run build
npm run publish:marketplace
```

First publish may take a few minutes to appear on the store.

## 7. Extension URL

After publish:

`https://marketplace.visualstudio.com/items?itemName=aibcdev.aibc`

Update the link in `packages/portal/src/pages/LandingPage.tsx` if publisher ID differs.

## 8. Cursor / VSCodium (optional)

Also publish to OpenVSX:

1. https://open-vsx.org/ — sign in with GitHub
2. Link your namespace to publisher `aibcdev`
3. `npm run publish:openvsx`

## Before you submit

- [ ] Replace placeholder GitHub URLs in `package.json` if needed
- [ ] Add 1–3 screenshots to `packages/extension/` (optional but helps approval)
- [ ] Privacy policy live at `https://aibcmedia.com/privacy`

## Support

Marketplace docs: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
