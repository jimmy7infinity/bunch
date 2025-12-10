# 🚀 START HERE - MVP Setup Guide

Follow these steps to get PolyBanter MVP running locally.

---

## Prerequisites Check

Run these commands to verify you have everything:

```bash
node --version    # Should be v18+ (you have v22.18.0 ✅)
npm --version     # Should be v8+ (you have v10.9.3 ✅)
docker --version  # Should show Docker version
```

If Docker is not installed:
- **Mac:** Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Windows:** Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux:** `curl -fsSL https://get.docker.com | sh`

---

## Step 1: Install Root Dependencies (2 minutes)

```bash
cd /Users/jimmyinfinity/Projects/poly_banter
npm install
```

This installs `concurrently` and `prettier` for the workspace.

---

## Step 2: Start Docker Services (2 minutes)

```bash
# Start MongoDB and Redis
docker-compose up -d

# Verify they're running
docker-compose ps

# You should see:
# polybanter-mongodb   running
# polybanter-redis     running
```

---

## Step 3: Initialize Backend (5 minutes)

```bash
cd backend

# Create package.json
npm init -y

# Install NestJS dependencies
npm install @nestjs/common@^10.3.0 @nestjs/core@^10.3.0 @nestjs/platform-express@^10.3.0 reflect-metadata@^0.2.1 rxjs@^7.8.1

# Install dev dependencies
npm install -D @nestjs/cli@^10.3.0 @nestjs/schematics@^10.1.0 @types/node@^20.11.0 typescript@^5.3.3 ts-node@^10.9.2

# Install database & auth dependencies
npm install @nestjs/mongoose@^10.0.2 mongoose@^8.1.0 @nestjs/config@^3.1.1 @nestjs/jwt@^10.2.0 @nestjs/passport@^10.0.3 passport@^0.7.0 passport-jwt@^4.0.1 bcrypt@^5.1.1 ethers@^6.10.0

# Install WebSocket dependencies
npm install @nestjs/websockets@^10.3.0 @nestjs/platform-socket.io@^10.3.0 socket.io@^4.6.0

# Install Redis
npm install ioredis@^5.3.2

# Install dev types
npm install -D @types/bcrypt@^5.0.2 @types/passport-jwt@^4.0.0

# Create .env file
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://admin:password@localhost:27017/polybanter?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
EOF

# Copy for version control
cp .env .env.example
```

---

## Step 4: Create Backend Structure (Now - I'll do this)

I'll create the initial NestJS files for you. This includes:
- `src/main.ts` - Entry point
- `src/app.module.ts` - Root module
- `tsconfig.json` - TypeScript config
- `nest-cli.json` - NestJS CLI config

---

## Step 5: Initialize Frontend (5 minutes)

```bash
cd ../frontend

# Create Vite + React + TypeScript project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional dependencies
npm install socket.io-client@^4.6.0 zustand@^4.5.0 axios@^1.6.5 react-router-dom@^6.21.3 date-fns@^3.3.0

# Install TailwindCSS
npm install -D tailwindcss@^3.4.1 postcss@^8.4.33 autoprefixer@^10.4.17

# Initialize Tailwind
npx tailwindcss init -p

# Install wallet connection
npm install wagmi@^2.5.0 viem@^2.7.0 @tanstack/react-query@^5.17.0
```

---

## Step 6: Start Development Servers

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

You should see: `🚀 Backend running on http://localhost:3000`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

You should see: `Local: http://localhost:5173`

---

## Step 7: Verify Everything Works

### Test Backend
```bash
curl http://localhost:3000
# Should return: {"message":"Welcome to PolyBanter API"}
```

### Test Frontend
- Open http://localhost:5173 in browser
- Should see Vite + React welcome page

### Test Docker
```bash
docker-compose ps
# Both services should be "running"
```

---

## Next Steps

Once everything is running:

1. **I'll create the backend structure** (main.ts, modules, etc.)
2. **I'll create the frontend structure** (components, theme, etc.)
3. **We'll implement authentication** (wallet connection)
4. **We'll build the chat system** (WebSocket, messages)

---

## Troubleshooting

### "Cannot connect to MongoDB"
```bash
docker-compose logs mongodb
# Check for errors

# Restart MongoDB
docker-compose restart mongodb
```

### "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### "npm install fails"
```bash
# Clear cache
npm cache clean --force

# Try again
npm install
```

---

## Ready?

Run these commands to get started:

```bash
# 1. Install root dependencies
npm install

# 2. Start Docker
docker-compose up -d

# 3. Set up backend (follow Step 3 above)
cd backend && npm init -y && npm install ...

# 4. Set up frontend (follow Step 5 above)
cd ../frontend && npm create vite@latest . -- --template react-ts && npm install ...
```

**Let me know when you've completed Steps 1-3, and I'll create all the backend files for you!** 🚀

