#!/usr/bin/env bash
# List pending payout requests (requires AIBC_ADMIN_KEY).
set -euo pipefail

API="${AIBC_API_BASE:-https://api.aibcmedia.com}"
KEY="${AIBC_ADMIN_KEY:?Set AIBC_ADMIN_KEY}"

curl -sS "${API}/v1/admin/payouts?status=requested" \
  -H "Authorization: Bearer ${KEY}" \
  -H "Accept: application/json" | python3 -m json.tool
