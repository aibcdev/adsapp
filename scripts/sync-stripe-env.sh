#!/usr/bin/env bash
# Sync Stripe keys and webhooks. Uses full secret keys (sk_*), not CLI OAuth keys (rk_*).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v stripe >/dev/null 2>&1; then
  echo "Install Stripe CLI: brew install stripe/stripe-cli/stripe"
  exit 1
fi

# Load optional live secret from .env (never commit this file)
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

TEST_SK=$(grep test_mode_api_key ~/.config/stripe/config.toml 2>/dev/null | sed "s/.*= '//;s/'$//" || true)
if [[ -z "$TEST_SK" || "$TEST_SK" != sk_test_* ]]; then
  echo "[stripe] Run: stripe login   (then npm run stripe:sync again)"
  exit 1
fi

LOCAL_WHSEC=$(stripe listen --print-secret -e checkout.session.completed 2>/dev/null | tail -1)
WEBHOOK_URL="https://api.aibcmedia.com/v1/webhooks/stripe"
API_KEY_FLAG=(--api-key "$TEST_SK")

ensure_webhook() {
  local mode=$1 # test|live
  local key=$2
  local existing
  existing=$(curl -s -u "${key}:" "https://api.stripe.com/v1/webhook_endpoints?limit=100" \
    | python3 -c "
import sys, json
mode = '${mode}' == 'live'
for w in json.load(sys.stdin).get('data', []):
    if w.get('url') == '${WEBHOOK_URL}' and w.get('livemode') == mode:
        print(w['id'])
        break
")
  if [[ -n "$existing" ]]; then
    echo "[stripe] ${mode} webhook exists: $existing"
    return
  fi
  local live_flag=()
  [[ "$mode" == "live" ]] && live_flag=(--live)
  local created
  created=$(stripe webhook_endpoints create "${live_flag[@]}" --api-key "$key" \
    --url "$WEBHOOK_URL" \
    -d "enabled_events[0]=checkout.session.completed" 2>&1)
  local id secret
  id=$(echo "$created" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)
  secret=$(echo "$created" | python3 -c "import sys,json; print(json.load(sys.stdin).get('secret',''))" 2>/dev/null || true)
  if [[ -n "$id" ]]; then
    echo "[stripe] Created ${mode} webhook: $id"
    if [[ -n "$secret" ]]; then
      if [[ "$mode" == "live" ]]; then
        echo "STRIPE_LIVE_WEBHOOK_SECRET=$secret"
      else
        echo "STRIPE_TEST_WEBHOOK_SECRET=$secret"
      fi
    fi
  else
    echo "$created" >&2
  fi
}

# Local .env — test key + listen secret for dev
touch .env
grep -q '^STRIPE_SECRET_KEY=' .env \
  && perl -i -pe "s/^STRIPE_SECRET_KEY=.*/STRIPE_SECRET_KEY=${TEST_SK}/" .env \
  || echo "STRIPE_SECRET_KEY=${TEST_SK}" >> .env
grep -q '^STRIPE_WEBHOOK_SECRET=' .env \
  && perl -i -pe "s/^STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=${LOCAL_WHSEC}/" .env \
  || echo "STRIPE_WEBHOOK_SECRET=${LOCAL_WHSEC}" >> .env

ensure_webhook test "$TEST_SK"

LIVE_SK="${STRIPE_LIVE_SECRET_KEY:-}"
PROD_WHSEC=""
if [[ -n "$LIVE_SK" && "$LIVE_SK" == sk_live_* ]]; then
  echo "[stripe] Full live secret key found — creating live webhook..."
  out=$(ensure_webhook live "$LIVE_SK" 2>&1) || true
  echo "$out"
  PROD_WHSEC=$(echo "$out" | grep STRIPE_LIVE_WEBHOOK_SECRET | cut -d= -f2- || true)
  LIVE_STRIPE_KEY="$LIVE_SK"
else
  echo "[stripe] No STRIPE_LIVE_SECRET_KEY in .env — using test keys for production template."
  echo "[stripe] To fix live: add STRIPE_LIVE_SECRET_KEY from https://dashboard.stripe.com/apikeys"
  LIVE_STRIPE_KEY="$TEST_SK"
  PROD_WHSEC=$(curl -s -u "${TEST_SK}:" "https://api.stripe.com/v1/webhook_endpoints?limit=10" \
    | python3 -c "
import sys,json
for w in json.load(sys.stdin).get('data',[]):
  if w.get('url')=='${WEBHOOK_URL}' and not w.get('livemode'):
    print('whsec_Q48Jmolv7yxtagmad9i924DgsXhntzCM')  # fallback; rotate via dashboard if needed
    break
" 2>/dev/null || echo "whsec_Q48Jmolv7yxtagmad9i924DgsXhntzCM")
fi

# Resolve prod test webhook secret from API if possible
if [[ -z "$PROD_WHSEC" || "$PROD_WHSEC" == whsec_Q48* ]]; then
  PROD_WHSEC=$(curl -s -u "${TEST_SK}:" "https://api.stripe.com/v1/webhook_endpoints?limit=10" \
    | python3 -c "
import sys,json
for w in json.load(sys.stdin).get('data',[]):
  if w.get('url')=='${WEBHOOK_URL}':
    print(w.get('secret','') or '')
    break
" 2>/dev/null || true)
fi
[[ -z "$PROD_WHSEC" ]] && PROD_WHSEC="whsec_Q48Jmolv7yxtagmad9i924DgsXhntzCM"

# Google OAuth from .env (if set)
GOOGLE_ID=""
GOOGLE_SECRET=""
if [[ -f .env ]]; then
  GOOGLE_ID=$(grep -E '^GOOGLE_CLIENT_ID=' .env | cut -d= -f2- | tr -d '"' || true)
  GOOGLE_SECRET=$(grep -E '^GOOGLE_CLIENT_SECRET=' .env | cut -d= -f2- | tr -d '"' || true)
fi
if [[ -n "$LIVE_SK" && -f .env ]]; then
  LIVE_WHSEC=$(grep -E '^STRIPE_LIVE_WEBHOOK_SECRET=' .env | cut -d= -f2- || true)
  [[ -n "$LIVE_WHSEC" ]] && PROD_WHSEC="$LIVE_WHSEC"
fi

cat > .env.fly << EOF
# fly secrets set \$(grep -v '^#' .env.fly | xargs)
AIBC_PUBLIC_URL=https://api.aibcmedia.com
AIBC_PORTAL_URL=https://aibcmedia.com
AIBC_CORS_ORIGINS=https://aibcmedia.com,https://www.aibcmedia.com
STRIPE_SECRET_KEY=${LIVE_STRIPE_KEY}
STRIPE_WEBHOOK_SECRET=${PROD_WHSEC}
GOOGLE_CLIENT_ID=${GOOGLE_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_SECRET}
EOF

echo "[stripe] .env updated (test + local listen secret)"
echo "[stripe] .env.fly updated"
echo "[stripe] Account: AIBC acct_1ScW4SJelDe3AJZ5"
