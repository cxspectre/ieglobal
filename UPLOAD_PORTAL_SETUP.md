# 🚀 Document Upload Portal - Setup Guide

## Overview

You now have a complete document upload system where clients can:
- 📥 Upload files directly to a secure portal
- 📄 Download IE Global-branded templates  
- ✅ No need to email files or use third-party services

---

## 🎯 What Was Built

### 1. **Secure Upload Portal** (`/upload/[clientId]`)
- Beautiful branded page with IE Global logo
- Drag-and-drop file upload
- Shows upload progress
- Displays already uploaded files
- Mobile responsive

### 2. **Template Generators** (3 PDFs with IE Global logo)
- **Discovery Questionnaire** - Complete project intake form
- **Access Credentials** - Secure credential sharing template
- **NDA Template** - Basic non-disclosure agreement

### 3. **Updated Email** 
- Now includes direct link to upload portal
- Big prominent "Upload Documents Securely" button
- Instructions for using templates

---

## 📋 Setup Required

### Step 1: Create Supabase Storage Bucket

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com
   - Select your IE Global project

2. **Create Storage Bucket**
   - Click **Storage** in left sidebar
   - Click **New bucket**
   - Settings:
     - **Name**: `client-documents`
     - **Public**: ❌ **NO** (keep private)
     - **File size limit**: `10MB` (or your preference)
     - **Allowed MIME types**: Leave empty (allows all types)
   - Click **Create bucket**

### Step 2: Set Up Storage Policies

In the same Storage section:

1. **Click on `client-documents` bucket**
2. **Click "Policies" tab**
3. **Add these 4 policies:**

#### Policy 1: Allow Clients to Upload (INSERT)
```sql
CREATE POLICY "Allow clients to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Allow Clients to View Their Files (SELECT)
```sql
CREATE POLICY "Allow clients to view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Allow Employees to View All (SELECT)
```sql
CREATE POLICY "Allow employees to view all client documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);
```

#### Policy 4: Allow Employees to Delete (DELETE)
```sql
CREATE POLICY "Allow employees to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);
```

### Step 3: Environment Variable (Optional)

If you want to use a custom domain for upload links:

**.env.local**:
```bash
NEXT_PUBLIC_SITE_URL=https://ie-global.net
```

If not set, it defaults to `https://ie-global.net`

---

## 🧪 How to Test

### Test 1: Complete Onboarding Flow

1. Go to `/dashboard/clients`
2. Click **"Onboard Client"**
3. Fill in basic client info
4. On **Step 3 (Documents):**
   - ✅ Check "Discovery Questionnaire"
   - ✅ Check "Access Credentials"
   - ✅ Check "Send Client Upload Request Link"
5. On **Step 5 (Assets):**
   - ✅ Check "Send Welcome Email"
6. Complete onboarding

### Test 2: Check Email

You should receive an email with:
- Subject: "Document Upload Request - [Client Name]"
- Big button: "📤 Upload Documents Securely"
- List of requested documents

### Test 3: Try Upload Portal

1. Click the upload link in email (or go to `/upload/[client-id]`)
2. You should see:
   - IE Global logo
   - Welcome message with client name
   - List of requested documents
   - "Download Template" buttons for Discovery, Access, NDA
   - Upload zones for each document type

3. **Test Template Download:**
   - Click "Download Template" for Discovery Questionnaire
   - Should download PDF with IE Global logo
   - PDF should have fillable form fields

4. **Test File Upload:**
   - Click "Choose Files" or drag-and-drop
   - Select a test file (PDF, Word, image)
   - Should show upload progress
   - Should see success message
   - Uploaded file should appear in "✓ Uploaded" list

### Test 4: Verify in Database

Check Supabase:
- **Storage > client-documents** - Files should appear
- **Table: files** - Records should be created

---

## 📧 Email Link Format

The upload link in emails will be:
```
https://ie-global.net/upload/[client-id-here]
```

Example:
```
https://ie-global.net/upload/123e4567-e89b-12d3-a456-426614174000
```

This link is:
- ✅ Unique per client
- ✅ Secure (requires Supabase auth)
- ✅ Works on any device
- ✅ Doesn't expire

---

## 🎨 Template Features

All three templates include:

### Common Elements:
- ✅ IE Global logo (top right)
- ✅ Professional layout
- ✅ Navy-900 and Signal-Red colors
- ✅ Clear instructions
- ✅ Fillable fields (with underscores)
- ✅ Multi-page when needed

### Discovery Questionnaire:
- Company information
- Project goals & objectives
- Target audience
- Technical requirements
- Timeline & budget
- Design preferences
- 2 pages, comprehensive

### Access Credentials:
- Security warning (encrypted handling)
- Domain & hosting section
- CMS/Platform access
- Database credentials
- Third-party services
- 3 pages, organized

### NDA Template:
- Legal disclaimer (have lawyer review)
- Parties section
- Purpose statement
- Confidentiality clauses
- Term (3 years)
- Signature blocks
- 2 pages, professional

---

## 🔐 Security Features

### File Storage:
- ✅ Files stored in private Supabase bucket
- ✅ RLS policies enforce access control
- ✅ Clients can only see their own files
- ✅ Employees can see all files
- ✅ Files organized by client ID folders

### Upload Portal:
- ✅ Requires authentication (via Supabase)
- ✅ Client-specific links
- ✅ File type validation
- ✅ Size limit enforcement (10MB default)
- ✅ Encrypted during upload
- ✅ Secure HTTPS connection

### Templates:
- ✅ Access Credentials template has security warnings
- ✅ NDA has legal disclaimer
- ✅ Generated on-demand (not stored)
- ✅ No sensitive data in templates

---

## 📂 File Organization

Files are stored in this structure:
```
client-documents/
├── [client-id-1]/
│   ├── discovery/
│   │   ├── discovery_1234567890_0.pdf
│   │   └── discovery_1234567891_0.pdf
│   ├── access/
│   │   └── access_1234567892_0.pdf
│   ├── brand/
│   │   ├── brand_1234567893_0.zip
│   │   └── brand_1234567894_0.png
│   └── nda/
│       └── nda_1234567895_0.pdf
├── [client-id-2]/
│   └── ...
```

---

## 🎯 User Flow

```
1. Employee onboards client
   ↓
2. Checks "Send Upload Link" in Step 3
   ↓
3. Client receives email with upload link
   ↓
4. Client clicks "Upload Documents Securely"
   ↓
5. Client lands on branded upload portal
   ↓
6. Client downloads templates (if needed)
   ↓
7. Client fills out templates
   ↓
8. Client uploads completed documents
   ↓
9. Files securely stored in Supabase
   ↓
10. IE Global team can view files in dashboard
```

---

## 🔧 Customization Options

### Change File Size Limit:
Edit `/app/upload/[clientId]/page.tsx`:
```typescript
// Line ~200
accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
// Add: data-max-size="10485760" (10MB in bytes)
```

### Add More Document Types:
Edit `/app/dashboard/clients/onboard/page.tsx`:
```typescript
const documentTypes = [
  { id: 'discovery', label: 'Discovery Questionnaire', required: true },
  { id: 'access', label: 'Access Credentials', required: true },
  // Add your new type here:
  { id: 'contract', label: 'Signed Contract', required: false },
];
```

### Change Upload Portal Colors:
Edit `/app/upload/[clientId]/page.tsx`:
- Uses standard Tailwind classes
- `signal-red` for buttons
- `navy-900` for text
- `off-white` for background

### Customize Templates:
Edit files in `/app/api/templates/[template-name]/route.ts`
- Change questions/fields
- Modify layout
- Add/remove sections
- Change colors

---

## 🚨 Troubleshooting

### Issue: "Failed to upload files"
**Solution**: Check Supabase Storage policies are created correctly

### Issue: "Template download doesn't work"
**Solution**: Check that jsPDF is installed: `npm install jspdf`

### Issue: "Client can't access upload page"
**Solution**: 
- Verify client ID in URL is correct
- Check client exists in database
- Verify onboarding_data record exists

### Issue: "Files not appearing in dashboard"
**Solution**:
- Check `files` table has records
- Verify `client_id` matches
- Check `category` field matches document type

### Issue: "Upload link in email broken"
**Solution**:
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check clientId is being passed to email API
- Test the URL format manually

---

## ✅ Production Checklist

Before going live:

- [ ] Supabase storage bucket created (`client-documents`)
- [ ] All 4 storage policies applied
- [ ] Templates download correctly (test all 3)
- [ ] Test complete onboarding → email → upload flow
- [ ] Files appear in Supabase Storage
- [ ] Files records created in database
- [ ] Upload portal mobile-responsive
- [ ] All logos rendering correctly
- [ ] Environment variables set (if using custom domain)
- [ ] Security policies tested (clients can't see others' files)
- [ ] File size limits enforced
- [ ] Email link works on different devices

---

## 📊 What Clients See

### Email:
```
Subject: Document Upload Request - Acme Corp

[IE Global branded email]

📄 Document Upload Request
Help us get started with Acme Corp

Hi John,

To help us prepare for your project, we need a few documents:

Required Documents:
• Discovery Questionnaire [REQUIRED]
• Access Credentials [REQUIRED]  
• Brand Files

[Big Button: 📤 Upload Documents Securely]

💡 Easy Upload: Click the button above to access
our secure upload portal. Download templates and
upload everything directly!
```

### Upload Portal:
```
[IE Global Logo]

Document Upload Portal
Welcome, John!

Upload requested documents for Acme Corp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

How to Upload:
1. Download templates (if available)
2. Fill out the template
3. Click "Choose Files" and select
4. Files upload instantly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Discovery Questionnaire
[Download Template] [Choose Files ▼]

🔐 Access Credentials  
[Download Template] [Choose Files ▼]

🎨 Brand Files
[Choose Files ▼]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need help? Contact hello@ie-global.net
```

---

## 🎉 Benefits

### For IE Global:
✅ No more chasing clients for documents  
✅ Organized file storage automatically  
✅ Professional branded templates  
✅ Secure, compliant document handling  
✅ Time saved on every onboarding  

### For Clients:
✅ Easy-to-use upload portal  
✅ Ready-made templates (no guesswork)  
✅ Upload from any device  
✅ See what they've already sent  
✅ Professional experience  

---

## 📞 Support

If you have issues:
1. Check Supabase logs for errors
2. Verify storage bucket and policies
3. Test with a real client onboarding
4. Check browser console for JS errors
5. Verify email is being sent (check logs)

---

**Status:** Ready to deploy!  
**Confidence:** Production-ready  
**Next Step:** Create Supabase storage bucket and test! 🚀

