#!/usr/bin/env bash
# Deploy aibc API to Fly.io. Requires: fly auth login
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fly auth whoami

if ! fly apps list 2>/dev/null | grep -q '^aibc-api'; then
  echo "[fly] Creating app aibc-api..."
  fly apps create aibc-api --org personal 2>/dev/null || fly apps create aibc-api
fi

if ! fly volumes list -a aibc-api 2>/dev/null | grep -q aibc_data; then
  echo "[fly] Creating volume..."
  fly volumes create aibc_data --region lhr --size 1 -a aibc-api -y
fi

echo "[fly] Setting secrets..."
# shellcheck disable=SC2046
fly secrets set $(grep -v '^#' .env.fly | grep -v '^$' | xargs) -a aibc-api

echo "[fly] Deploying..."
fly deploy -a aibc-api

echo "[fly] Adding TLS cert for api.aibcmedia.com..."
fly certs add api.aibcmedia.com -a aibc-api || true
fly certs show api.aibcmedia.com -a aibc-api 2>/dev/null || fly certs list -a aibc-api

echo ""
echo "[fly] Check: curl https://api.aibcmedia.com/health"
echo "[fly] Add DNS CNAME: api -> $(fly status -a aibc-api 2>/dev/null | rg -o 'aibc-api\.fly\.dev' || echo 'aibc-api.fly.dev')"
