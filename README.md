# Bunch - Chat for Polymarket

**Real-time community chat for Polymarket traders**

**Repository**: https://github.com/bunch-extension/bunch

![Version](https://img.shields.io/badge/version-0.1.1-blue)
![Status](https://img.shields.io/badge/status-beta-orange)
![Users](https://img.shields.io/badge/users-6-green)

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

- [Privacy Policy](./PRIVACY_POLICY.md)
- [Terms of Service](./TERMS_OF_SERVICE.md)

---

## 🚀 Get Started

Install Bunch from the [Chrome Web Store](https://chromewebstore.google.com/detail/bunch/gnpefmfnagkjjmpmcnfpnimicggkcgna).

---

## 🎯 Current Status

**Live Beta** - Available on [Chrome Web Store](https://chromewebstore.google.com/detail/bunch/gnpefmfnagkjjmpmcnfpnimicggkcgna)

### ✅ Complete
- Real-time messaging & WebSocket
- Twitter/X & wallet authentication
- Market-specific chat rooms
- Global category chats
- Friend system & DMs
- User profiles & rankings
- Polymarket position detection
- Content moderation & admin panel
- Rate limiting & security
- Beta access system with invite codes

### 📅 Coming Soon
- Personal performance metrics & trading stats
- AI-powered market insights
- Thread replies & message reactions
- Polls & community predictions
- Enhanced rank system
- Mobile companion app

---

## 🤝 Contributing

This is a closed-source project. Not accepting contributions at this time.

---

## 🔗 Links

- **Chrome Extension:** [Get Bunch](https://chromewebstore.google.com/detail/bunch/gnpefmfnagkjjmpmcnfpnimicggkcgna)
- **Twitter/X:** [@bunchxyz](https://x.com/bunchxyz)

---

## 📞 Support

For support, reach out to [@bunchxyz](https://x.com/bunchxyz) on X/Twitter.

---

**Bunch - Where Traders Talk** 🚀
