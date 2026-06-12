#!/usr/bin/env bash
# Fix Stripe CLI live-mode restriction.
#
# Why: `stripe login` (browser) stores rk_live_* — CLI-only permissions, no webhooks.
# Fix: paste your FULL live secret key (sk_live_*) once.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "Stripe CLI uses a LIMITED live key (rk_live) after browser login."
echo "Webhook setup needs the FULL secret key (sk_live)."
echo ""
echo "1. Open: https://dashboard.stripe.com/apikeys"
echo "2. Sign in as watchaibc@gmail.com"
echo "3. Turn OFF 'Test mode' (top right)"
echo "4. Click 'Reveal live key' on Secret key"
echo "5. Paste it below:"
echo ""

read -rsp "sk_live key: " LIVE_SK
echo ""

if [[ ! "$LIVE_SK" == sk_live_* ]]; then
  echo "Error: must start with sk_live_"
  exit 1
fi

touch .env
grep -q '^STRIPE_LIVE_SECRET_KEY=' .env \
  && perl -i -pe "s/^STRIPE_LIVE_SECRET_KEY=.*/STRIPE_LIVE_SECRET_KEY=${LIVE_SK}/" .env \
  || echo "STRIPE_LIVE_SECRET_KEY=${LIVE_SK}" >> .env

echo "[stripe] Saved STRIPE_LIVE_SECRET_KEY to .env"
bash "$ROOT/scripts/sync-stripe-env.sh"
