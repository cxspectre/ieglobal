# 🚀 Production Deployment Checklist

## ✅ Local Environment Updated
- ✅ `NEXT_PUBLIC_SITE_URL` changed to `https://ie-global.net`
- ✅ Code uses environment variables (not hardcoded)

---

## 📋 Pre-Deployment Steps

### 1. Add Environment Variables to Vercel (Critical!)

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these for Production:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vuanlnmdlcgeiarxeklu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1YW5sbm1kbGNnZWlhcnhla2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzA5NjUsImV4cCI6MjA3OTI0Njk2NX0.wDn4Dy9J98Zd8NG2KhBmvd7v3cdANcV7-KjFla9ru1g

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1YW5sbm1kbGNnZWlhcnhla2x1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3MDk2NSwiZXhwIjoyMDc5MjQ2OTY1fQ.H1F_HV6nm9bCf1CKhBVasCFsR-KEhtZP2m6jfKhnLY0

RESEND_API_KEY=re_U499yp9i_939objuKWYtn4AZYkeUEY1tK

NEXT_PUBLIC_SITE_URL=https://ie-global.net
```

**Important:** Check ALL environments (Production, Preview, Development)

---

### 2. Update Supabase Redirect URLs (Critical!)

**Go to:** Supabase Dashboard → Authentication → URL Configuration

**Update Redirect URLs to include production:**

**Site URL:**
```
https://ie-global.net
```

**Redirect URLs** (add both localhost and production):
```
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
https://ie-global.net/auth/callback
https://ie-global.net/reset-password
```

**Save changes**

---

### 3. Test Locally with Production URL (Optional)

**Temporarily update** `.env.local` back to localhost for local testing:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Or** just proceed to deployment!

---

## 🚀 Deploy to Production

### Option A: Auto-Deploy via Git Push

```bash
git add -A
git commit -m "feat: Production ready - Portal system complete with client/employee dashboards"
git push origin main
```

**Vercel will automatically:**
- Detect the push
- Build your site
- Deploy to ie-global.net
- Takes ~3-5 minutes

---

### Option B: Manual Deploy via Vercel CLI

```bash
vercel --prod
```

---

## ✅ Post-Deployment Checks

### 1. Test Main Website
- ✅ Visit: https://ie-global.net
- ✅ Navigate all pages
- ✅ Test contact form
- ✅ Check case studies

### 2. Test Portal System
- ✅ Visit: https://ie-global.net/login
- ✅ Log in as employee
- ✅ Create a test client
- ✅ Create portal account for client
- ✅ Check if invitation email arrives

### 3. Test Client Portal
- ✅ Use invitation link from email
- ✅ Set password
- ✅ Log in as client
- ✅ See projects, milestones, invoices

### 4. Verify Integrations
- ✅ Supabase: Database queries work
- ✅ Storage: File uploads work
- ✅ Resend: Emails arrive
- ✅ Vercel Analytics: Tracking works

---

## 🎯 What Gets Deployed

**Public Website:**
- Homepage with hero carousel
- About, Approach, Services
- Case Studies (4 professional projects)
- Careers, Contact
- Legal pages (Privacy, Terms, Imprint)

**Employee Dashboard:**
- Client management
- Project tracking
- Milestones
- Invoices
- File uploads
- Messages
- Settings & Command Center

**Client Portal:**
- Project overview
- Milestones view
- Invoices
- File downloads
- Messages with team

---

## ⚠️ Important Notes

**Security:**
- Service role key is secret (only in Vercel env vars, never in Git)
- `.env.local` is gitignored
- RLS policies protect all data

**Domain:**
- Domain is already connected: ie-global.net
- Vercel auto-deploys from GitHub main branch

**Emails:**
- Resend works in production
- contact@ie-global.net is the from address
- Client invitations will work

---

## 🎉 Ready to Deploy!

Once you:
1. ✅ Add environment variables to Vercel
2. ✅ Update Supabase redirect URLs
3. ✅ Push to GitHub

**Your site + portal will be live!** 🚀

---

## 🆘 If Something Breaks

**Check:**
1. Vercel deployment logs
2. Browser console for errors
3. Supabase logs (Database → Logs)
4. Resend dashboard for email delivery

**Common issues:**
- Missing environment variables
- Redirect URLs not configured
- RLS policies blocking access

Let me know when you're ready to deploy!

