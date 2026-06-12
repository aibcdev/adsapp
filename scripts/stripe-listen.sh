#!/usr/bin/env bash
# Forward Stripe test webhooks to local API while developing.
# Run in a separate terminal alongside: npm run dev:api
set -euo pipefail
stripe listen --forward-to localhost:8787/v1/webhooks/stripe
