#!/bin/bash

# Grex Production Build Script
# Builds the extension for production deployment

set -e

echo "🏗️  Grex Production Build"
echo "=============================="
echo ""

# Check if Railway URL is provided
if [ -z "$1" ]; then
  echo "❌ Error: Railway URL not provided"
  echo ""
  echo "Usage: ./scripts/build-production.sh <railway-url>"
  echo "Example: ./scripts/build-production.sh https://polybanter-production.up.railway.app"
  echo ""
  exit 1
fi

RAILWAY_URL=$1
echo "🔗 Railway URL: $RAILWAY_URL"
echo ""

# Navigate to frontend
cd frontend

# Create production environment file
echo "📝 Creating production environment..."
cat > .env.production << EOF
# API Configuration
VITE_API_URL=${RAILWAY_URL}/api
VITE_WS_URL=${RAILWAY_URL}

# Environment
VITE_ENV=production
EOF

echo "✅ Production environment created"
echo ""

# Build extension
echo "🔨 Building extension..."
npm run build:extension

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed!"
  exit 1
fi

echo ""

# Create distribution package
echo "📦 Creating distribution package..."
cd dist
VERSION=$(node -p "require('../public/manifest.json').version")
ZIP_NAME="polybanter-extension-v${VERSION}.zip"

if [ -f "../$ZIP_NAME" ]; then
  rm "../$ZIP_NAME"
fi

zip -r "../$ZIP_NAME" . > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Package created: $ZIP_NAME"
else
  echo "❌ Failed to create package"
  exit 1
fi

cd ../..
echo ""

# Summary
echo "✨ Production build complete!"
echo ""
echo "📦 Extension package: frontend/$ZIP_NAME"
echo "📁 Extension files: frontend/dist/"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Test the extension locally:"
echo "   - Go to chrome://extensions/"
echo "   - Enable 'Developer mode'"
echo "   - Click 'Load unpacked'"
echo "   - Select 'frontend/dist' folder"
echo ""
echo "2. Share with friends:"
echo "   - Send them: frontend/$ZIP_NAME"
echo "   - They can drag & drop it to chrome://extensions/"
echo ""
echo "3. Or publish to Chrome Web Store:"
echo "   - Upload frontend/$ZIP_NAME"
echo "   - See DEPLOYMENT_GUIDE.md for details"
echo ""
echo "🎉 Ready to deploy!"

