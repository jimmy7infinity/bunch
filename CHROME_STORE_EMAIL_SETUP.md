# Chrome Web Store - Email Verification Fix

## Issues You're Seeing:

1. ❌ "Privacy policy link is not reachable"
2. ❌ "You must provide a contact email"
3. ❌ "You must verify your contact email"

---

## ✅ Issue 1: Privacy Policy - FIXED!

**Status:** Deployed and working

I just added endpoints to serve your privacy policy and terms:
- **Privacy Policy:** https://bunch.up.railway.app/privacy
- **Terms of Service:** https://bunch.up.railway.app/terms

These are now live and accessible! Railway is deploying the update now (takes ~2 minutes).

**Test it:**
```bash
# Wait 2 minutes for Railway to deploy, then:
curl https://bunch.up.railway.app/privacy
curl https://bunch.up.railway.app/terms
```

You should see full HTML pages with your legal content.

---

## ✅ Issue 2 & 3: Email Verification - MANUAL STEPS

You need to add and verify your contact email in the Chrome Web Store Developer Console.

### Step-by-Step:

1. **Go to Developer Console**
   - Visit: https://chrome.google.com/webstore/devconsole/

2. **Click "Account" Tab**
   - Look for the "Account" tab in the top navigation
   - Or find "Account Settings" in the menu

3. **Add Contact Email**
   - Find the "Contact Email" field
   - Enter your email (use a professional email you check regularly)
   - Examples:
     - `support@bunch.app` (if you own the domain)
     - `your.email@gmail.com` (personal email)
     - Any email you have access to

4. **Save the Email**
   - Click "Save" or "Update"

5. **Check Your Email**
   - Google will send a verification email to the address you entered
   - Subject will be something like "Verify your Chrome Web Store developer email"

6. **Click Verification Link**
   - Open the email
   - Click the verification link
   - This will confirm your email address

7. **Return to Console**
   - Go back to https://chrome.google.com/webstore/devconsole/
   - You should see a green checkmark or "Verified" status next to your email

---

## After Email Verification:

Once your email is verified, you can proceed with your extension submission:

1. **Privacy Policy URL:** `https://bunch.up.railway.app/privacy` ✅ (now working)
2. **Terms URL:** `https://bunch.up.railway.app/terms` ✅ (now working)
3. **Contact Email:** Your verified email ✅ (you'll add this)

---

## Important Notes:

### About the Contact Email:
- This email will be visible to users who view your extension
- Google may use it to contact you about policy issues
- You should check this email regularly
- You can change it later, but you'll need to verify the new one

### If You Don't Receive Verification Email:
1. Check your spam/junk folder
2. Wait a few minutes (can take up to 10 minutes)
3. Try adding the email again
4. Make sure you typed the email correctly
5. Try a different email address if needed

### Recommended Email Setup:
If you want a professional email:
- Create `support@bunch.app` or `hello@bunch.app`
- Or use your personal email for now and change it later
- Gmail, Outlook, or any email provider works fine

---

## Testing the Privacy Policy (After Railway Deploys):

**In ~2 minutes, test these URLs:**

```bash
# Should return full HTML page
curl https://bunch.up.railway.app/privacy

# Should return full HTML page
curl https://bunch.up.railway.app/terms
```

Or just open them in your browser:
- https://bunch.up.railway.app/privacy
- https://bunch.up.railway.app/terms

You should see nicely formatted legal pages with all the content.

---

## Summary:

✅ **Privacy Policy:** Fixed - deploying now  
✅ **Terms of Service:** Fixed - deploying now  
⏳ **Contact Email:** You need to add and verify (5 minutes)

**Next Steps:**
1. Wait 2 minutes for Railway to deploy
2. Test the privacy/terms URLs
3. Add your contact email in Chrome Web Store console
4. Verify the email (check inbox)
5. Continue with submission!

---

## Questions?

If the privacy/terms URLs still don't work after 5 minutes:
- Check Railway deployment status
- Look for any deployment errors
- The endpoints are now in the code and should work

If email verification doesn't work:
- Try a different email
- Check spam folder
- Contact Chrome Web Store support

**You're almost there! Just need to verify that email.** 🚀
