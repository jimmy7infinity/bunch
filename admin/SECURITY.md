# Admin Dashboard Security Guide

## Overview

This document outlines the security measures, best practices, and deployment guidelines for the Bunch Admin Dashboard.

---

## Security Measures Implemented

### 1. **Authentication & Authorization**

✅ **JWT-based Authentication**
- Tokens issued by backend after OAuth
- Tokens validated on every API request
- Auto-logout on 401/403 responses

✅ **Role-Based Access Control (RBAC)**
- Backend validates user role (admin/moderator/creator)
- Frontend checks role before rendering dashboard
- Unauthorized users redirected to login

✅ **Protected Routes**
- All dashboard pages require authentication
- Token verification on route navigation
- Automatic redirect to `/login` if unauthorized

### 2. **HTTP Security Headers**

Configured in `next.config.ts`:

```typescript
X-Frame-Options: DENY                    // Prevents clickjacking
X-Content-Type-Options: nosniff          // Prevents MIME sniffing
X-XSS-Protection: 1; mode=block          // XSS protection
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 3. **HTTPS Enforcement**

✅ Vercel enforces HTTPS automatically
✅ All API calls use HTTPS
✅ Tokens transmitted over secure connections only

### 4. **Input Sanitization**

⚠️ **Current Status:** Basic validation
📝 **Recommendation:** Add comprehensive input validation (see Improvements section)

### 5. **API Security**

✅ **Backend Protection:**
- `JwtAuthGuard` - Validates JWT on all protected routes
- `AdminGuard` - Verifies admin/mod/creator role
- `BannedUserGuard` - Blocks banned/suspended users
- Rate limiting on backend (100 req/min)

✅ **Frontend Protection:**
- Axios interceptors add Authorization header
- Auto-logout on auth errors
- Token stored in localStorage (see Known Limitations)

---

## Known Limitations & Mitigations

### ⚠️ Token Storage in localStorage

**Risk:** Vulnerable to XSS attacks

**Current Mitigation:**
- Strict Content Security Policy via headers
- React's built-in XSS protection
- No `dangerouslySetInnerHTML` usage
- Input sanitization

**Future Improvement:**
- Move to httpOnly cookies with CSRF tokens
- Implement token refresh mechanism

### ⚠️ No Token Expiration Handling

**Risk:** Expired tokens cause unexpected logouts

**Current Mitigation:**
- Auto-logout on 401 response
- User must re-authenticate

**Future Improvement:**
- Silent token refresh
- Expiration warning to user

### ⚠️ Rate Limiting (Frontend Only)

**Risk:** Admin actions can be spammed

**Current Mitigation:**
- Backend has rate limiting (100 req/min)
- Confirmation dialogs slow down destructive actions

**Future Improvement:**
- Add debouncing on frontend
- Per-action rate limits

---

## Deployment to Vercel

### Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **GitHub Repository** - Code pushed to GitHub
3. **Backend API** - Railway backend URL

### Step 1: Import Project

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Or use Vercel Dashboard
# Go to https://vercel.com/new
```

### Step 2: Configure Project

**Framework Preset:** Next.js
**Root Directory:** `admin`
**Build Command:** `npm run build`
**Output Directory:** `.next`

### Step 3: Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://bunch.up.railway.app/api
```

⚠️ **CRITICAL:** Ensure this matches your Railway backend URL exactly!

### Step 4: Deploy

```bash
# Via Vercel CLI
cd admin
vercel

# Or via Dashboard
# Click "Deploy" and wait for build
```

### Step 5: Verify Deployment

1. Visit your Vercel URL (e.g., `admin-bunch.vercel.app`)
2. Click "Login with Twitter"
3. Verify OAuth redirects correctly
4. Check all pages load properly
5. Test admin actions (create invite code, view users, etc.)

---

## Post-Deployment Security Checklist

### Immediate (Required)

- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel environment variables
- [ ] Test OAuth flow end-to-end
- [ ] Verify only admins/mods/creators can access
- [ ] Check all API calls work (Messages, Users, Reports, etc.)
- [ ] Test invite code generation and management
- [ ] Verify emoji reactions display properly

### Short-term (Recommended)

- [ ] Set up custom domain with SSL
- [ ] Configure domain redirects (www → non-www)
- [ ] Add monitoring/alerting (Vercel Analytics)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Review Vercel logs for errors
- [ ] Test all destructive actions (ban, mute, delete)

### Long-term (Nice-to-have)

- [ ] Implement httpOnly cookies for token storage
- [ ] Add comprehensive input validation
- [ ] Set up audit logging for admin actions
- [ ] Add 2FA for admin accounts
- [ ] Implement token refresh mechanism
- [ ] Add rate limiting on frontend
- [ ] Set up automated security scanning

---

## Security Best Practices

### For Admins

1. **Use Strong Passwords** - For Twitter account
2. **Enable 2FA** - On Twitter account used for admin login
3. **Don't Share Tokens** - Never share admin_token with anyone
4. **Use HTTPS Only** - Never access admin dashboard over HTTP
5. **Log Out When Done** - Always log out on shared computers
6. **Keep Browser Updated** - Use latest browser version
7. **Be Cautious of Phishing** - Verify URL before entering credentials

### For Developers

1. **Never Commit Secrets** - Use `.env.example`, never `.env`
2. **Review Code Changes** - Especially auth/security-related
3. **Test Locally First** - Before deploying to production
4. **Monitor Logs** - Check Vercel and Railway logs regularly
5. **Keep Dependencies Updated** - Run `npm audit` regularly
6. **Use TypeScript Strictly** - No `any` types in production code
7. **Follow Principle of Least Privilege** - Only grant necessary permissions

---

## API Endpoint Security

### Protected Endpoints

All admin endpoints require:
1. Valid JWT token in `Authorization: Bearer <token>` header
2. User role must be `admin`, `moderator`, or `creator`
3. User status must not be `banned` or `suspended`

### Endpoint Permissions

| Endpoint | Action | Role Required |
|----------|--------|---------------|
| `/admin/stats` | View stats | admin/mod/creator |
| `/admin/messages` | View/Delete | admin/mod/creator |
| `/admin/users` | View/Ban/Mute | admin/mod/creator |
| `/admin/reports` | View/Resolve | admin/mod/creator |
| `/admin/invites` | Manage codes | admin/mod/creator |
| `/admin/announcement` | Send announcement | admin/mod/creator |
| `/admin/system-message` | Send message | admin/mod/creator |

**Note:** Backend enforces these permissions. Frontend role checks are for UX only.

---

## Incident Response

### If Credentials Are Compromised

1. **Immediately:**
   - Change MongoDB password in Atlas
   - Regenerate JWT secrets in Railway
   - Ban compromised admin account
   - Review audit logs for unauthorized actions

2. **Short-term:**
   - Force logout all admin sessions
   - Notify other admins
   - Review recent admin actions
   - Check for data breaches

3. **Long-term:**
   - Implement 2FA
   - Improve token security
   - Add audit logging
   - Security training for admins

### If XSS Vulnerability Discovered

1. **Immediately:**
   - Identify and patch vulnerability
   - Deploy fix to production
   - Clear localStorage for all users
   - Force re-authentication

2. **Short-term:**
   - Review all user input points
   - Add input sanitization
   - Implement CSP headers
   - Scan for similar vulnerabilities

3. **Long-term:**
   - Regular security audits
   - Automated vulnerability scanning
   - Security code reviews
   - Developer security training

---

## Monitoring & Logging

### Vercel Analytics

Track:
- Page views
- Response times
- Error rates
- User geography

Enable in Vercel Dashboard → Analytics

### Backend Logs

Monitor in Railway:
- API errors
- Authentication failures
- Admin actions
- Rate limit violations

### Frontend Error Tracking

Recommended tools:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Full observability

---

## Compliance

### GDPR Considerations

- Admin can view user data (messages, profiles)
- Admin can delete user data (messages, accounts)
- Admins must follow data protection regulations
- Log admin actions for audit trail

### Data Retention

- Messages: Retained indefinitely unless deleted
- User data: Retained unless account deleted
- Admin logs: Should be retained for audit (not currently implemented)
- Session tokens: Valid for 7 days (JWT_EXPIRES_IN)

---

## Testing Security

### Manual Testing

```bash
# Test authentication
1. Try accessing /dashboard without login → Redirect to /login
2. Login with non-admin account → Access denied
3. Login with admin account → Access granted

# Test authorization
1. Inspect Network tab → JWT in Authorization header
2. Modify token → Auto-logout on next request
3. Remove token from localStorage → Redirect to login

# Test XSS protection
1. Try entering <script>alert('xss')</script> in forms
2. Verify script doesn't execute
3. Check input is escaped in UI
```

### Automated Testing

```bash
# Security audit
cd admin
npm audit

# Fix vulnerabilities
npm audit fix

# TypeScript checks
npm run build

# Linting
npm run lint
```

---

## Support & Contact

For security issues:
1. **DO NOT** open public GitHub issues
2. Contact: jimmy7infinity@gmail.com
3. Use subject: "Bunch Admin Security Issue"
4. Provide details privately

For general support:
- GitHub Issues (non-security)
- Discord/Twitter (community)

---

## Changelog

### 2026-02-03
- Added security headers to next.config.ts
- Created .env.example for environment variables
- Added comprehensive .gitignore rules
- Fixed emoji reaction layout in chatrooms
- Created vercel.json for deployment
- Documented all security measures
- Added deployment guide

---

## References

- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vercel Security](https://vercel.com/docs/security/secure-your-deployments)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated:** February 3, 2026
**Version:** 1.0.0
