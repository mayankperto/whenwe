#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# WhenWe — Direct Vercel Deployment (no Git / no GitHub required)
# Usage: bash vercel-deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BOLD="\033[1m"; GREEN="\033[32m"; BLUE="\033[34m"
YELLOW="\033[33m"; RED="\033[31m"; RESET="\033[0m"

step() { echo -e "\n${BOLD}${BLUE}▶ $*${RESET}"; }
ok()   { echo -e "${GREEN}✓ $*${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $*${RESET}"; }
die()  { echo -e "${RED}✗ $*${RESET}" >&2; exit 1; }

echo -e "\n${BOLD}  WhenWe → Vercel (no-Git direct deploy)${RESET}\n"

# ── 0. Preflight ──────────────────────────────────────────────────────────────
step "0/4  Preflight"

# Install Vercel CLI if missing
if ! command -v vercel &>/dev/null; then
  warn "Vercel CLI not found — installing globally..."
  npm install -g vercel
  ok "Vercel CLI installed: $(vercel --version)"
else
  ok "Vercel CLI: $(vercel --version)"
fi

# Must be logged in
if ! vercel whoami &>/dev/null; then
  echo ""
  echo -e "${YELLOW}You need to log into Vercel first. Launching browser…${RESET}"
  vercel login
fi
VERCEL_USER=$(vercel whoami)
ok "Logged in as: $VERCEL_USER"

# ── 1. Resolve Turso credentials ──────────────────────────────────────────────
step "1/4  Resolving Turso credentials"

# Try loading from .env.local first, then .env
ENV_FILE=""
for f in .env.local .env; do
  if [ -f "$f" ] && grep -q "TURSO_DATABASE_URL" "$f" 2>/dev/null; then
    # Only use if the value is not a placeholder
    CANDIDATE=$(grep "^TURSO_DATABASE_URL=" "$f" | cut -d= -f2- | tr -d '"' | tr -d "'")
    if [[ "$CANDIDATE" == libsql://* ]]; then
      ENV_FILE="$f"
      break
    fi
  fi
done

if [ -n "$ENV_FILE" ]; then
  # Source the file safely: export only the two keys we need
  TURSO_DATABASE_URL=$(grep "^TURSO_DATABASE_URL=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
  TURSO_AUTH_TOKEN=$(grep "^TURSO_AUTH_TOKEN=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
  ok "Loaded credentials from $ENV_FILE"
else
  warn "No Turso credentials found in .env / .env.local."
  echo ""
  echo -e "  Find these at ${BLUE}https://app.turso.tech${RESET} → your DB → Connect"
  echo ""
  read -rp "  TURSO_DATABASE_URL (libsql://...): " TURSO_DATABASE_URL
  read -rsp "  TURSO_AUTH_TOKEN: " TURSO_AUTH_TOKEN
  echo ""

  # Basic validation
  [[ "$TURSO_DATABASE_URL" == libsql://* ]] || die "TURSO_DATABASE_URL must start with libsql://"
  [ -n "$TURSO_AUTH_TOKEN" ] || die "TURSO_AUTH_TOKEN cannot be empty"

  # Persist to .env.local for next time
  cat > .env.local <<EOF
# Auto-saved by vercel-deploy.sh
TURSO_DATABASE_URL=$TURSO_DATABASE_URL
TURSO_AUTH_TOKEN=$TURSO_AUTH_TOKEN
EOF
  ok "Saved to .env.local for future runs"
fi

ok "TURSO_DATABASE_URL: $TURSO_DATABASE_URL"
ok "TURSO_AUTH_TOKEN:   ${TURSO_AUTH_TOKEN:0:12}… (${#TURSO_AUTH_TOKEN} chars)"

# ── 2. Link project to Vercel ─────────────────────────────────────────────────
step "2/4  Linking project to Vercel"

# If already linked, skip
if [ -f ".vercel/project.json" ]; then
  PROJECT_ID=$(python3 -c "import json,sys; d=json.load(open('.vercel/project.json')); print(d['projectId'])" 2>/dev/null || echo "")
  if [ -n "$PROJECT_ID" ]; then
    warn "Already linked (projectId: $PROJECT_ID) — skipping link step"
  else
    vercel link --yes
  fi
else
  vercel link --yes
fi
ok "Project linked"

# ── 3. Push environment variables ─────────────────────────────────────────────
step "3/4  Pushing environment variables to Vercel"

for env_target in production preview development; do
  # Remove old values silently, then set fresh ones
  printf '%s' "$TURSO_DATABASE_URL" | vercel env add TURSO_DATABASE_URL "$env_target" --force 2>/dev/null \
    || (vercel env rm TURSO_DATABASE_URL "$env_target" --yes 2>/dev/null; \
        printf '%s' "$TURSO_DATABASE_URL" | vercel env add TURSO_DATABASE_URL "$env_target")

  printf '%s' "$TURSO_AUTH_TOKEN" | vercel env add TURSO_AUTH_TOKEN "$env_target" --force 2>/dev/null \
    || (vercel env rm TURSO_AUTH_TOKEN "$env_target" --yes 2>/dev/null; \
        printf '%s' "$TURSO_AUTH_TOKEN" | vercel env add TURSO_AUTH_TOKEN "$env_target")

  ok "$env_target → TURSO_DATABASE_URL + TURSO_AUTH_TOKEN set"
done

# ── 4. Deploy to production ───────────────────────────────────────────────────
step "4/4  Deploying to production (no Git required)"

echo ""
DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1 | tee /dev/stderr)

# Extract the final .vercel.app URL
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https://[a-zA-Z0-9._-]+\.vercel\.app' \
  | grep -v 'vercel\.app/settings' | tail -1)

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}${GREEN}  WhenWe is LIVE!${RESET}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${BOLD}Live URL:${RESET}   ${BLUE}${DEPLOY_URL}${RESET}"
echo -e "  ${BOLD}Dashboard:${RESET}  ${BLUE}https://vercel.com/$VERCEL_USER${RESET}"
echo ""
echo -e "  ${BOLD}To add a custom domain:${RESET}"
echo -e "  ${YELLOW}vercel domains add yourdomain.com${RESET}"
echo ""
