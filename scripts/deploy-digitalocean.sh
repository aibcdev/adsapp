#!/usr/bin/env bash
# Deploy API to a DigitalOcean Droplet (Docker + Caddy HTTPS).
#
# One-time on the Droplet (Ubuntu 22.04+):
#   curl -fsSL https://get.docker.com | sh
#   apt install -y docker-compose-plugin git
#
# Usage:
#   ./scripts/deploy-digitalocean.sh root@YOUR_DROPLET_IP
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: ./scripts/deploy-digitalocean.sh user@droplet-ip"
  echo ""
  echo "Before first deploy:"
  echo "  1. Create a Droplet on DigitalOcean (London region is fine)"
  echo "  2. Point DNS A record: api.aibcmedia.com -> droplet IP"
  echo "  3. Copy secrets: cp .env.fly deploy/digitalocean/.env"
  exit 1
fi

if [[ ! -f "$ROOT/deploy/digitalocean/.env" ]]; then
  if [[ -f "$ROOT/.env.fly" ]]; then
    cp "$ROOT/.env.fly" "$ROOT/deploy/digitalocean/.env"
    echo "[do] Copied .env.fly -> deploy/digitalocean/.env"
  else
    echo "Missing deploy/digitalocean/.env — run: cp .env.fly deploy/digitalocean/.env"
    exit 1
  fi
fi

echo "[do] Syncing to $TARGET..."
ssh "$TARGET" "mkdir -p ~/adsapp"
rsync -avz --exclude node_modules --exclude .git --exclude dist \
  "$ROOT/" "$TARGET:~/adsapp/"

echo "[do] Building and starting containers..."
ssh "$TARGET" "cd ~/adsapp/deploy/digitalocean && docker compose up -d --build"

echo ""
echo "[do] Done. Check: curl https://api.aibcmedia.com/health"
echo "[do] Logs: ssh $TARGET 'cd ~/adsapp/deploy/digitalocean && docker compose logs -f api'"
