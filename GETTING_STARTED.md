# Getting Started with PolyBanter Development

## Quick Start Guide

This document provides a practical, step-by-step guide to start building PolyBanter today.

---

## Phase 0: Pre-Development Setup (Day 1)

### 1. Development Environment Setup

**Install Required Tools:**
```bash
# Node.js 20+ (use nvm for version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Verify installations
node --version  # Should be v20.x.x
npm --version   # Should be v10.x.x

# Install pnpm (faster than npm, better for monorepos)
npm install -g pnpm

# Install Docker Desktop (for local MongoDB, Redis)
# Download from: https://www.docker.com/products/docker-desktop
```

**Install Development Tools:**
```bash
# VS Code extensions (recommended)
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-azuretools.vscode-docker
```

### 2. Project Repository Setup

**Initialize Git Repository:**
```bash
cd /Users/jimmyinfinity/Projects/poly_banter

# Initialize git if not already done
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Docker
docker-compose.override.yml
EOF

# Initial commit
git add .
git commit -m "Initial commit: Project structure and overview"
```

**Create GitHub Repository:**
```bash
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/poly_banter.git
git branch -M main
git push -u origin main
```

### 3. Project Structure Setup

**Create Monorepo Structure:**
```bash
# Create main directories
mkdir -p frontend/src
mkdir -p backend/src
mkdir -p shared/types

# Create package.json for workspace root
cat > package.json << 'EOF'
{
  "name": "poly-banter",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend",
    "shared"
  ],
  "scripts": {
    "dev": "concurrently \"pnpm --filter backend dev\" \"pnpm --filter frontend dev\"",
    "build": "pnpm --filter backend build && pnpm --filter frontend build",
    "test": "pnpm --filter backend test && pnpm --filter frontend test",
    "lint": "pnpm --filter backend lint && pnpm --filter frontend lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "prettier": "^3.1.1"
  }
}
EOF

# Install root dependencies
pnpm install
```

---

## Day 1-2: Backend Foundation

### Step 1: Initialize NestJS Backend

```bash
cd backend

# Initialize NestJS project
pnpm init
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
pnpm add -D @nestjs/cli @nestjs/schematics typescript @types/node ts-node

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true
  }
}
EOF

# Create basic NestJS structure
mkdir -p src/modules
mkdir -p src/common
mkdir -p src/config

# Create main.ts
cat > src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for Chrome extension
  app.enableCors({
    origin: ['chrome-extension://*'],
    credentials: true,
  });
  
  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();
EOF

# Create app.module.ts
cat > src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
EOF

# Update package.json scripts
cat > package.json << 'EOF'
{
  "name": "backend",
  "version": "0.1.0",
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "reflect-metadata": "^0.2.1",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@types/node": "^20.11.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
EOF

pnpm install
```

### Step 2: Set Up Docker for Local Development

```bash
cd /Users/jimmyinfinity/Projects/poly_banter

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: polybanter-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: polybanter
    volumes:
      - mongodb_data:/data/db
    networks:
      - polybanter-network

  redis:
    image: redis:7-alpine
    container_name: polybanter-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - polybanter-network

volumes:
  mongodb_data:
  redis_data:

networks:
  polybanter-network:
    driver: bridge
EOF

# Start services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### Step 3: Add Database & Essential Dependencies

```bash
cd backend

# Add MongoDB, Redis, and other essentials
pnpm add @nestjs/mongoose mongoose
pnpm add @nestjs/config
pnpm add ioredis
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm add bcrypt ethers
pnpm add -D @types/bcrypt @types/passport-jwt

# Create .env file
cat > .env << 'EOF'
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/polybanter?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Twitter OAuth (get from https://developer.twitter.com/)
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_CALLBACK_URL=http://localhost:3000/auth/twitter/callback

# OpenAI (get from https://platform.openai.com/)
OPENAI_API_KEY=

# App
FRONTEND_URL=chrome-extension://YOUR_EXTENSION_ID
EOF

# Create .env.example (for version control)
cp .env .env.example
# Clear sensitive values in .env.example
sed -i '' 's/=.*/=/' .env.example
```

---

## Day 2-3: Frontend Foundation

### Step 1: Initialize Vite + React + TypeScript

```bash
cd /Users/jimmyinfinity/Projects/poly_banter/frontend

# Initialize Vite project
pnpm create vite . --template react-ts

# Install dependencies
pnpm install

# Add essential dependencies
pnpm add socket.io-client
pnpm add zustand
pnpm add axios
pnpm add react-router-dom
pnpm add date-fns

# Add TailwindCSS
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configure Tailwind
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        // ... add all theme colors
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
    },
  },
  plugins: [],
}
EOF
```

### Step 2: Set Up Chrome Extension Structure

```bash
cd /Users/jimmyinfinity/Projects/poly_banter/frontend

# Create public directory for extension files
mkdir -p public/icons

# Create manifest.json
cat > public/manifest.json << 'EOF'
{
  "manifest_version": 3,
  "name": "PolyBanter",
  "version": "0.1.0",
  "description": "Social chat for Polymarket",
  "side_panel": {
    "default_path": "index.html"
  },
  "permissions": [
    "sidePanel",
    "storage",
    "notifications"
  ],
  "host_permissions": [
    "https://polymarket.com/*",
    "http://localhost:3000/*"
  ],
  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },
  "action": {
    "default_title": "Open PolyBanter"
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
EOF

# Create service worker
cat > public/service-worker.js << 'EOF'
// Service worker for Chrome extension
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

console.log('PolyBanter service worker loaded');
EOF

# Configure Vite for Chrome extension
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
EOF
```

### Step 3: Create Base UI Components

```bash
cd /Users/jimmyinfinity/Projects/poly_banter/frontend/src

# Create directory structure
mkdir -p components/ui/buttons
mkdir -p components/ui/inputs
mkdir -p components/ui/cards
mkdir -p components/ui/layout
mkdir -p styles
mkdir -p stores
mkdir -p services
mkdir -p types
mkdir -p hooks

# Create theme CSS
cat > styles/theme.css << 'EOF'
:root {
  --background: rgb(231, 229, 228);
  --foreground: rgb(30, 41, 59);
  --card: rgb(245, 245, 244);
  --card-foreground: rgb(30, 41, 59);
  --primary: rgb(99, 102, 241);
  --primary-foreground: rgb(255, 255, 255);
  --secondary: rgb(214, 211, 209);
  --secondary-foreground: rgb(75, 85, 99);
  --border: rgb(214, 211, 209);
  --radius: 1.25rem;
  
  --font-sans: Plus Jakarta Sans, sans-serif;
}

.dark {
  --background: rgb(30, 27, 24);
  --foreground: rgb(226, 232, 240);
  --card: rgb(44, 40, 37);
  --card-foreground: rgb(226, 232, 240);
  --primary: rgb(136, 128, 255);
  --primary-foreground: rgb(30, 27, 24);
  --secondary: rgb(58, 54, 51);
  --secondary-foreground: rgb(209, 213, 219);
  --border: rgb(58, 54, 51);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-border: var(--border);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  background: var(--background);
  color: var(--foreground);
}
EOF

# Create example Button component
cat > components/ui/buttons/PrimaryButton.tsx << 'EOF'
import React from 'react';

interface PrimaryButtonProps {
  variant?: 'selected' | 'deselected';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  variant = 'deselected',
  children,
  onClick,
  disabled = false,
  className = '',
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200';
  
  const variantClasses = {
    selected: 'bg-primary text-primary-foreground shadow-md',
    deselected: 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};
EOF
```

---

## Day 3-4: Core Features Setup

### Step 1: Set Up Authentication Module (Backend)

```bash
cd /Users/jimmyinfinity/Projects/poly_banter/backend

# Generate auth module
npx nest g module modules/auth
npx nest g controller modules/auth
npx nest g service modules/auth

# Generate users module
npx nest g module modules/users
npx nest g controller modules/users
npx nest g service modules/users
```

### Step 2: Create User Schema

```bash
cd /Users/jimmyinfinity/Projects/poly_banter/backend/src/modules/users

# Create schemas directory
mkdir schemas

# Create user.schema.ts (we'll populate this next)
```

### Step 3: Set Up WebSocket (Socket.IO)

```bash
cd /Users/jimmyinfinity/Projects/poly_banter/backend

# Add Socket.IO dependencies
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io

# Generate chat module with gateway
npx nest g module modules/chat
npx nest g gateway modules/chat/chat
npx nest g service modules/chat
```

---

## Recommended Development Order

### Week 1 Priority:
1. ✅ **Day 1-2:** Complete backend foundation (NestJS, MongoDB, Redis setup)
2. ✅ **Day 2-3:** Complete frontend foundation (Vite, React, Chrome extension setup)
3. **Day 3-4:** Implement basic authentication (wallet signature verification)
4. **Day 4-5:** Create user registration and login UI
5. **Day 5-7:** Set up WebSocket infrastructure and test real-time messaging

### Week 2 Priority:
1. Build global chat room
2. Implement message sending/receiving
3. Add message reactions
4. Create basic chat UI components
5. Test end-to-end chat flow

---

## Development Workflow

### Daily Development Routine:

```bash
# Terminal 1: Start Docker services
docker-compose up

# Terminal 2: Start backend
cd backend
pnpm dev

# Terminal 3: Start frontend
cd frontend
pnpm dev

# Terminal 4: Available for commands, testing, etc.
```

### Loading Extension in Chrome:

1. Build the extension:
   ```bash
   cd frontend
   pnpm build
   ```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `frontend/dist` folder
6. Click the extension icon to open side panel

### Hot Reload During Development:

```bash
# In frontend directory, run dev mode
pnpm dev

# After making changes, rebuild
pnpm build

# Then click "Reload" button on extension in chrome://extensions/
```

---

## Useful Commands

### Backend:
```bash
# Generate new module
npx nest g module modules/MODULE_NAME

# Generate controller
npx nest g controller modules/MODULE_NAME

# Generate service
npx nest g service modules/MODULE_NAME

# Run tests
pnpm test

# Lint
pnpm lint
```

### Frontend:
```bash
# Run dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm tsc --noEmit
```

### Docker:
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Reset databases (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

---

## Next Steps After Initial Setup

Once you have the foundation running:

1. **Implement User Schema** — Create the full user model with all fields from OVERVIEW.md
2. **Build Auth Flow** — Wallet signature verification and JWT generation
3. **Create Login UI** — Wallet connect and Twitter OAuth buttons
4. **Set Up WebSocket** — Real-time connection and room management
5. **Build Chat UI** — Message list, input, and basic styling
6. **Test End-to-End** — Register → Login → Send message → Receive message

---

## Troubleshooting

### MongoDB Connection Issues:
```bash
# Check if MongoDB is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB shell
docker exec -it polybanter-mongodb mongosh -u admin -p password
```

### Redis Connection Issues:
```bash
# Check if Redis is running
docker-compose ps

# Test Redis connection
docker exec -it polybanter-redis redis-cli ping
```

### Extension Not Loading:
- Make sure you've built the extension (`pnpm build`)
- Check for errors in `chrome://extensions/` page
- Look at browser console for errors
- Verify manifest.json is valid

### CORS Issues:
- Ensure backend CORS is configured for `chrome-extension://*`
- Check extension ID matches in backend CORS config
- Verify `host_permissions` in manifest.json

---

## Resources

- **NestJS Docs:** https://docs.nestjs.com/
- **React Docs:** https://react.dev/
- **Chrome Extensions:** https://developer.chrome.com/docs/extensions/
- **Socket.IO:** https://socket.io/docs/
- **TailwindCSS:** https://tailwindcss.com/docs
- **MongoDB:** https://www.mongodb.com/docs/
- **Redis:** https://redis.io/docs/

---

## Getting Help

If you run into issues:
1. Check the error messages carefully
2. Review the OVERVIEW.md for architecture details
3. Search for similar issues on Stack Overflow
4. Check official documentation for the specific technology
5. Ask for help with specific error messages and context

---

**Ready to build? Let's start with Day 1 setup!** 🚀



