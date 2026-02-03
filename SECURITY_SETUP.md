# Production Security Setup Guide

## Railway Environment Variables

Your production secrets are stored in Railway (NOT in code). Here's what you need to configure:

### Required Environment Variables in Railway:

```bash
# Database
MONGODB_URI=mongodb+srv://jimmy7:<STRONG_PASSWORD>@polybanter.dnsdecj.mongodb.net/polybanter?retryWrites=true&w=majority

# JWT Secrets (use the generated ones below)
JWT_SECRET=bf96916484bea2463981098d4fa0f2caa050871c8867fa81ed0de5028a6603ea9f444e796309e420fd54af4f40bb31374df6cf82af8eae4b221be3e6b8205e8e
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=107b3d701a2b5a4ba3f83fc6046c572c5a9c1abd347c5544496aeef5a0312e5ee00891bbbfa75d46d5e2831d35ae1b55adf973c37725c3567e5e024834be5343
JWT_REFRESH_EXPIRES_IN=30d

# Environment
NODE_ENV=production
PORT=3000

# URLs (Railway will auto-set these, but you can override)
FRONTEND_URL=https://your-frontend-url.com
API_PREFIX=api
```

## How to Set Railway Environment Variables:

1. Go to your Railway project: https://railway.app/dashboard
2. Click on your backend service
3. Go to "Variables" tab
4. Add each variable above
5. Click "Deploy" to apply changes

## MongoDB Security:

### Change Your MongoDB Atlas Password NOW:

1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Navigate to: Database Access → Users
3. Click "Edit" on user `jimmy7`
4. Click "Edit Password"
5. Generate a strong password (use password manager)
6. Update `MONGODB_URI` in Railway with the new password

## Local Development:

For local development, use `backend/.env` with LOCAL values only:
- Use local MongoDB: `mongodb://localhost:27017/bunch`
- Use weak JWT secrets (only for local dev)
- Never use production secrets locally

Copy `backend/.env.example` to `backend/.env` for local development.

## Security Checklist:

- [x] `.env` files in `.gitignore`
- [x] Production secrets in Railway (not in code)
- [ ] MongoDB password changed to strong random password
- [ ] JWT secrets updated in Railway
- [ ] Test production deployment after changes

## Important Rules:

1. **NEVER commit `.env` files** (except `.env.example`)
2. **Production secrets ONLY in Railway** - never in code
3. **Rotate secrets if exposed** - generate new ones immediately
4. **Use different secrets for dev vs production**

## Regenerating Secrets:

If you need to generate new JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this twice to get JWT_SECRET and JWT_REFRESH_SECRET.
