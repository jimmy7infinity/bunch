# Railway Environment Variables Required

**URGENT**: Add these to your Railway backend deployment:

```bash
# Tenor API
TENOR_API_KEY=AIzaSyCAis3__EqKPLZ60xNv6SZJWMIZxtdfczo

# Cloudinary
CLOUDINARY_CLOUD_NAME=djzec1vdb
CLOUDINARY_API_KEY=373631116233143
CLOUDINARY_API_SECRET=kL6qopdN1ZiBlDVt46Y3XhZY7C0
```

## How to Add to Railway:

1. Go to: https://railway.app/dashboard
2. Select your `poly-banter` backend project
3. Click "Variables" tab
4. Add each variable above
5. Railway will auto-redeploy with new environment variables

## Cloudinary Upload Preset (if not already created):

1. Go to: https://cloudinary.com/console
2. Settings → Upload → Upload presets
3. Add upload preset:
   - Name: `polybanter`
   - Signing Mode: **Unsigned**
   - Folder: `polybanter_chats`
4. Save

Without these environment variables, GIF search and image uploads will fail!

