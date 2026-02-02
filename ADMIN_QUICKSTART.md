# Bunch Admin Panel - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running
- Backend API running on port 3000

### 1. Install Dependencies

From the root directory:
```bash
npm install
```

Or specifically for admin:
```bash
cd admin
npm install
```

### 2. Configure Environment

The admin panel is pre-configured to use the production backend:

```bash
cd admin
```

The `.env.local` file is already set to:
```
NEXT_PUBLIC_API_URL=https://bunch.up.railway.app/api
```

For local development with local backend, change to:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Start the Backend

```bash
cd backend
npm run dev
```

Backend should be running on http://localhost:3000

### 4. Start the Admin Panel

In a new terminal:
```bash
cd admin
npm run dev
```

Admin panel will start on http://localhost:3001 (or next available port)

### 5. Create an Admin User

You need a user with admin role to login. In MongoDB:

```javascript
// Connect to your MongoDB
use bunch_db

// Update an existing user to admin
db.users.updateOne(
  { username: "your_username" },
  { $set: { role: "admin" } }
)

// Or create a new admin user
db.users.insertOne({
  username: "admin",
  display_name: "Admin User",
  role: "admin",
  status: "active",
  rank: "CREATOR",
  created_at: new Date(),
  last_seen_at: new Date(),
  is_online: false
})
```

### 6. Login

1. Open http://localhost:3001 (or the port shown in terminal)
2. You'll be redirected to `/login`
3. Click "Sign in with Twitter"
4. Authenticate with Twitter (same as the main Bunch app)
5. If your user has admin/moderator/creator role, you'll be redirected to the dashboard
6. If not, you'll see "Access denied. Admin privileges required."

## 📊 Features Overview

### Dashboard
- View key metrics: total users, messages in last 24h, pending reports, banned users
- Quick navigation to other sections

### Messages
- View recent messages from all rooms
- Filter by user ID or conversation ID
- Click "View Context" to see surrounding messages
- Delete individual messages

### Media
- Browse recent images and GIFs
- Click to open in new tab
- Delete inappropriate media

### Users
- Search users by username, display name, or Twitter username
- View user profile with message count
- **Actions:**
  - Ban user (permanent)
  - Mute user (24 hours or 7 days)
  - Delete all messages from user

### Reports
- View all user reports
- Filter by status (Pending / All)
- **Actions:**
  - Delete reported message
  - Ban reported user
  - Dismiss report

### Actions
- **Global Announcement:** Send message to all users in General chat
- **System Message:** Send message to specific room (need conversation ID)

## 🔒 Security Notes

- Only users with `role = "admin"`, `"moderator"`, or `"creator"` can access
- All routes are protected on the backend with `AdminGuard`
- JWT token is validated on every request
- Invalid tokens automatically log you out

## 🛠️ Development Commands

```bash
# Start admin panel only
npm run dev:admin

# Start backend + frontend + admin
npm run dev:all

# Build admin panel
npm run build:admin

# Build for production
cd admin
npm run build
npm start
```

## 🐛 Troubleshooting

### "Authentication required" error
- Make sure you're logged in
- Check that your JWT token is valid
- Verify your user has admin/moderator/creator role

### "Failed to load stats" or other API errors
- Ensure backend is running on http://localhost:3000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend console for errors
- Verify MongoDB is running

### Build errors
- Delete `.next` folder and rebuild
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Can't see any data
- Make sure you have data in MongoDB
- Check that backend API is returning data (use browser DevTools Network tab)
- Verify you're using the correct database

## 📝 Common Tasks

### Ban a User
1. Go to Users
2. Search for the user
3. Click "View" on the user
4. Click "Ban User"
5. Enter ban reason
6. User is immediately banned and disconnected

### Delete Inappropriate Message
1. Go to Messages
2. Find the message (or use filter)
3. Click trash icon
4. Confirm deletion
5. Message is marked as deleted

### Handle a Report
1. Go to Reports
2. Review the report details
3. Choose action:
   - Delete the reported message
   - Ban the reported user
   - Or just note it for later

### Send Announcement
1. Go to Actions
2. Type your announcement in "Global Announcement"
3. Click "Send Global Announcement"
4. All users in General chat will see it

## 🚢 Production Deployment

### Build
```bash
cd admin
npm run build
```

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd admin
vercel
```

### Environment Variables for Production
Set in your hosting platform:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Security Recommendations
- Use HTTPS for both admin panel and API
- Deploy admin panel on separate subdomain (e.g., admin.bunch.com)
- Consider IP whitelisting
- Use strong JWT secrets
- Enable rate limiting on backend
- Monitor admin actions (add logging)

## 📞 Need Help?

- Check backend logs: Terminal where backend is running
- Check frontend logs: Browser DevTools Console
- Check API responses: Browser DevTools Network tab
- Review `ADMIN_PANEL_SETUP.md` for detailed documentation

## ✅ Checklist

- [ ] Backend running
- [ ] MongoDB connected
- [ ] Admin user created with proper role
- [ ] Environment variables configured
- [ ] Admin panel running
- [ ] Successfully logged in
- [ ] Can view dashboard stats
- [ ] Tested at least one moderation action

You're all set! 🎉
