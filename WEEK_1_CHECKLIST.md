# Week 1 Development Checklist

Use this checklist to track your progress through the first week of development.

---

## Day 1: Environment & Project Setup

### Morning (2-3 hours)
- [ ] Install Node.js 20+ via nvm
- [ ] Install pnpm globally
- [ ] Install Docker Desktop
- [ ] Install VS Code extensions (ESLint, Prettier, Tailwind)
- [ ] Verify all installations work

### Afternoon (3-4 hours)
- [ ] Initialize Git repository
- [ ] Create .gitignore file
- [ ] Set up GitHub repository and push initial commit
- [ ] Create monorepo structure (frontend, backend, shared)
- [ ] Create root package.json with workspaces
- [ ] Install concurrently and prettier

### Evening (1-2 hours)
- [ ] Create docker-compose.yml
- [ ] Start MongoDB and Redis containers
- [ ] Verify containers are running
- [ ] Test MongoDB connection
- [ ] Test Redis connection

**End of Day 1 Goal:** Have a working development environment with Docker services running.

---

## Day 2: Backend Foundation

### Morning (3-4 hours)
- [ ] Initialize NestJS project in backend folder
- [ ] Install core NestJS dependencies
- [ ] Create tsconfig.json
- [ ] Create src/main.ts with CORS enabled
- [ ] Create src/app.module.ts
- [ ] Test backend starts successfully (`pnpm dev`)

### Afternoon (3-4 hours)
- [ ] Install MongoDB dependencies (@nestjs/mongoose, mongoose)
- [ ] Install Redis dependencies (ioredis)
- [ ] Install auth dependencies (JWT, Passport)
- [ ] Install other essentials (config, bcrypt, ethers)
- [ ] Create .env file with all required variables
- [ ] Create .env.example for version control

### Evening (1-2 hours)
- [ ] Configure MongoDB connection in app.module
- [ ] Configure Redis connection
- [ ] Test database connections work
- [ ] Create first test endpoint (GET /health)
- [ ] Verify endpoint returns 200 OK

**End of Day 2 Goal:** Backend server running with database connections working.

---

## Day 3: Frontend Foundation

### Morning (3-4 hours)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install base dependencies (socket.io-client, zustand, axios, etc.)
- [ ] Install and configure TailwindCSS
- [ ] Create tailwind.config.js with theme colors
- [ ] Test dev server starts (`pnpm dev`)

### Afternoon (3-4 hours)
- [ ] Create public/manifest.json for Chrome extension
- [ ] Create public/service-worker.js
- [ ] Configure vite.config.ts for extension build
- [ ] Create src/styles/theme.css with CSS variables
- [ ] Import theme.css in main App component

### Evening (2-3 hours)
- [ ] Build extension (`pnpm build`)
- [ ] Load unpacked extension in Chrome
- [ ] Open side panel and verify it loads
- [ ] Test hot reload works
- [ ] Fix any build or loading issues

**End of Day 3 Goal:** Chrome extension loads successfully in side panel.

---

## Day 4: Basic UI Components

### Morning (3-4 hours)
- [ ] Create component directory structure
- [ ] Create PrimaryButton component with variants
- [ ] Create SecondaryButton component with variants
- [ ] Create TextInput component
- [ ] Create Card component
- [ ] Test components render correctly

### Afternoon (3-4 hours)
- [ ] Create basic layout components (Container, Stack)
- [ ] Create Header component with logo and icons
- [ ] Create Navigation component with tabs
- [ ] Create basic side panel layout
- [ ] Style components with Tailwind

### Evening (1-2 hours)
- [ ] Test light/dark theme switching
- [ ] Verify all components use theme variables
- [ ] Build and test in extension
- [ ] Fix any styling issues

**End of Day 4 Goal:** Basic UI component library working with theme system.

---

## Day 5: Authentication Setup (Backend)

### Morning (3-4 hours)
- [ ] Generate auth module (`npx nest g module modules/auth`)
- [ ] Generate auth controller and service
- [ ] Generate users module
- [ ] Generate users controller and service
- [ ] Create user schema (src/modules/users/schemas/user.schema.ts)

### Afternoon (3-4 hours)
- [ ] Implement JWT strategy
- [ ] Create auth/wallet endpoint for signature verification
- [ ] Implement wallet signature verification with ethers.js
- [ ] Create JWT token generation logic
- [ ] Test wallet auth endpoint with Postman/Thunder Client

### Evening (2-3 hours)
- [ ] Create auth/refresh endpoint
- [ ] Implement refresh token logic
- [ ] Create auth guard for protected routes
- [ ] Test full auth flow (sign → get JWT → use JWT)

**End of Day 5 Goal:** Wallet authentication working end-to-end on backend.

---

## Day 6: Authentication UI (Frontend)

### Morning (3-4 hours)
- [ ] Create auth store with Zustand
- [ ] Create API service for auth endpoints
- [ ] Create LoginModal component
- [ ] Create WalletConnect component
- [ ] Install and configure wallet connection library (wagmi or ethers)

### Afternoon (3-4 hours)
- [ ] Implement wallet connection flow
- [ ] Implement signature request
- [ ] Send signature to backend for verification
- [ ] Store JWT token in Chrome storage
- [ ] Handle auth errors gracefully

### Evening (1-2 hours)
- [ ] Create protected route wrapper
- [ ] Redirect to login if not authenticated
- [ ] Test full auth flow in extension
- [ ] Fix any issues

**End of Day 6 Goal:** Users can connect wallet and authenticate in extension.

---

## Day 7: WebSocket Setup

### Morning (3-4 hours)
- [ ] Install Socket.IO on backend
- [ ] Generate chat module and gateway
- [ ] Configure WebSocket in app.module
- [ ] Implement connection authentication
- [ ] Test WebSocket connection with Postman or socket.io client

### Afternoon (3-4 hours)
- [ ] Create WebSocket service on frontend
- [ ] Implement connection logic with JWT
- [ ] Handle connection/disconnection events
- [ ] Create useWebSocket hook
- [ ] Test connection from extension

### Evening (2-3 hours)
- [ ] Implement basic room joining
- [ ] Test join/leave room events
- [ ] Create simple message event (send/receive)
- [ ] Test end-to-end message flow
- [ ] Celebrate! 🎉

**End of Day 7 Goal:** Real-time WebSocket connection working with basic messaging.

---

## Week 1 Success Criteria

By the end of Week 1, you should have:

✅ **Development Environment**
- Docker running MongoDB and Redis
- Backend server running on localhost:3000
- Frontend dev server running
- Chrome extension loadable and working

✅ **Authentication**
- Users can connect wallet
- Wallet signature verification works
- JWT tokens generated and stored
- Protected routes require authentication

✅ **Real-time Connection**
- WebSocket connection established
- Connection authenticated with JWT
- Basic room join/leave working
- Simple message send/receive working

✅ **UI Foundation**
- Theme system working (light/dark)
- Basic components created
- Side panel layout complete
- Extension loads without errors

---

## Common Issues & Solutions

### "Cannot connect to MongoDB"
**Solution:** Make sure Docker is running and MongoDB container is up:
```bash
docker-compose ps
docker-compose logs mongodb
```

### "Extension won't load"
**Solution:** Check for build errors and verify manifest.json:
```bash
cd frontend
pnpm build
# Check dist/manifest.json exists and is valid
```

### "WebSocket connection refused"
**Solution:** Verify backend is running and CORS is configured:
```bash
# Check backend logs
cd backend
pnpm dev
# Look for "WebSocket server started" message
```

### "Wallet connection not working"
**Solution:** Make sure you're testing with a wallet installed (MetaMask, etc.) and the site has permission to connect.

---

## Tips for Success

1. **Work in small increments** — Test each piece before moving on
2. **Commit often** — Commit after each completed task
3. **Read error messages** — They usually tell you exactly what's wrong
4. **Use the browser console** — Check for errors in both extension and backend
5. **Take breaks** — Step away when stuck, come back with fresh eyes
6. **Ask for help** — Don't spend hours stuck on one issue

---

## After Week 1

Once you complete Week 1, you'll be ready to:
- Build the global chat room
- Implement message persistence (save to MongoDB)
- Create the chat UI (message list, input, reactions)
- Add more authentication methods (Twitter OAuth)
- Start on categories and markets

**Keep going! You've got this! 🚀**



