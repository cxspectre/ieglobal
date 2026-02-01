# 🗄️ Supabase Setup Guide for IE Global Portal

## Step 1: Create Supabase Project (5 minutes)

### 1. Sign Up / Login
- Go to: **https://supabase.com**
- Sign up with your email or GitHub
- Verify your email

### 2. Create New Project
- Click **"New Project"**
- **Organization**: Create "IE Global" (if first time)
- **Project Name**: `ie-global-portal`
- **Database Password**: Create a strong password (save it!)
- **Region**: Choose closest to you (e.g., Europe West)
- Click **"Create new project"**
- Wait 2-3 minutes for setup

---

## Step 2: Run Database Migration (2 minutes)

### 1. Go to SQL Editor
- In your Supabase dashboard
- Click **"SQL Editor"** in sidebar
- Click **"New query"**

### 2. Copy & Run the Schema
- Open the file: `supabase/migrations/001_initial_schema.sql`
- **Copy ALL the SQL code**
- **Paste into Supabase SQL Editor**
- Click **"Run"** (bottom right)
- You should see: ✓ Success

### 3. Verify Tables Created
- Go to **"Table Editor"** in sidebar
- You should see all tables:
  - ✓ profiles
  - ✓ clients
  - ✓ projects
  - ✓ milestones
  - ✓ invoices
  - ✓ files
  - ✓ messages
  - ✓ activities
  - ✓ internal_notes
  - ✓ templates

---

## Step 3: Configure Authentication (3 minutes)

### 1. Enable Email Auth
- Go to **"Authentication"** → **"Providers"**
- **Email** should be enabled by default
- If not, enable it

### 2. Configure Email Templates (Optional)
- Go to **"Authentication"** → **"Email Templates"**
- Customize:
  - Confirm signup
  - Magic link
  - Reset password
- Add IE Global branding if desired

### 3. Set Auth Settings
- Go to **"Authentication"** → **"Settings"**
- **Site URL**: `http://localhost:3000` (for now)
- **Redirect URLs**: Add:
  - `http://localhost:3000/dashboard`
  - `http://localhost:3000/portal`
- Save changes

---

## Step 4: Set Up Storage (2 minutes)

### 1. Create Storage Bucket
- Go to **"Storage"** in sidebar
- Click **"Create bucket"**
- **Name**: `client-files`
- **Public**: ❌ Keep it private!
- **File size limit**: 50MB (or your preference)
- Click **"Create bucket"**

### 2. Set Storage Policies
- Click on `client-files` bucket
- Go to **"Policies"**
- Click **"New policy"**
- Template: Custom
- Policy for **SELECT**:
```sql
((bucket_id = 'client-files'::text) AND (
  (EXISTS (SELECT 1 FROM profiles WHERE (profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin', 'employee']))))
  OR
  (EXISTS (SELECT 1 FROM files WHERE (files.storage_path = storage.objects.name) AND (files.client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid()))))
))
```
- This allows: Employees see all, clients see their files only

---

## Step 5: Get API Credentials (1 minute)

### 1. Get Your Keys
- Go to **"Settings"** → **"API"**
- Copy these values:
  - **Project URL** (like: `https://abc123.supabase.co`)
  - **anon public** key (starts with `eyJ...`)
  - **service_role** key (starts with `eyJ...`) - KEEP SECRET!

### 2. Create Environment File
Create `.env.local` in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

**Replace with your actual values!**

---

## Step 6: Add Environment Variables to Vercel

### For Production
- Go to Vercel project → **Settings** → **Environment Variables**
- Add:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Check: **Production**, **Preview**, **Development**
- Save

---

## ⚠️ Production: Create Storage Bucket (fixes "Bucket not found")

If your **live site** shows `{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}` when viewing invoices or files, the **production** Supabase project is missing the Storage bucket. Do this in the **same** Supabase project that your production site uses (the one whose URL is in `NEXT_PUBLIC_SUPABASE_URL`):

1. Open your **production** Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to **Storage** in the sidebar.
3. Click **"New bucket"**.
4. **Name**: `client-files` (must be exactly this).
5. **Public bucket**: Turn **on** — the app uses direct "View" links for invoice PDFs, so the bucket must be public for those links to work.
6. Click **"Create bucket"**.

Then add a policy so files can be read (e.g. **Policies** → **New policy** → use the SELECT policy from Step 4 above). After the bucket exists, invoice and file viewing on the live site should work.

---

## Step 7: Create Your First Admin User (2 minutes)

### 1. Go to Authentication
- **Authentication** → **Users**
- Click **"Add user"** → **"Create new user"**

### 2. Fill Details
- **Email**: cassian.drefke@icloud.com (or your email)
- **Password**: Create strong password
- **Auto Confirm User**: ✓ Check this!
- Click **"Create user"**

### 3. Set Admin Role
- Go to **"Table Editor"** → **profiles** table
- Find your user row
- Edit the **role** column → Change to `admin`
- Save

---

## ✅ Supabase Setup Complete!

You now have:
- ✓ Database with all tables
- ✓ Row Level Security configured
- ✓ Storage bucket for files
- ✓ Authentication enabled
- ✓ Admin user created
- ✓ API keys ready

---

## 🚀 Next Steps

Once Supabase is set up:
1. I'll create the Supabase client utilities
2. Build the authentication system
3. Create the dashboard layouts
4. Implement all portal features

**Ready to continue to the next step?** Let me know when your Supabase project is set up! 🎉

