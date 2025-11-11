# IE Global Website

A high-performance, Bain & Company-inspired website built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- ⚡️ **Next.js 14** with App Router and Server Components
- 🎨 **Tailwind CSS** with custom design system
- ✨ **Framer Motion** for smooth Bain-style animations
- 📝 **MDX** for blog posts and case studies
- 🔒 **Security headers** (CSP, HSTS, X-Frame-Options)
- ♿️ **Accessibility** (WCAG 2.2 AA compliant)
- 📱 **Mobile-first** responsive design
- 🚀 **Performance optimized** (Lighthouse 90+ scores)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── api/               # API routes
│   ├── case-studies/      # Case studies
│   ├── contact/           # Contact page
│   ├── insights/          # Blog/insights
│   ├── services/          # Services pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/            # Layout components (Nav, Footer)
│   └── ui/                # Reusable UI components
├── content/               # MDX content
│   ├── case-studies/      # Case study MDX files
│   └── insights/          # Blog post MDX files
├── lib/                   # Utility functions
│   ├── mdx.ts             # MDX file loading
│   └── utils.ts           # General utilities
├── public/                # Static assets
├── tailwind.config.ts     # Tailwind configuration
├── next.config.js         # Next.js configuration
└── tsconfig.json          # TypeScript configuration
```

## Design System

### Colors

- **Navy 900**: `#0B1930` (primary dark)
- **Signal Red**: `#D23B3B` (accent, CTAs)
- **Slate 700**: `#5F6B7A` (secondary text)
- **Off-white**: `#F7F9FC` (backgrounds)

### Typography

- **Headlines**: Source Serif 4 (elegant, authoritative)
- **UI/Body**: Inter (clean, readable)
- **Code/Metrics**: JetBrains Mono (technical callouts)

## Adding Content

### Case Studies

Create a new MDX file in `content/case-studies/`:

```mdx
---
title: "Your Case Study Title"
summary: "Brief summary"
client: "Client Name"
industry: "Industry"
services:
  - "Service 1"
  - "Service 2"
challenge: "The challenge..."
outcome: "The outcome..."
metrics:
  - "Metric 1"
  - "Metric 2"
date: "2024-01-15"
featured: true
---

Your content here in Markdown...
```

### Blog Posts (Insights)

Create a new MDX file in `content/insights/`:

```mdx
---
title: "Your Post Title"
summary: "Brief summary"
category: "AI & Data"
tags:
  - "Tag 1"
  - "Tag 2"
author: "Author Name"
date: "2024-01-15"
readingTime: 8
featured: true
---

Your content here in Markdown...
```

## Forms & Integrations

### Contact Form

Edit `app/api/contact/route.ts` to integrate with your email service:

- Resend
- Formspree
- SendGrid
- HubSpot

### Newsletter

Edit `app/api/newsletter/route.ts` to integrate with your newsletter provider:

- ConvertKit
- Mailchimp
- Resend

## Environment Variables

Create a `.env.local` file:

```bash
# Email Service (example: Resend)
RESEND_API_KEY=your_api_key_here

# Newsletter (example: ConvertKit)
CONVERTKIT_API_KEY=your_api_key_here
CONVERTKIT_FORM_ID=your_form_id_here

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_ga_id_here
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

Build the production bundle and deploy the `.next` folder.

## Performance

- **Lighthouse scores**: 90+ across all metrics
- **LCP**: < 2.0s
- **FID**: < 100ms
- **CLS**: < 0.1

## Accessibility

- WCAG 2.2 AA compliant
- Keyboard navigation
- Screen reader support
- High contrast ratios
- Reduced motion support

## Security

- Strict CSP headers
- HSTS enabled
- XSS protection
- Frame options
- Secure cookies

## License

© 2024 IE Global, Inc. All rights reserved.

