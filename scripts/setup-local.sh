#!/bin/bash

# Bunch Local Setup Script
# This script sets up the development environment

set -e

echo "🚀 Bunch Local Setup"
echo "=========================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 20+ and try again."
  exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed. Please install npm and try again."
  exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Start Docker services
echo "📦 Starting Docker services (MongoDB + Redis)..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if MongoDB is ready
echo "🔍 Checking MongoDB..."
if docker exec bunch-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
  echo "✅ MongoDB is ready"
else
  echo "⚠️  MongoDB might not be fully ready yet, but continuing..."
fi

# Check if Redis is ready
echo "🔍 Checking Redis..."
if docker exec bunch-redis redis-cli ping > /dev/null 2>&1; then
  echo "✅ Redis is ready"
else
  echo "⚠️  Redis might not be fully ready yet, but continuing..."
fi

echo ""

# Setup backend
echo "🔧 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
  echo "📝 Creating backend .env file..."
  cat > .env << 'EOF'
# Environment
NODE_ENV=development

# Server
PORT=3000
API_PREFIX=api

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/bunch?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=poly-banter-super-secret-key-dev-only
JWT_EXPIRES_IN=7d

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:5173

# Chrome Extension (production only)
EXTENSION_ID=

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
EOF
  echo "✅ Backend .env created"
else
  echo "✅ Backend .env already exists"
fi

if [ ! -d "node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  npm install
else
  echo "✅ Backend dependencies already installed"
fi

cd ..
echo ""

# Setup frontend
echo "🔧 Setting up frontend..."
cd frontend

if [ ! -f ".env" ]; then
  echo "📝 Creating frontend .env file..."
  cat > .env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# Environment
VITE_ENV=development
EOF
  echo "✅ Frontend .env created"
else
  echo "✅ Frontend .env already exists"
fi

if [ ! -d "node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  npm install
else
  echo "✅ Frontend dependencies already installed"
fi

cd ..
echo ""

# Summary
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open Chrome and load the extension:"
echo "   - Go to chrome://extensions/"
echo "   - Enable 'Developer mode'"
echo "   - Click 'Load unpacked'"
echo "   - Select the 'frontend/dist' folder"
echo ""
echo "4. Click the extension icon to open the side panel"
echo ""
echo "🔗 Useful URLs:"
echo "   Backend API: http://localhost:3000/api"
echo "   Frontend Dev: http://localhost:5173"
echo "   MongoDB: mongodb://admin:password@localhost:27017"
echo "   Redis: localhost:6379"
echo ""
echo "📚 Documentation:"
echo "   Quick Start: ./QUICK_DEPLOY.md"
echo "   Full Guide: ./DEPLOYMENT_GUIDE.md"
echo ""
echo "Happy coding! 🚀"

