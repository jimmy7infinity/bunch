#!/bin/bash

# Grex Setup Verification Script
# Verifies that everything is configured correctly

set -e

echo "🔍 Grex Setup Verification"
echo "================================"
echo ""

ERRORS=0
WARNINGS=0

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to print success
print_success() {
  echo "✅ $1"
}

# Function to print error
print_error() {
  echo "❌ $1"
  ((ERRORS++))
}

# Function to print warning
print_warning() {
  echo "⚠️  $1"
  ((WARNINGS++))
}

echo "📦 Checking Prerequisites..."
echo ""

# Check Node.js
if command_exists node; then
  NODE_VERSION=$(node -v)
  print_success "Node.js $NODE_VERSION installed"
else
  print_error "Node.js not found. Please install Node.js 20+"
fi

# Check npm
if command_exists npm; then
  NPM_VERSION=$(npm -v)
  print_success "npm $NPM_VERSION installed"
else
  print_error "npm not found. Please install npm"
fi

# Check Docker
if command_exists docker; then
  if docker info > /dev/null 2>&1; then
    print_success "Docker is installed and running"
  else
    print_warning "Docker is installed but not running. Start Docker Desktop."
  fi
else
  print_error "Docker not found. Please install Docker Desktop"
fi

# Check git
if command_exists git; then
  GIT_VERSION=$(git --version | cut -d' ' -f3)
  print_success "Git $GIT_VERSION installed"
else
  print_warning "Git not found. You'll need it for deployment"
fi

echo ""
echo "📁 Checking Project Structure..."
echo ""

# Check backend
if [ -d "backend" ]; then
  print_success "Backend directory exists"
  
  if [ -f "backend/package.json" ]; then
    print_success "Backend package.json exists"
  else
    print_error "Backend package.json not found"
  fi
  
  if [ -d "backend/node_modules" ]; then
    print_success "Backend dependencies installed"
  else
    print_warning "Backend dependencies not installed. Run: cd backend && npm install"
  fi
  
  if [ -f "backend/env.example" ]; then
    print_success "Backend env.example exists"
  else
    print_warning "Backend env.example not found"
  fi
else
  print_error "Backend directory not found"
fi

# Check frontend
if [ -d "frontend" ]; then
  print_success "Frontend directory exists"
  
  if [ -f "frontend/package.json" ]; then
    print_success "Frontend package.json exists"
  else
    print_error "Frontend package.json not found"
  fi
  
  if [ -d "frontend/node_modules" ]; then
    print_success "Frontend dependencies installed"
  else
    print_warning "Frontend dependencies not installed. Run: cd frontend && npm install"
  fi
  
  if [ -f "frontend/env.example" ]; then
    print_success "Frontend env.example exists"
  else
    print_warning "Frontend env.example not found"
  fi
  
  if [ -f "frontend/public/manifest.json" ]; then
    print_success "Extension manifest.json exists"
  else
    print_error "Extension manifest.json not found"
  fi
else
  print_error "Frontend directory not found"
fi

echo ""
echo "🔧 Checking Configuration Files..."
echo ""

# Check Docker Compose
if [ -f "docker-compose.yml" ]; then
  print_success "docker-compose.yml exists"
else
  print_error "docker-compose.yml not found"
fi

# Check Railway config
if [ -f "railway.json" ]; then
  print_success "railway.json exists"
else
  print_warning "railway.json not found (needed for Railway deployment)"
fi

# Check scripts
if [ -f "scripts/setup-local.sh" ]; then
  print_success "setup-local.sh exists"
  if [ -x "scripts/setup-local.sh" ]; then
    print_success "setup-local.sh is executable"
  else
    print_warning "setup-local.sh is not executable. Run: chmod +x scripts/setup-local.sh"
  fi
else
  print_warning "setup-local.sh not found"
fi

if [ -f "scripts/build-production.sh" ]; then
  print_success "build-production.sh exists"
  if [ -x "scripts/build-production.sh" ]; then
    print_success "build-production.sh is executable"
  else
    print_warning "build-production.sh is not executable. Run: chmod +x scripts/build-production.sh"
  fi
else
  print_warning "build-production.sh not found"
fi

echo ""
echo "📚 Checking Documentation..."
echo ""

DOCS=("README.md" "START_DEPLOYMENT.md" "QUICK_DEPLOY.md" "DEPLOYMENT_GUIDE.md" "DEPLOYMENT_CHECKLIST.md" "DEPLOYMENT_SUMMARY.md")

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    print_success "$doc exists"
  else
    print_warning "$doc not found"
  fi
done

echo ""
echo "🎯 Verification Summary"
echo "======================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "🎉 Perfect! Everything is configured correctly."
  echo ""
  echo "✨ You're ready to:"
  echo "   1. Test locally: ./scripts/setup-local.sh"
  echo "   2. Deploy: Follow QUICK_DEPLOY.md"
  echo ""
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "✅ Good! Setup is mostly complete."
  echo "⚠️  $WARNINGS warning(s) found (non-critical)"
  echo ""
  echo "You can proceed with:"
  echo "   1. Test locally: ./scripts/setup-local.sh"
  echo "   2. Deploy: Follow QUICK_DEPLOY.md"
  echo ""
  exit 0
else
  echo "❌ $ERRORS error(s) found"
  echo "⚠️  $WARNINGS warning(s) found"
  echo ""
  echo "Please fix the errors above before proceeding."
  echo ""
  exit 1
fi

