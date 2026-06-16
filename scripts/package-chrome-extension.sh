#!/usr/bin/env bash
# Build AIBC Chrome extension → dist/aibc-chrome-extension.zip
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT="$ROOT/packages/chrome-extension"
DIST="$ROOT/dist"
ICON_SRC="$ROOT/packages/extension/media/icon.png"

mkdir -p "$EXT/icons" "$DIST"

sips -z 16 16 "$ICON_SRC" --out "$EXT/icons/icon16.png" >/dev/null
sips -z 48 48 "$ICON_SRC" --out "$EXT/icons/icon48.png" >/dev/null
cp "$ICON_SRC" "$EXT/icons/icon128.png"

cat > "$EXT/config.js" <<'EOF'
const AIBC_API_BASE = "https://api.aibcmedia.com";
const AIBC_PORTAL_BASE = "https://aibcmedia.com";
EOF

ZIP="$DIST/aibc-chrome-extension.zip"
rm -f "$ZIP"
(
  cd "$EXT"
  zip -r "$ZIP" \
    manifest.json \
    background.js \
    bridge.js \
    sidepanel.html \
    sidepanel.js \
    config.js \
    icons/icon16.png \
    icons/icon48.png \
    icons/icon128.png \
    -x '*.DS_Store'
)

echo "✓ Chrome extension packaged"
echo "  Zip: $ZIP"
echo "  Upload: Chrome Developer Dashboard → Add new item"
