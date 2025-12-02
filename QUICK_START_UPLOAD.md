# 🚀 Quick Start: Upload Portal (2 Minutes!)

## ✅ Fixed Issues

1. ✅ **Navigation bar removed** from upload page
2. ✅ **Storage policies SQL** created for you

---

## 🏃 Quick Setup (Do This Now!)

### Step 1: Create Storage Bucket (1 minute)

1. Go to **https://supabase.com** → Your IE Global project
2. Click **"Storage"** in left sidebar
3. Click **"New bucket"** button
4. Enter:
   - **Name:** `client-documents` 
   - **Public:** ❌ **LEAVE UNCHECKED** (keep private)
   - **File size limit:** `10485760` (10MB)
5. Click **"Create bucket"**

### Step 2: Add Storage Policies (1 minute)

1. In Supabase, click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Copy ALL the SQL from: `supabase/storage_policies.sql`
4. Paste into the editor
5. Click **"Run"** (bottom right)
6. Should see "Success"

---

## 🧪 Test It Now!

### Test 1: Onboard a Client

1. Go to `/dashboard/clients`
2. Click **"Onboard Client"** (red button)
3. Fill in Steps 1-2
4. **Step 3 (IMPORTANT!):**
   - ✅ Check "Discovery Questionnaire"
   - ✅ Check "Access Credentials"
   - ✅ **Scroll down** → Check **"Send Client Upload Request Link"**
5. **Step 5:**
   - ✅ Check "Send Welcome Email"
6. Click **"Complete Onboarding"**

### Test 2: Check Emails

You should get **TWO** emails:

1. **"Welcome to IE Global"** - General welcome
2. **"Document Upload Request"** - With upload link!

### Test 3: Try Upload Portal

1. Click the upload link in the second email
2. Should see:
   - ✅ IE Global logo (no navigation bar!)
   - ✅ Clean upload page
   - ✅ "Download Template" buttons
   - ✅ Upload zones

3. Try:
   - Download a template (should be PDF with logo)
   - Upload a test file (PDF, image, etc.)
   - Should see success message!

---

## 🐛 Troubleshooting

### Still Getting "Bucket not found"?
- Verify bucket name is exactly: `client-documents` (no typos!)
- Refresh your page after creating bucket
- Check bucket was created in the correct project

### Navigation bar still showing?
- Restart your dev server: `Ctrl+C` then `npm run dev`
- Clear browser cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### Upload link not in email?
Make sure in Step 3 you:
- Selected at least one document
- Checked the **"Send Client Upload Request Link"** box

### Templates not downloading?
- Check console for errors
- Verify `jspdf` is installed: `npm install jspdf`
- Try clicking again (sometimes takes a moment)

---

## 📧 What Clients See

### Email:
```
Subject: Document Upload Request - [Client Name]

📄 Document Upload Request

Required Documents:
• Discovery Questionnaire [REQUIRED]
• Access Credentials [REQUIRED]

[BIG BUTTON: 📤 Upload Documents Securely]

💡 Click the button above to access our 
secure upload portal. Download templates 
and upload everything directly!
```

### Upload Page:
```
[IE Global Logo - Top Right]

Document Upload Portal
Welcome, John!

Upload requested documents for Acme Corp

━━━━━━━━━━━━━━━━━━━━━━

How to Upload:
1. Download templates (if available)
2. Fill out the template
3. Click "Choose Files"
4. Files upload instantly

━━━━━━━━━━━━━━━━━━━━━━

📋 Discovery Questionnaire
[Download Template] [Choose Files ▼]

🔐 Access Credentials  
[Download Template] [Choose Files ▼]

━━━━━━━━━━━━━━━━━━━━━━

Need help? Contact hello@ie-global.net
All uploads are secure and encrypted.
```

---

## ✅ Success Checklist

After setup, verify:

- [ ] Bucket `client-documents` exists in Supabase Storage
- [ ] 4 storage policies are created
- [ ] Upload page has NO navigation bar
- [ ] Can onboard a test client
- [ ] Receive both emails (Welcome + Upload Request)
- [ ] Upload link works (opens clean portal page)
- [ ] Templates download as PDFs with IE Global logo
- [ ] Can upload a test file successfully
- [ ] File appears in Supabase Storage
- [ ] File record created in `files` table

---

## 📊 Where Files Are Stored

**In Supabase Storage:**
```
client-documents/
  ├── [client-id-1]/
  │   ├── discovery/
  │   │   └── discovery_1234567890_0.pdf
  │   ├── access/
  │   │   └── access_1234567891_0.pdf
  │   └── brand/
  │       └── brand_1234567892_0.zip
  └── [client-id-2]/
      └── ...
```

**In Database (`files` table):**
- `client_id` - Which client
- `file_name` - Original filename
- `file_url` - Supabase public URL
- `storage_path` - Path in bucket
- `category` - Document type (discovery, access, etc.)
- `created_at` - Upload timestamp

---

## 🎯 Next Steps After Setup

1. ✅ Test with a real client email (yours for testing)
2. ✅ Try downloading all 3 templates
3. ✅ Upload different file types (PDF, Word, images)
4. ✅ Check files appear in Supabase Storage
5. ✅ Onboard 1-2 real clients

---

## 💡 Pro Tips

**For Clients:**
- Templates make it super easy (they just fill in blanks)
- Can upload from phone/tablet/desktop
- Can come back and add more files later
- Upload link doesn't expire

**For You:**
- All files organized by client automatically
- Can see uploads in Supabase Storage
- Can download files anytime
- Secure and encrypted

---

**That's it! You're ready to go!** 🚀

Everything should work now:
1. ✅ Bucket created
2. ✅ Policies added  
3. ✅ Navigation removed from upload page
4. ✅ Emails sending

Test the full flow and you should be good! 🎉

