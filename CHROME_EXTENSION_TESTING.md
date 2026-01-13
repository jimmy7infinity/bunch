# Chrome Extension Testing Guide

## Setup Steps

### 1. Seed Global Chats (One-time)
```bash
cd backend
npm run seed:global
```

This creates: Politics, Sports, Crypto, Finance, Geopolitics, Earnings, Tech, Culture, World Economy, Climate & Science, Elections, Mentions

### 2. Build Extension in Watch Mode
```bash
cd frontend
npm run build:watch
```

This continuously rebuilds `frontend/dist/` whenever you make changes.

### 3. Load Extension in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `frontend/dist/`
5. Pin the extension to your toolbar

✅ Chrome will auto-reload the extension whenever files change!

### 4. Test on Real Polymarket

1. Navigate to https://polymarket.com
2. Browse any market (e.g., https://polymarket.com/event/2024-us-presidential-election)
3. Click the PolyBanter extension icon
4. Side panel opens → Market chat auto-detects!

## Debugging

### Side Panel DevTools
- Right-click inside the side panel
- Select "Inspect"
- Full React DevTools + console available

### Content Script Logs
- Open Polymarket page
- Open DevTools → Console
- Look for: `Detected market: <marketId>`

### Service Worker
- Go to `chrome://extensions`
- Click "Service worker" under PolyBanter
- View background script logs

## Features to Test

### ✅ Market Detection
- Navigate between different Polymarket markets
- Side panel should auto-switch to the correct prediction chat

### ✅ Polymarket Verification
1. Click Settings
2. Verify your Polymarket account
3. Your wallet address gets stored

### ✅ Real Positions
- After verification, your actual Polymarket positions show automatically
- 🟢 for Yes positions, 🔴 for No positions
- No manual input needed!

### ✅ Whale Detection
- Users with top 10% position sizes get 🐳 emoji

### ✅ Auto-join Market Chats
- Toggle in Settings: "Auto-join Prediction Chats"
- When ON: automatically joins market chat when detected
- When OFF: shows "Join Prediction Chat" button

## Backend

Your backend is on Railway at `https://poly-banter.up.railway.app`

The extension talks to this backend - no localhost needed!

## Common Issues

**Extension not reloading?**
- Check that `npm run build:watch` is still running
- If stuck, click the reload icon in `chrome://extensions`

**Market not detected?**
- Check console for content script logs
- Make sure you're on a market page (not homepage)

**Positions not showing?**
- Make sure you've verified your Polymarket account
- Check that your wallet has positions in that market

## Pro Tips

- Keep DevTools open while testing
- Use React DevTools to inspect component state
- Check Network tab to see API calls
- Service worker logs show message passing between content script and side panel

Happy testing! 🚀
