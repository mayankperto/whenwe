#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# WhenWe — Full Automated Deployment Script
# Requires: git, node/npm, gh (GitHub CLI), turso CLI, vercel CLI
# Run once from the project root: bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
BOLD="\033[1m"
GREEN="\033[32m"
BLUE="\033[34m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

step()  { echo -e "\n${BOLD}${BLUE}▶ $*${RESET}"; }
ok()    { echo -e "${GREEN}✓ $*${RESET}"; }
warn()  { echo -e "${YELLOW}⚠ $*${RESET}"; }
die()   { echo -e "${RED}✗ $*${RESET}" >&2; exit 1; }

echo -e "${BOLD}"
echo "  ██╗    ██╗██╗  ██╗███████╗███╗   ██╗██╗    ██╗███████╗"
echo "  ██║    ██║██║  ██║██╔════╝████╗  ██║██║    ██║██╔════╝"
echo "  ██║ █╗ ██║███████║█████╗  ██╔██╗ ██║██║ █╗ ██║█████╗  "
echo "  ██║███╗██║██╔══██║██╔══╝  ██║╚██╗██║██║███╗██║██╔══╝  "
echo "  ╚███╔███╔╝██║  ██║███████╗██║ ╚████║╚███╔███╔╝███████╗"
echo "   ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝ ╚══╝╚══╝ ╚══════╝"
echo -e "${RESET}"
echo -e "  ${BOLD}Full Automated Deployment → GitHub + Turso + Vercel${RESET}"
echo ""

# ── 0. Preflight checks ───────────────────────────────────────────────────────
step "0/5  Preflight checks"

for cmd in git node npm gh turso vercel; do
  if ! command -v "$cmd" &>/dev/null; then
    case "$cmd" in
      gh)
        die "GitHub CLI not found.\n  Install: https://cli.github.com\n  Then run: gh auth login"
        ;;
      turso)
        die "Turso CLI not found.\n  Install: curl -sSfL https://get.tur.so/install.sh | bash\n  Then run: turso auth login"
        ;;
      vercel)
        die "Vercel CLI not found.\n  Install: npm install -g vercel\n  Then run: vercel login"
        ;;
      *)
        die "$cmd is not installed."
        ;;
    esac
  fi
  ok "$cmd found: $(command -v $cmd)"
done

# Check auth for each service
if ! gh auth status &>/dev/null; then
  die "Not logged into GitHub CLI.\n  Run: gh auth login"
fi
ok "GitHub CLI authenticated"

if ! turso auth status &>/dev/null; then
  die "Not logged into Turso.\n  Run: turso auth login"
fi
ok "Turso authenticated"

if ! vercel whoami &>/dev/null; then
  die "Not logged into Vercel.\n  Run: vercel login"
fi
VERCEL_USER=$(vercel whoami 2>/dev/null)
ok "Vercel authenticated as: $VERCEL_USER"

# ── 1. GitHub — create repo & push ───────────────────────────────────────────
step "1/5  GitHub — creating repository and pushing code"

REPO_NAME="whenwe"
GH_USER=$(gh api user --jq '.login')
ok "GitHub user: $GH_USER"

# Check if repo already exists
if gh repo view "$GH_USER/$REPO_NAME" &>/dev/null; then
  warn "Repo '$GH_USER/$REPO_NAME' already exists — skipping creation."
else
  gh repo create "$REPO_NAME" \
    --public \
    --description "WhenWe — Beautiful team scheduling. The anti-Doodle." \
    --source=. \
    --remote=origin \
    --push
  ok "Repository created: https://github.com/$GH_USER/$REPO_NAME"
fi

# Make sure we're on main and push
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  git branch -M main
fi

git remote set-url origin "https://github.com/$GH_USER/$REPO_NAME.git" 2>/dev/null || true
git push -u origin main
ok "Code pushed to GitHub"

GITHUB_URL="https://github.com/$GH_USER/$REPO_NAME"

# ── 2. Turso — create DB, get credentials, push schema ───────────────────────
step "2/5  Turso — creating database"

DB_NAME="whenwe-prod"

# Create DB (idempotent — turso exits 0 if it already exists)
if turso db show "$DB_NAME" &>/dev/null; then
  warn "Database '$DB_NAME' already exists — reusing it."
else
  turso db create "$DB_NAME" --wait
  ok "Database '$DB_NAME' created"
fi

# Retrieve credentials
TURSO_URL=$(turso db show "$DB_NAME" --url)
TURSO_TOKEN=$(turso db tokens create "$DB_NAME" --expiration none)
ok "Database URL: $TURSO_URL"
ok "Auth token obtained (${#TURSO_TOKEN} chars)"

# Push Prisma schema to Turso
step "2b/5  Pushing Prisma schema to Turso"
TURSO_DATABASE_URL="$TURSO_URL" TURSO_AUTH_TOKEN="$TURSO_TOKEN" \
  npx prisma db push --config=./prisma/prisma.config.ts --accept-data-loss
ok "Schema pushed to Turso"

# ── 3. Vercel — link project, set env vars, deploy ───────────────────────────
step "3/5  Vercel — linking project"

# Link to Vercel (creates .vercel/project.json)
# --yes accepts defaults: scope = personal account, framework = Next.js
vercel link --yes --project "$REPO_NAME" 2>&1 | grep -v "^$" || true
ok "Project linked to Vercel"

step "4/5  Vercel — setting environment variables"

# Set env vars for all three environments (production, preview, development)
for env_target in production preview development; do
  vercel env rm TURSO_DATABASE_URL "$env_target" --yes 2>/dev/null || true
  vercel env rm TURSO_AUTH_TOKEN   "$env_target" --yes 2>/dev/null || true

  echo "$TURSO_URL"   | vercel env add TURSO_DATABASE_URL "$env_target"
  echo "$TURSO_TOKEN" | vercel env add TURSO_AUTH_TOKEN   "$env_target"
done
ok "Environment variables set for production, preview, development"

step "5/5  Vercel — triggering production deployment"

# Deploy and capture the URL
DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract the production URL
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https://[a-z0-9.-]+\.vercel\.app' | tail -1)

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}${GREEN}  🎉  WhenWe is LIVE!${RESET}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${BOLD}Live URL:${RESET}      ${BLUE}${DEPLOY_URL}${RESET}"
echo -e "  ${BOLD}GitHub:${RESET}        ${BLUE}${GITHUB_URL}${RESET}"
echo -e "  ${BOLD}Turso DB:${RESET}      ${BLUE}https://app.turso.tech${RESET}"
echo -e "  ${BOLD}Vercel:${RESET}        ${BLUE}https://vercel.com/dashboard${RESET}"
echo ""
echo -e "  ${BOLD}Share with your team:${RESET}"
echo -e "  ${YELLOW}${DEPLOY_URL}/create${RESET}"
echo ""
echo -e "  ${BOLD}To add a custom domain:${RESET}"
echo -e "  vercel domains add yourdomain.com"
echo ""

# Save credentials locally for reference (gitignored)
cat > .env.local <<EOF
# Auto-generated by deploy.sh — DO NOT COMMIT
TURSO_DATABASE_URL=$TURSO_URL
TURSO_AUTH_TOKEN=$TURSO_TOKEN
EOF
ok ".env.local written for local dev against production DB"
