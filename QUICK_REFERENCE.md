# Quick Reference Guide

Essential commands and code snippets for daily development.

---

## Daily Startup Commands

```bash
# Start all services (run from project root)
docker-compose up -d

# Start backend (Terminal 1)
cd backend && pnpm dev

# Start frontend (Terminal 2)
cd frontend && pnpm dev

# Build extension for testing
cd frontend && pnpm build
```

---

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Reset everything (WARNING: deletes data)
docker-compose down -v && docker-compose up -d

# Check service status
docker-compose ps

# Access MongoDB shell
docker exec -it polybanter-mongodb mongosh -u admin -p password

# Access Redis CLI
docker exec -it polybanter-redis redis-cli
```

---

## Backend Commands (NestJS)

```bash
# Generate new module
npx nest g module modules/[name]

# Generate controller
npx nest g controller modules/[name]

# Generate service
npx nest g service modules/[name]

# Generate gateway (WebSocket)
npx nest g gateway modules/[name]/[name]

# Run in dev mode (watch)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint and fix
pnpm lint
```

---

## Frontend Commands

```bash
# Run dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Format code
pnpm format
```

---

## Git Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "feat: your message here"

# Push to remote
git push

# Create new branch
git checkout -b feature/your-feature-name

# Switch branches
git checkout [branch-name]

# Pull latest changes
git pull

# View commit history
git log --oneline
```

---

## Chrome Extension Testing

```bash
# Build extension
cd frontend && pnpm build

# After building:
# 1. Go to chrome://extensions/
# 2. Click "Reload" on PolyBanter extension
# 3. Click extension icon to open side panel
```

---

## Common Code Snippets

### Backend: Create New API Endpoint

```typescript
// In controller
@Get('example')
async getExample() {
  return { message: 'Hello World' };
}

@Post('example')
async createExample(@Body() data: CreateExampleDto) {
  return this.exampleService.create(data);
}

@Get('example/:id')
async getExampleById(@Param('id') id: string) {
  return this.exampleService.findById(id);
}
```

### Backend: WebSocket Event Handler

```typescript
// In gateway
@SubscribeMessage('message_send')
async handleMessage(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { text: string; roomId: string }
) {
  // Handle message
  this.server.to(data.roomId).emit('message_new', {
    text: data.text,
    sender: client.data.user,
    timestamp: new Date(),
  });
}
```

### Frontend: API Call with Axios

```typescript
// In service
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const authService = {
  async login(signature: string, address: string) {
    const response = await api.post('/auth/wallet', {
      signature,
      address,
    });
    return response.data;
  },
};
```

### Frontend: Zustand Store

```typescript
// In stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));
```

### Frontend: WebSocket Hook

```typescript
// In hooks/useWebSocket.ts
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useWebSocket = (token: string) => {
  useEffect(() => {
    if (!token) return;

    socket = io('http://localhost:3000', {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    return () => {
      socket?.disconnect();
    };
  }, [token]);

  return socket;
};
```

### Frontend: React Component Template

```typescript
import React from 'react';

interface ComponentProps {
  title: string;
  onClick?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onClick }) => {
  return (
    <div className="p-4 bg-card rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      {onClick && (
        <button onClick={onClick} className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded">
          Click Me
        </button>
      )}
    </div>
  );
};
```

---

## MongoDB Queries (via mongosh)

```javascript
// Connect to database
use polybanter

// Find all users
db.users.find()

// Find user by username
db.users.findOne({ username: "testuser" })

// Count documents
db.users.countDocuments()

// Insert document
db.users.insertOne({
  username: "testuser",
  wallet_address: "0x123...",
  created_at: new Date()
})

// Update document
db.users.updateOne(
  { username: "testuser" },
  { $set: { display_name: "Test User" } }
)

// Delete document
db.users.deleteOne({ username: "testuser" })

// Create index
db.users.createIndex({ username: 1 })

// View all collections
show collections

// Drop collection (careful!)
db.users.drop()
```

---

## Redis Commands (via redis-cli)

```bash
# Get value
GET key

# Set value
SET key value

# Set with expiration (seconds)
SETEX key 3600 value

# Delete key
DEL key

# List all keys
KEYS *

# Check if key exists
EXISTS key

# Get TTL (time to live)
TTL key

# Flush all data (WARNING: deletes everything)
FLUSHALL
```

---

## Environment Variables Reference

```bash
# Backend .env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://admin:password@localhost:27017/polybanter?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=chrome-extension://YOUR_EXTENSION_ID
```

---

## Debugging Tips

### Backend Debugging
```typescript
// Add console.log
console.log('Debug:', variable);

// Use NestJS Logger
import { Logger } from '@nestjs/common';
const logger = new Logger('ComponentName');
logger.log('Info message');
logger.error('Error message');
logger.warn('Warning message');
```

### Frontend Debugging
```typescript
// Console log
console.log('Debug:', variable);

// React DevTools (install extension)
// Check component state and props

// Network tab
// Check API requests and responses

// WebSocket debugging
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
socket.onAny((event, ...args) => {
  console.log('WebSocket event:', event, args);
});
```

---

## Testing Commands

```bash
# Backend tests
cd backend
pnpm test                    # Run all tests
pnpm test:watch             # Run in watch mode
pnpm test:cov               # With coverage

# Frontend tests
cd frontend
pnpm test                    # Run all tests
pnpm test:watch             # Run in watch mode
```

---

## Useful VS Code Shortcuts

```
Cmd/Ctrl + P          - Quick file open
Cmd/Ctrl + Shift + P  - Command palette
Cmd/Ctrl + B          - Toggle sidebar
Cmd/Ctrl + `          - Toggle terminal
Cmd/Ctrl + /          - Toggle comment
Cmd/Ctrl + D          - Select next occurrence
Cmd/Ctrl + Shift + F  - Search in files
F2                    - Rename symbol
Cmd/Ctrl + Click      - Go to definition
```

---

## Package Management

```bash
# Install dependency
pnpm add [package]

# Install dev dependency
pnpm add -D [package]

# Remove dependency
pnpm remove [package]

# Update all dependencies
pnpm update

# Check outdated packages
pnpm outdated

# Clean install
rm -rf node_modules && pnpm install
```

---

## Common Issues & Quick Fixes

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 [PID]
```

### Clear all caches
```bash
# Backend
cd backend && rm -rf node_modules dist && pnpm install

# Frontend
cd frontend && rm -rf node_modules dist && pnpm install

# Docker
docker-compose down -v && docker-compose up -d
```

### Reset database
```bash
docker-compose down -v
docker-compose up -d
# Wait for services to start
# Re-run any seed scripts if needed
```

---

## API Testing with curl

```bash
# GET request
curl http://localhost:3000/api/endpoint

# POST request with JSON
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# With authentication
curl http://localhost:3000/api/endpoint \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Commit Message Conventions

```bash
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

**Keep this file handy for quick reference during development!** 📚



