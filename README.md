# PolyBanter

> Social chat Chrome extension for Polymarket

A Chrome extension side panel that brings real-time chat, AI-powered insights, and community features to Polymarket.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[OVERVIEW.md](./OVERVIEW.md)** | Complete technical specification and architecture (1,900+ lines) |
| **[GETTING_STARTED.md](./GETTING_STARTED.md)** | Step-by-step setup guide for development |
| **[WEEK_1_CHECKLIST.md](./WEEK_1_CHECKLIST.md)** | Day-by-day checklist for first week |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Common commands and code snippets |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Docker Desktop
- Chrome browser

### Setup (5 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Start Docker services (MongoDB, Redis)
docker-compose up -d

# 3. Set up backend
cd backend
cp .env.example .env
# Edit .env with your values
pnpm install
pnpm dev

# 4. Set up frontend (in new terminal)
cd frontend
pnpm install
pnpm dev

# 5. Build and load extension
pnpm build
# Go to chrome://extensions/, enable Developer mode, click "Load unpacked", select frontend/dist
```

---

## 🏗️ Project Structure

```
poly_banter/
├── frontend/          # React + TypeScript Chrome extension
├── backend/           # NestJS API server
├── shared/            # Shared types and utilities
├── api/               # API documentation (future)
├── docker-compose.yml # Local development services
└── docs/              # Additional documentation
```

---

## ✨ Features

### Phase 1 (MVP - 12 weeks)
- ✅ Chrome extension side panel
- ✅ Multi-category chat (Global, Politics, Crypto, Sports, etc.)
- ✅ Market-specific chat rooms
- ✅ Private DMs and group chats
- ✅ AI-powered market insights
- ✅ User rankings and leaderboards
- ✅ Achievement system with unlockable roles
- ✅ Real-time WebSocket communication
- ✅ Wallet + Twitter authentication

### Phase 2 (3-6 months)
- Voice channels
- Prediction tournaments
- Custom emojis and stickers
- Tip system (crypto tips in chat)
- Thread replies
- Message search

### Phase 3 (6-12 months)
- NFT badges
- AI chat assistant
- Portfolio integration
- Social trading
- Mobile app

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, TailwindCSS, Vite |
| Backend | NestJS, Node.js 20+ |
| Database | MongoDB, Redis |
| Real-time | Socket.IO |
| AI | OpenAI GPT-4 / Anthropic Claude |
| Auth | JWT, Wallet Signatures, Twitter OAuth |
| Deployment | Docker, AWS ECS, MongoDB Atlas |

---

## 📖 Key Concepts

### Chat Categories

1. **Global** — Public chat for all users
2. **Categories** — Themed chats (Politics, Crypto, Sports, etc.)
3. **Markets** — Individual market-specific chats
4. **Groups** — Private group conversations
5. **DMs** — One-on-one direct messages
6. **AI** — Read-only channel where AI posts insights

### AI System

- Monitors market activity (price, volume, sentiment)
- Detects significant events based on thresholds
- Generates human-readable insights using LLMs
- Posts to relevant AI channels
- Notifies users who follow affected markets/categories

### Rankings & Achievements

- Earn reputation points for activity
- Climb leaderboards (daily, weekly, monthly, all-time)
- Unlock achievement-based roles (Whale, Prophet, Degen, etc.)
- Display roles as badges in chat

---

## 🔧 Development

### Daily Workflow

```bash
# Terminal 1: Docker services
docker-compose up

# Terminal 2: Backend
cd backend && pnpm dev

# Terminal 3: Frontend
cd frontend && pnpm dev

# Terminal 4: Commands, testing, etc.
```

### Common Commands

```bash
# Backend
npx nest g module modules/[name]    # Generate module
npx nest g controller modules/[name] # Generate controller
npx nest g service modules/[name]   # Generate service

# Frontend
pnpm build                          # Build extension
pnpm dev                            # Dev server

# Docker
docker-compose up -d                # Start services
docker-compose down                 # Stop services
docker-compose logs -f              # View logs
```

See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for more commands.

---

## 📅 Timeline

- **Week 1-3:** Foundation (setup, auth, basic chat)
- **Week 4-5:** Categories & markets
- **Week 6-7:** Rankings & achievements
- **Week 8-10:** AI system
- **Week 11-12:** Polish & launch

**Total: 12-16 weeks to v1.0**

---

## 🎯 Success Metrics (First 3 Months)

- 1,000+ total users
- 100+ daily active users
- 30%+ 7-day retention
- 10,000+ messages sent
- 100+ AI insights generated
- 99.5%+ uptime

---

## 🤝 Contributing

This is currently a private project. Contribution guidelines will be added when the project goes open source.

---

## 📝 License

TBD

---

## 🔗 Links

- [Polymarket](https://polymarket.com/)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [NestJS Docs](https://docs.nestjs.com/)
- [React Docs](https://react.dev/)

---

## 📧 Contact

For questions or feedback, please open an issue or contact the maintainers.

---

**Built with ❤️ for the Polymarket community**

🚀 **Ready to start?** Check out [GETTING_STARTED.md](./GETTING_STARTED.md)

