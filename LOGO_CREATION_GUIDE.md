# Grex Logo Creation Guide

## Quick Logo Options

### Option 1: Use Canva (Recommended - 15 minutes)
1. Go to https://www.canva.com
2. Create account (free)
3. Search for "Logo" templates
4. Choose simple text-based design
5. Type "GREX" in bold font
6. Add simple icon (chat bubble, network, flock of birds)
7. Export as PNG in these sizes:
   - 128x128 (for Chrome Store)
   - 48x48 (for extension)
   - 16x16 (for extension)

**Color Suggestions:**
- Primary: #5BC854 (green, matches your theme)
- Background: Transparent or #19191A (dark)
- Text: White or gradient

### Option 2: Use Figma (Professional - 30 minutes)
1. Go to https://www.figma.com
2. Create new file
3. Create frames: 128x128, 48x48, 16x16
4. Add text "GREX" with bold font (Inter, Poppins, or Montserrat)
5. Add simple geometric shape or icon
6. Export as PNG

### Option 3: Hire on Fiverr ($5-20, 24 hours)
1. Go to https://www.fiverr.com
2. Search "simple logo design"
3. Find seller with quick turnaround
4. Provide brief: "Text-based logo for 'GREX' - a chat app for traders. Modern, clean, professional. Need 128x128, 48x48, 16x16 PNG files."

### Option 4: Use AI Logo Generator (5 minutes)
1. Go to https://www.logoai.com or https://looka.com
2. Enter "GREX"
3. Select style: Modern, Tech, Minimal
4. Generate options
5. Download PNG files

---

## Required Files

Replace these files in `frontend/public/`:

1. **icon-128.png** (128x128) - Main icon for Chrome Store
2. **icon-48.png** (48x48) - Medium icon
3. **icon-16.png** (16x16) - Small icon
4. **logo.png** (flexible size, ~200x50) - For login page
5. **favicon.png** (32x32) - Browser favicon
6. **text_logo.png** (flexible, ~300x80) - Text logo

---

## Temporary Solution: Text-Only Logo

If you need to launch ASAP, use a simple text-based approach:

### Using macOS Preview (5 minutes):
1. Open Preview
2. File → New from Clipboard
3. Tools → Adjust Size → Set to 128x128
4. Tools → Annotate → Text
5. Type "GREX" in large bold font
6. Center it
7. Export as PNG
8. Repeat for 48x48 and 16x16

### Using Online Tool (3 minutes):
1. Go to https://www.photopea.com (free Photoshop alternative)
2. Create new project: 128x128
3. Add text "GREX" in bold
4. Style with color #5BC854
5. Export as PNG
6. Repeat for other sizes

---

## Design Guidelines

### Brand Identity: Grex
- **Meaning:** Latin for "flock" or "herd" (community, togetherness)
- **Vibe:** Modern, professional, community-focused
- **Colors:** 
  - Green: #5BC854 (success, growth)
  - Dark: #19191A (background)
  - White: #FFFFFF (text)

### Logo Style Ideas:
1. **Simple Text:** Just "GREX" in bold, modern font
2. **Text + Icon:** "GREX" with small chat bubble
3. **Geometric:** Abstract shape suggesting connection/network
4. **Minimalist:** Single letter "G" with clever design
5. **Flock/Herd:** Subtle bird or animal silhouettes

### Font Suggestions:
- **Bold & Modern:** Inter, Poppins, Montserrat, Roboto
- **Tech/Startup:** Space Grotesk, DM Sans, Work Sans
- **Professional:** Helvetica, Arial, SF Pro

---

## After Creating Logo

1. Save all sizes in `frontend/public/`
2. Rebuild extension:
   ```bash
   cd frontend
   npm run build
   node scripts/copy-extension-files.js
   ```
3. Test extension loads with new logo
4. Create ZIP for Chrome Store

---

## Current Status

✅ All text rebranded to "Grex"  
⚠️ Logo files still show old branding  
📝 Need to replace 6 image files  

**Time to complete:** 15-30 minutes with Canva/Photopea

---

## Need Help?

If you want to launch with placeholder logos:
1. Use simple text "GREX" on colored background
2. Can always update later in Chrome Store
3. Focus on functionality first, polish later

**Recommendation:** Use Canva or Photopea for quick professional-looking logo, then launch!
