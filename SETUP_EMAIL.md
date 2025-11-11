# Email Setup Instructions

## ✅ Contact Form Email Setup (5 Minutes)

Your contact form is now configured to send emails using **Resend** - a modern email API that works perfectly with Vercel.

---

## Step 1: Create Resend Account (Free)

1. Go to: **https://resend.com/signup**
2. Sign up with your email
3. Verify your email address
4. You'll get **3,000 free emails/month** (perfect to start!)

---

## Step 2: Get Your API Key

1. Log into Resend
2. Go to: **API Keys** (in sidebar)
3. Click **"Create API Key"**
4. Name it: `IE Global Website`
5. Copy the API key (starts with `re_...`)

**Important:** Save it immediately - you can't see it again!

---

## Step 3: Add Domain (Optional but Recommended)

### Option A: Use Your Domain (Professional)
1. In Resend, go to **Domains**
2. Click **"Add Domain"**
3. Add: `ieglobal.com`
4. Add the DNS records Resend provides
5. Wait for verification (~5-10 minutes)
6. Emails will come from: `contact@ieglobal.com`

### Option B: Use Resend's Domain (Quick Start)
- Skip domain setup
- Emails come from: `onboarding@resend.dev`
- Works immediately but less professional

---

## Step 4: Configure Vercel

1. Go to your Vercel project: https://vercel.com
2. Click on your **ieglobal** project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Paste your API key (re_...)
   - **Environments:** Check all (Production, Preview, Development)
5. Click **Save**

---

## Step 5: Redeploy

After adding the environment variable:

1. Go to **Deployments** tab
2. Click the **3 dots** on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

**That's it! Your contact form now sends emails!** ✅

---

## 🧪 Test It

1. Go to your live site: `https://ieglobal.vercel.app/contact`
2. Fill out the contact form
3. Submit
4. Check your inbox at `hello@ie-global.net`
5. You should receive a formatted email!

---

## 📧 What You'll Receive

Each contact form submission sends you an email with:

**Subject:** `New Contact: [Name] from [Company]`

**Email includes:**
- Name
- Email (with reply-to link)
- Company (if provided)
- Timeline (if selected)
- Ongoing support preference (Yes/No)
- Full message
- Timestamp

**Reply-To:** The email automatically sets reply-to as the sender's email, so you can just hit "Reply"!

---

## 🔒 Security

- ✅ API key stored securely in environment variables
- ✅ Never exposed to browser
- ✅ Rate limiting built into Vercel
- ✅ Validation on both client and server

---

## 💰 Pricing

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- All features included

**If you exceed:**
- $20/month for 50,000 emails
- Very affordable for business use

---

## 🆘 Troubleshooting

**Not receiving emails?**
1. Check spam/junk folder
2. Verify API key is correct in Vercel
3. Check Resend logs: https://resend.com/logs
4. Verify domain DNS if using custom domain

**Form not submitting?**
1. Check browser console for errors
2. Check Vercel function logs
3. Verify environment variable is set

---

## 🎯 Your Email Will Look Like This:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New Contact Form Submission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: John Smith
Email: john@company.com
Company: Acme Corp
Timeline: Within 1-2 months
Ongoing Support: Yes

Message:
We're looking to rebuild our main website...
[full message here]

Submitted: Nov 11, 2025, 3:45 PM ET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**Your contact form is ready to go live!** 🚀

Questions? Check: https://resend.com/docs

