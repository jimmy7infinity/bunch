# Bunch Admin Panel

Internal admin and moderator panel for Bunch.

## Features

- **Dashboard**: Overview statistics (total users, messages 24h, reports, banned users)
- **Messages**: View recent messages, filter by user/room, view context, delete messages
- **Media**: Browse recent images/GIFs, delete media
- **Users**: Search users, view profiles, ban/mute users, delete all user messages
- **Reports**: Handle user reports, take moderation actions
- **Actions**: Send global announcements and system messages to specific rooms

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Authentication

Only users with `role = "admin"`, `"moderator"`, or `"creator"` can access the admin panel.

The login uses the existing backend JWT authentication. After login, the user's role is checked on the backend via the `AdminGuard`.

## Security

- All routes are protected with JWT authentication
- Backend validates admin role on every request via `AdminGuard`
- Never trust frontend - all actions validated on backend
- JWT tokens stored in localStorage

## API Endpoints

All admin endpoints are prefixed with `/admin` and protected by `AdminGuard`:

- `GET /admin/stats` - Dashboard statistics
- `GET /admin/messages` - Recent messages with filters
- `GET /admin/messages/:id` - Message with context
- `DELETE /admin/messages/:id` - Delete message
- `GET /admin/media` - Recent media
- `GET /admin/users` - Search users
- `GET /admin/users/:id` - User details
- `POST /admin/users/:id/ban` - Ban user
- `POST /admin/users/:id/mute` - Mute user (24h/7d)
- `DELETE /admin/users/:id/messages` - Delete all user messages
- `GET /admin/reports` - List reports
- `POST /admin/announcement` - Send global announcement
- `POST /admin/system-message` - Send system message to room

## Deployment

Build for production:
```bash
npm run build
npm start
```

## Notes

- This is an internal tool, not exposed to regular users
- Keep admin credentials secure
- All moderation actions are logged on the backend
