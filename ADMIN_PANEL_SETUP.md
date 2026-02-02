# Bunch Admin Panel - Setup Complete

## Overview

A fully functional admin and moderator panel for Bunch has been created. This is a separate Next.js web app that connects to the existing NestJS backend.

## What Was Built

### Backend (NestJS)

#### 1. Admin Guard (`backend/src/modules/auth/guards/admin.guard.ts`)
- Protects all admin routes
- Validates JWT token
- Checks user role (admin, moderator, or creator)
- Returns 403 if user doesn't have proper permissions

#### 2. Admin Module (`backend/src/modules/admin/`)
- **admin.service.ts**: Business logic for all admin operations
- **admin.controller.ts**: API endpoints for admin panel
- **admin.module.ts**: Module configuration

#### 3. API Endpoints (all protected by AdminGuard)

**Dashboard:**
- `GET /admin/stats` - Total users, messages 24h, reports, banned users

**Messages:**
- `GET /admin/messages` - Recent messages with filters (userId, conversationId, limit)
- `GET /admin/messages/:id` - Message with surrounding context
- `DELETE /admin/messages/:id` - Delete a message

**Media:**
- `GET /admin/media` - Recent images and GIFs

**Users:**
- `GET /admin/users?q=query` - Search users
- `GET /admin/users/:id` - User details with message count and recent messages
- `POST /admin/users/:id/ban` - Ban user permanently
- `POST /admin/users/:id/mute` - Mute user (24h or 168h for 7 days)
- `DELETE /admin/users/:id/messages` - Delete all messages from user

**Reports:**
- `GET /admin/reports?status=pending` - List reports with optional status filter

**Actions:**
- `POST /admin/announcement` - Send global announcement to General chat
- `POST /admin/system-message` - Send system message to specific room

### Frontend (Next.js)

#### Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- Axios for API calls

#### Pages

1. **Login (`/login`)**
   - JWT authentication
   - Role validation (admin/moderator/creator only)

2. **Dashboard (`/dashboard`)**
   - 4 stat cards: Total users, Messages 24h, Pending reports, Banned users
   - Quick action guide

3. **Messages (`/messages`)**
   - Table of recent messages
   - Filter by user ID
   - View message context (surrounding messages)
   - Delete individual messages

4. **Media (`/media`)**
   - Grid view of recent images/GIFs
   - Click to open in new tab
   - Delete media

5. **Users (`/users`)**
   - Search by username, display name, or Twitter username
   - View user profile with stats
   - Actions: Ban, Mute (24h/7d), Delete all messages
   - View recent messages from user

6. **Reports (`/reports`)**
   - Table of reports
   - Filter: Pending / All
   - Actions: Delete message, Ban user
   - Shows reporter, target, reason, message

7. **Actions (`/actions`)**
   - Send global announcement
   - Send system message to specific room
   - Message previews

#### Components
- Sidebar navigation
- Protected route layout
- shadcn/ui components (Button, Card, Input, Table, etc.)

## File Structure

```
admin/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Protected layout with auth check
│   │   ├── dashboard/page.tsx  # Dashboard page
│   │   ├── messages/page.tsx   # Messages management
│   │   ├── media/page.tsx      # Media management
│   │   ├── users/page.tsx      # User management
│   │   ├── reports/page.tsx    # Reports handling
│   │   └── actions/page.tsx    # Admin actions
│   ├── login/page.tsx          # Login page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Root redirect
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── table.tsx
│   └── Sidebar.tsx             # Navigation sidebar
├── lib/
│   ├── api.ts                  # API service with axios
│   └── utils.ts                # Utility functions
├── types/
│   └── index.ts                # TypeScript types
├── .env.local                  # Environment variables
├── package.json
└── README.md

backend/
└── src/
    └── modules/
        ├── admin/
        │   ├── admin.controller.ts
        │   ├── admin.service.ts
        │   └── admin.module.ts
        └── auth/
            └── guards/
                └── admin.guard.ts
```

## How to Run

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Start the Admin Panel
```bash
cd admin
npm run dev
```

Or from root:
```bash
npm run dev:admin
```

### 3. Access the Admin Panel
Open http://localhost:3000 (or the port Next.js assigns)

### 4. Login
- Use credentials of a user with `role = "admin"`, `"moderator"`, or `"creator"`
- The backend validates the role on every request

## Security Features

✅ **Backend Validation**: All admin routes protected by `AdminGuard`
✅ **Role-Based Access**: Only admin/moderator/creator can access
✅ **JWT Authentication**: Token required for all requests
✅ **Never Trust Frontend**: All actions validated on backend
✅ **Auto Logout**: Invalid/expired tokens redirect to login

## Environment Variables

**Admin Panel** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

For production, set to your production API URL.

## Production Deployment

### Build Admin Panel
```bash
cd admin
npm run build
npm start
```

### Deploy Options
- Vercel (recommended for Next.js)
- Railway
- Docker
- Any Node.js hosting

### Important for Production
1. Set `NEXT_PUBLIC_API_URL` to production backend URL
2. Ensure backend has proper CORS settings for admin domain
3. Use HTTPS for both frontend and backend
4. Keep admin panel on a separate subdomain (e.g., admin.bunch.com)
5. Consider IP whitelisting for extra security

## Testing

1. Create a test user with admin role in MongoDB:
```javascript
db.users.updateOne(
  { username: "testadmin" },
  { $set: { role: "admin" } }
)
```

2. Login with that user's credentials
3. Test all features:
   - View dashboard stats
   - Browse messages
   - View media
   - Search users
   - Check reports
   - Send test announcement

## Future Enhancements

Potential additions:
- Activity logs (who did what, when)
- Bulk actions (ban multiple users)
- Analytics charts
- Export data to CSV
- Advanced filters and search
- User role management
- Scheduled announcements
- Email notifications for reports

## Support

For issues or questions, check:
- Backend logs: `backend/` console
- Frontend logs: Browser console
- API responses: Network tab in DevTools

## Notes

- This is an internal tool, not exposed to regular users
- All moderation actions are immediate and irreversible (except mutes)
- Deleted messages are marked as `deleted: true`, not removed from DB
- Banned users are disconnected from WebSocket immediately
- System messages and announcements are sent via WebSocket to online users
