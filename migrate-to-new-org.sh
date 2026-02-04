#!/bin/bash

# 🚀 Clean Migration to New GitHub Organization
# This script creates a fresh git history without any secrets

set -e  # Exit on any error

echo "🔒 SECURE MIGRATION TO NEW ORG"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if new repo URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: New repository URL required${NC}"
    echo ""
    echo "Usage: ./migrate-to-new-org.sh git@github.com:YOUR-ORG/bunch.git"
    echo ""
    exit 1
fi

NEW_REPO_URL=$1

echo -e "${YELLOW}⚠️  IMPORTANT: Before running this script:${NC}"
echo "1. Generate NEW JWT secrets:"
echo "   openssl rand -hex 64  # Run twice"
echo ""
echo "2. Update Railway environment variables with new JWT secrets"
echo ""
echo "3. Verify old MongoDB cluster is deleted/inaccessible"
echo ""
echo "4. Create empty repository at: $NEW_REPO_URL"
echo ""
read -p "Have you completed all the above? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Migration cancelled. Complete the steps above first.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Starting clean migration...${NC}"
echo ""

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Creating clean copy in: $TEMP_DIR"

# Copy all files except .git
rsync -av --progress \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude 'build' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.DS_Store' \
    ./ "$TEMP_DIR/"

cd "$TEMP_DIR"

# Initialize fresh git repository
echo ""
echo "🆕 Initializing fresh git repository..."
git init
git branch -M main

# Add all files
echo ""
echo "📦 Adding files..."
git add -A

# Create initial commit
echo ""
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Clean codebase for public release

- Full-stack prediction market chat application
- Frontend: React + TypeScript + Vite
- Backend: NestJS + MongoDB + Socket.IO
- Admin: Next.js dashboard
- No sensitive data or secrets in history

This is a fresh start with clean git history."

# Add remote
echo ""
echo "🔗 Adding remote repository..."
git remote add origin "$NEW_REPO_URL"

# Push to new repository
echo ""
echo "🚀 Pushing to new repository..."
git push -u origin main

echo ""
echo -e "${GREEN}✅ MIGRATION COMPLETE!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update Railway (Backend + Frontend):"
echo "   - Settings → GitHub Repo → Select new repository"
echo "   - Verify root directories: /backend and /frontend"
echo ""
echo "2. Update Vercel (Admin Panel):"
echo "   - Settings → Git → Connect to new repository"
echo "   - Set root directory: /admin"
echo ""
echo "3. Verify Deployments:"
echo "   - Backend API: curl https://your-backend.railway.app/api/health"
echo "   - Frontend: Visit your frontend URL"
echo "   - Admin: Visit your admin URL"
echo ""
echo "4. Test Authentication:"
echo "   - Users will need to re-login (JWT secrets changed)"
echo "   - Test wallet login"
echo "   - Test Twitter login"
echo ""
echo "5. Original Repository:"
echo "   - Archive it: Settings → Danger Zone → Archive"
echo "   - Or keep as private backup"
echo "   - Delete after 30 days if not needed"
echo ""
echo -e "${GREEN}🎉 Your code is now in the new organization with clean history!${NC}"
echo ""
echo "Temporary clean copy location: $TEMP_DIR"
echo "(Will be automatically deleted on next reboot)"
