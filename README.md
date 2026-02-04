# Bunch - Chat for Polymarket

**Real-time community chat for Polymarket traders**

**Repository**: https://github.com/bunch-extension/bunch

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Status](https://img.shields.io/badge/status-pre--launch-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 What is Bunch?

Bunch brings real-time chat to Polymarket, the world's largest prediction market. Connect with traders, discuss predictions, and share insights in dedicated chat rooms for every market.

### Key Features

- 💬 **Real-time Chat** - Instant messaging with WebSocket technology
- 🎯 **Market-Specific Rooms** - Dedicated chat for every Polymarket event
- 🌐 **Global Chats** - Category-based discussions (Politics, Crypto, Sports, etc.)
- 👥 **Social Features** - Friends, DMs, user profiles, rankings
- 🐳 **Whale Detection** - See who has positions in markets
- 🔒 **Secure** - Twitter/X OAuth, content moderation, rate limiting
- 🎨 **Modern UI** - Beautiful dark theme, responsive design

---

## 📦 Project Structure

```
bunch/
├── frontend/          # React + TypeScript Chrome Extension
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── services/     # API & WebSocket services
│   │   ├── stores/       # Zustand state management
│   │   └── types/        # TypeScript definitions
│   └── public/           # Extension assets
│
├── backend/           # NestJS API Server
│   └── src/
│       ├── modules/      # Feature modules
│       │   ├── auth/     # Authentication
│       │   ├── chat/     # Chat & messaging
│       │   ├── users/    # User management
│       │   └── polymarket/ # Market integration
│       └── scripts/      # Utility scripts
│
└── docs/             # Documentation (this folder)
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **State:** Zustand
- **Styling:** Tailwind CSS
- **Build:** Vite
- **Platform:** Chrome Extension (Side Panel)

### Backend
- **Framework:** NestJS
- **Database:** MongoDB + Mongoose
- **Real-time:** Socket.IO
- **Auth:** JWT + Twitter OAuth
- **Hosting:** Railway

### External APIs
- Polymarket Data API (positions, markets)
- Cloudinary (image uploads)
- Tenor (GIF search)

---

## 📚 Documentation

### For Users
- [Privacy Policy](./PRIVACY_POLICY.md)
- [Terms of Service](./TERMS_OF_SERVICE.md)
- [Rank Guide](./rank_guide.md)

### For Developers
- [Setup Instructions](./SETUP_INSTRUCTIONS.md)
- [Project Overview](./OVERVIEW.md)
- [Security Audit](./SECURITY_AUDIT.md)
- [Moderation Guide](./MODERATION_GUIDE.md)

### For Launch
- [Chrome Store Launch Guide](./CHROME_STORE_LAUNCH_GUIDE.md)
- [Pre-Launch Fixes](./PRE_LAUNCH_FIXES.md)
- [Final Launch Status](./FINAL_LAUNCH_STATUS.md)
- [Rebrand Complete](./REBRAND_COMPLETE.md)
- [Logo Creation Guide](./LOGO_CREATION_GUIDE.md)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Chrome browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jimmy7infinity/poly_banter.git
   cd poly_banter
   ```

2. **Setup backend**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Setup frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   node scripts/copy-extension-files.js
   ```

4. **Load extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `frontend/dist` folder

5. **Visit Polymarket**
   - Go to https://polymarket.com
   - Click the Bunch extension icon
   - Login with Twitter/X
   - Start chatting!

---

## 🎯 Current Status

### ✅ Complete (100%)
- Core chat functionality
- Real-time messaging
- User authentication
- Market detection
- Global & market-specific chats
- Friend system & DMs
- User profiles & rankings
- Content moderation
- Rate limiting
- Security hardening
- Complete rebrand to Bunch

### ⚠️ In Progress (85%)
- Logo creation (pending)
- Database fixes (10 min)
- Chrome Store submission (pending)

### 📅 Roadmap
- v0.2.0: Notifications, mentions, reactions
- v0.3.0: Voice notes, polls
- v0.4.0: Mobile app
- v1.0.0: Full public launch

---

## 🤝 Contributing

This is currently a private project. Contributions will be opened after public launch.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🔗 Links

- **Website:** Coming soon
- **Chrome Store:** Coming soon
- **Twitter:** Coming soon
- **Discord:** Coming soon

---

## 👥 Team

Built by traders, for traders.

---

## 🙏 Acknowledgments

- Polymarket for the amazing prediction market platform
- The crypto trading community
- All early beta testers

---

## 📞 Support

For support, email: support@bunch.chat (coming soon)

---

**Bunch - Where Traders Talk** 🚀

*Last Updated: January 16, 2026*
