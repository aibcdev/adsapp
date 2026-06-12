#!/usr/bin/env bash
# Forward Stripe test webhooks to local API.
# Run alongside: npm run dev:api
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
bash "$ROOT/scripts/sync-stripe-env.sh" >/dev/null
echo "[stripe] Listening → localhost:8787/v1/webhooks/stripe"
echo "[stripe] Keep this terminal open while testing deposits."
stripe listen \
  --forward-to localhost:8787/v1/webhooks/stripe \
  -e checkout.session.completed
