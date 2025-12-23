# 🔌 Chrome Extension Guide

## Current Status

Right now you're testing the **web version** at http://localhost:5173

To use it as a **Chrome Extension Side Panel**, follow these steps:

---

## 📦 Build the Extension

```bash
cd frontend
npm run build:extension
```

This creates a `dist/` folder with all extension files.

---

## 🚀 Load Extension in Chrome

### Step 1: Open Chrome Extensions
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right)

### Step 2: Load Unpacked Extension
1. Click **"Load unpacked"**
2. Select the `frontend/dist` folder
3. Extension will appear in your extensions list

### Step 3: Open Side Panel
1. Click the PolyBanter extension icon in toolbar
2. Side panel will open on the right side
3. Connect wallet and start chatting!

---

## 🎨 Extension Features

### Side Panel Benefits:
- ✅ Always accessible (persists across tabs)
- ✅ Doesn't interfere with web pages
- ✅ Can be pinned to stay open
- ✅ Works on any website

### How It Works:
- Click extension icon → Side panel opens
- Panel stays open when switching tabs
- Close by clicking X or pressing Escape
- Reopen anytime by clicking icon

---

## 🔧 Development Workflow

### Testing Changes:

1. **Make code changes** in `frontend/src/`
2. **Rebuild extension:**
   ```bash
   cd frontend
   npm run build:extension
   ```
3. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload button on PolyBanter extension
4. **Reopen side panel** to see changes

### Hot Reload (Web Version):
For faster development, use web version:
```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

Then build extension when ready to test as extension.

---

## 📝 Extension Files

### Key Files:
- `public/manifest.json` - Extension configuration
- `public/service-worker.js` - Background script
- `public/icon-*.png` - Extension icons (need to add)

### Manifest V3 Features:
- ✅ Side Panel API
- ✅ Storage permission
- ✅ Host permissions for API calls

---

## 🎯 Next Steps

### For Now (Testing):
1. **Use web version** at http://localhost:5173
2. Test login and chat functionality
3. Once working, build as extension

### For Production:
1. Add proper icons (16x16, 48x48, 128x128 PNG)
2. Update manifest with production API URL
3. Build extension: `npm run build:extension`
4. Submit to Chrome Web Store (optional)

---

## 🐛 Troubleshooting

### Extension Won't Load:
- Check `dist/manifest.json` exists
- Verify all files are in `dist/`
- Check Chrome console for errors

### Side Panel Won't Open:
- Make sure you clicked the extension icon
- Check if side panel API is supported (Chrome 114+)
- Try reloading the extension

### API Connection Issues:
- Update manifest.json `host_permissions` with your API URL
- Check CORS settings in backend
- Verify extension ID in backend CORS config

---

## 📚 Resources

- [Chrome Side Panel API Docs](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Extension Publishing](https://developer.chrome.com/docs/webstore/publish/)

---

**For now, continue testing at http://localhost:5173 - the web version works exactly the same!** 🚀



