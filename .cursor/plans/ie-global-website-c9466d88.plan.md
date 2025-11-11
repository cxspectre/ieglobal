<!-- c9466d88-7093-4e5e-9ce5-5ea5ed89e47b 1895e6f7-6c47-4725-bd59-005dac667450 -->
# IE Global Website - Production Build

## Overview

Create a sophisticated, high-performance website matching Bain & Company's visual excellence, storytelling depth, and interaction polish. The site will showcase IE Global's digital engineering capabilities through compelling design, smooth animations, and measurable outcomes.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + custom design system
- **Animations**: Framer Motion (Bain-style micro-interactions)
- **Content**: MDX + Contentlayer (blog/insights/case studies)
- **Forms**: React Hook Form + Resend/Formspree
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics + optional Plausible

## Design System (Bain-Inspired)

### Color Palette

```css
--navy-900: #0B1930     (primary dark)
--navy-800: #1a2942
--signal-red: #D23B3B   (accent, CTAs)
--slate-700: #5F6B7A    (secondary text)
--off-white: #F7F9FC    (backgrounds)
--glass: rgba(255,255,255,0.05) (overlays)
```

### Typography

- **Headlines**: Source Serif Pro (elegant, authoritative)
- **UI/Body**: Inter (clean, readable)
- **Code/Metrics**: JetBrains Mono (technical callouts)

### Components to Build

1. Hero sections with parallax backgrounds
2. Value proposition cards with hover states
3. Service cards with reveal animations
4. Case study tiles with gradient overlays
5. Metric counters with scroll-triggered animations
6. Testimonial/proof blocks
7. Newsletter signup with inline validation
8. Contact form with progressive disclosure
9. Navigation with mega-menu (services)
10. Footer with organized sitemap
11. Blog post cards with category tags
12. Leadership bio cards
13. Timeline/process visualizations
14. Logo walls with subtle animations

## Site Structure

### Pages

```
/                          → Home
/about                     → About IE Global
/services                  → Services hub
/services/ai-data-strategy → Service detail
/services/customer-experience → Service detail
/services/go-to-market-pricing → Service detail
/services/operating-model → Service detail
/services/digital-product → Service detail
/industries                → Industries hub (optional)
/case-studies              → Case studies listing
/case-studies/[slug]       → Individual case
/insights                  → Blog/insights
/insights/[slug]           → Individual post
/careers                   → Careers page
/contact                   → Contact form
/privacy                   → Privacy policy
/terms                     → Terms of service
```

## Key Bain-Style Features

### 1. Hero Storytelling

- Large, bold headlines with staggered fade-in
- Subheadings that build context
- Dual CTAs (primary + secondary)
- Background: subtle gradient mesh or abstract visual
- Scroll indicator with smooth animation

### 2. Micro-Interactions

- Button hover: scale + glow effect
- Card hover: lift + shadow + border glow
- Link underlines: animated from left
- Images: parallax scroll, reveal on viewport
- Numbers: count-up animation on scroll
- Navigation: smooth mega-menu slide-down

### 3. Content Rhythm

- Alternating full-width and contained sections
- Strategic white space (breathing room)
- Pull quotes with large typography
- Inline metrics with visual emphasis
- Section transitions with fade/slide

### 4. Proof & Trust

- Client logo walls (grayscale → color on hover)
- Metric callouts in hero sections
- Case study cards with outcome headlines
- Testimonial blocks with company context

### 5. Responsive Excellence

- Mobile-first design
- Touch-friendly targets (44px min)
- Simplified navigation on mobile
- Optimized images (WebP, srcset)
- Performance budget: LCP < 2.0s

## Implementation Phases

### Phase 1: Foundation & Design System

- Next.js project setup with TypeScript
- Tailwind config with custom color tokens
- Base components library
- Layout templates (with navigation/footer)
- Font loading optimization

### Phase 2: Core Pages

- Homepage with hero, value props, services preview, proof, CTA
- About page with leadership, values, approach
- Services hub + 5 detail pages
- Contact page with form
- Legal pages (privacy, terms)

### Phase 3: Dynamic Content

- Case studies (MDX-based, filterable listing)
- Blog/Insights (MDX-based, category taxonomy)
- Industries hub (if time permits)

### Phase 4: Features & Integrations

- Contact form → Formspree/Resend
- Newsletter signup → ConvertKit/Mailchimp
- Form validation and error states
- Success/confirmation pages

### Phase 5: Polish & Performance

- Animation refinement
- Image optimization
- SEO meta tags, OpenGraph, sitemap
- Accessibility audit (WCAG 2.2 AA)
- Lighthouse optimization (>90 scores)
- Cross-browser testing

### Phase 6: Content Population & Deploy

- Populate all copy from brief
- Add placeholder case studies & insights
- Final QA pass
- Deploy to Vercel production
- DNS configuration

## Performance Targets

- **LCP**: < 2.0s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Lighthouse**: 90+ across all metrics
- **Accessibility**: WCAG 2.2 AA compliant

## Production Readiness (Launch-Critical)

### Security & Privacy

- **Security headers**: Strict CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Secrets management**: Environment variables, no hardcoded keys, secure API routes
- **GDPR/CCPA compliance**: Cookie consent (category-based with opt-in/out), Do-Not-Sell page, data request workflow
- **Privacy-safe analytics**: Plausible (cookie-less) or GA4 with consent mode
- **Form protection**: Cloudflare Turnstile or hCaptcha + rate limiting (Vercel Edge Config or Upstash Redis)
- **HTTPS everywhere**: Force HTTPS, secure cookies, SameSite policies

### Reliability & Monitoring

- **Error tracking**: Sentry integration with source maps, environment tagging, user context
- **Uptime monitoring**: Vercel analytics + optional UptimeRobot/Better Uptime
- **Custom error pages**: Branded 404, 500, 503 with helpful navigation
- **Graceful degradation**: Loading states, retry logic, offline indicators
- **Logging**: Structured logs for API routes, form submissions, critical user paths

### SEO & Content Hygiene

- **Canonical tags**: Prevent duplicate content, self-referencing canonicals
- **Robots.txt**: Environment-aware (allow prod, disallow staging/dev)
- **Staging protection**: noindex meta tag + password protection or Vercel auth
- **301 redirects**: Redirect map for legacy URLs (if migrating), trailing-slash policy
- **Structured data (JSON-LD)**: Organization, WebSite, Article, Breadcrumb, FAQ schemas
- **Dynamic OG images**: @vercel/og for auto-generated social cards per post/case study
- **XML sitemap**: Auto-generated with priority/changefreq, submitted to Search Console
- **Internal linking**: Strategic cross-links, breadcrumbs, related content

### Performance Architecture

- **Rendering strategy by route**:
  - Homepage, About, Services: SSG (Static Site Generation)
  - Case Studies, Blog: ISR (Incremental Static Regeneration, revalidate: 3600)
  - Contact form: Client-side with API route
- **Image optimization**: next/image with AVIF/WebP, responsive srcsets, art-direction breakpoints, lazy loading
- **Font strategy**: next/font with preload, font-display: swap, subset to used glyphs
- **Edge caching**: CDN headers (Cache-Control, s-maxage, stale-while-revalidate)
- **Performance budgets by page type**:
  - Homepage: 150KB JS, 800KB total
  - Content pages: 100KB JS, 500KB total
  - Blog posts: 80KB JS, 400KB total

### Accessibility Specifics

- **Keyboard navigation**: Focus management for mega-menu, modal traps, skip links
- **Focus indicators**: High-contrast outlines (3px solid), visible on all interactive elements
- **ARIA patterns**: Proper roles, labels, live regions for dynamic content
- **Color contrast**: Minimum 4.5:1 for body text, 3:1 for large text/UI
- **Reduced motion**: prefers-reduced-motion variants for all animations
- **Screen reader**: Semantic HTML, alt text for images, captions for video
- **Form accessibility**: Labels, error messages, success confirmations, required indicators

### Testing & QA

- **Unit/Integration**: Jest + React Testing Library for components and utilities
- **End-to-End**: Playwright tests for critical user flows (contact form, navigation, case study browsing)
- **Accessibility**: axe-core in CI, manual keyboard/screen reader testing
- **Visual regression**: Playwright snapshots for component library (optional: Chromatic)
- **Link checker**: Automated dead-link detection in CI
- **Performance**: Lighthouse CI with budgets, fail PR if scores drop

### Environments & CI/CD

- **Environments**: Development (local), Preview (PR deployments), Production
- **Branch protection**: Require PR reviews, passing CI checks, up-to-date branches
- **Preview deployments**: Vercel automatic PR previews with unique URLs
- **Automated checks**: ESLint, Prettier, TypeScript, tests, Lighthouse
- **Dependencies**: Dependabot for security updates, automated PR creation
- **Commit standards**: Conventional commits (feat:, fix:, docs:), commitlint hook

## Strongly Recommended Additions

### Search & Discovery

- **Site search**: Algolia DocSearch or Typesense for insights/case studies/services
- **Filters**: Category, industry, service type for case studies and insights
- **Tags**: Taxonomy for blog posts and case studies

### Authoring Experience

- **Content system**: MDX with clear frontmatter schema (title, slug, summary, coverImage, category, tags, author, date, ogImage)
- **Preview mode**: Draft posts visible in dev/preview, hidden in production
- **Content guidelines**: Editorial checklist, voice/tone examples, formatting standards
- **Validation**: Frontmatter schema validation, required field checks

### Analytics & Events

- **Event tracking plan**: Document all tracked interactions
- **Custom events**:
  - CTA clicks (hero, inline, footer)
  - Form starts/completions/errors
  - Scroll depth (25%, 50%, 75%, 100%)
  - Service card interactions
  - Case study views
  - Newsletter signups
  - Download triggers (if applicable)
- **UTM tracking**: Capture source/medium/campaign on forms, pass to CRM

### Marketing Operations

- **CRM integration**: HubSpot/Salesforce/Zapier webhook on form submission
- **Newsletter**: Double opt-in flow, confirmation email, unsubscribe link
- **Lead routing**: Email notifications to sales team, auto-responder to user
- **Conversion tracking**: GA4 goals, Vercel Analytics conversion events

### Brand Polish

- **Favicon set**: Multiple sizes (16x16, 32x32, 180x180), apple-touch-icon, SVG favicon
- **Web app manifest**: Brand colors, icons, display mode, theme-color
- **Theme color**: Meta tag for mobile browser chrome
- **Print styles**: Optimized layouts for case studies and blog posts
- **Social preview**: Proper OG tags with dynamic images

### Content Governance

- **Alt text policy**: Descriptive, context-aware, no "image of"
- **Image rights**: Track licenses and attribution for stock photos
- **Editorial workflow**: Draft → Review → Approve → Publish
- **Changelog**: Track site updates and feature releases

## Nice-to-Have (If Time Allows)

- **PWA**: Service worker for offline reading of insights
- **RSS feed**: Auto-generated for blog/insights
- **Breadcrumbs**: Structured navigation trail on all pages
- **Table of contents**: Auto-generated for long blog posts
- **Dark mode**: Full token strategy with system preference detection
- **Internationalization**: next-intl setup for future multi-language
- **Related content**: "You might also like" sections
- **Reading time**: Estimate for blog posts
- **Copy-to-clipboard**: Code blocks with syntax highlighting

## Dependencies to Unblock Early

### Design Assets

- [ ] Logo files (SVG + PNG, multiple sizes)
- [ ] Brand colors finalized (if different from plan)
- [ ] Brand fonts licensed (Source Serif Pro, Inter, JetBrains Mono)
- [ ] Client logos (6-8, with permission/anonymization)
- [ ] Leadership headshots (high-res, consistent style)
- [ ] Any hero/feature images

### Content

- [ ] Approved copy for all core pages (or sign-off on placeholders)
- [ ] 3 detailed case studies with real metrics (or placeholder approval)
- [ ] 3-5 blog post topics and outlines
- [ ] Leadership bios (150 words each)
- [ ] Legal pages: Privacy Policy, Terms of Service, Cookie Policy

### Integrations & Accounts

- [ ] Form endpoint decision: Formspree, Resend, or custom API
- [ ] Newsletter provider: ConvertKit, Mailchimp, or other
- [ ] CRM webhook URL (HubSpot/Salesforce/Zapier)
- [ ] Analytics: Google Analytics 4 or Plausible account
- [ ] Error tracking: Sentry project and DSN
- [ ] Uptime monitor: Better Uptime or UptimeRobot

### Domain & Deployment

- [ ] Domain name registered (ieglobal.com or similar)
- [ ] DNS access for configuration
- [ ] Vercel team/account setup
- [ ] SSL certificate (Vercel auto-provisions)
- [ ] Redirect map from legacy site (if applicable)

### Security & Compliance

- [ ] Cookie consent provider: Cookiebot, OneTrust, or custom
- [ ] Spam protection: Cloudflare Turnstile or hCaptcha account
- [ ] GDPR data request workflow owner
- [ ] Security policy review (CSP, headers)

## Deliverables

1. Fully functional Next.js website
2. Design system documentation (comments in code)
3. Editable blog/case study system (MDX)
4. Contact + newsletter forms (integrated)
5. SEO-optimized pages with meta tags
6. Vercel deployment with CI/CD
7. README with content editing guide
8. Brand kit reference (colors, typography, spacing)

## Content Strategy

- Use provided IE Global copy throughout
- Bain-style voice: confident, outcome-driven, evidence-based
- Placeholder metrics where real numbers pending
- 3 initial case studies with detailed outcomes
- 3-5 starter blog posts on AI, CX, pricing topics
- Leadership bios (placeholder if needed)

## Timeline (10 Business Days)

- **Days 1-2**: Setup, design system, core components
- **Days 3-5**: Homepage, About, Services pages
- **Days 6-7**: Case studies, Blog, dynamic content
- **Days 8-9**: Forms, integrations, polish, animations
- **Day 10**: Final QA, performance optimization, deploy

---

**Ready to build a website that rivals Bain's sophistication with IE Global's engineering edge.**

### To-dos

- [ ] Initialize Next.js 14 project with TypeScript, Tailwind CSS, ESLint, and folder structure
- [ ] Build design system: Tailwind config with IE Global colors, typography, spacing tokens, and base components
- [ ] Create layout with animated navigation (mega-menu for services) and organized footer
- [ ] Build reusable components: Hero, ServiceCard, CaseStudyCard, MetricCounter, Newsletter, ContactForm, Button, etc.
- [ ] Build homepage with hero, value pillars, services preview, proof section, featured case study, newsletter CTA
- [ ] Create About page with leadership bios, values, approach, and company positioning
- [ ] Build Services hub + 5 detail pages (AI/Data, CX, GTM/Pricing, Operating Model, Digital Product)
- [ ] Set up MDX + Contentlayer for case studies, create listing page and detail template with filterable outcomes
- [ ] Set up blog/insights with MDX, category taxonomy, listing page, and post template
- [ ] Build Contact page with form integration (Formspree/Resend) and Careers page
- [ ] Implement Framer Motion animations: scroll reveals, hover states, counters, parallax, micro-interactions
- [ ] Populate all pages with IE Global copy from brief, add 3 case studies and 3-5 blog posts
- [ ] Add SEO meta tags, OpenGraph, sitemap, optimize images, improve Lighthouse scores to 90+
- [ ] Final QA (accessibility, cross-browser, mobile), deploy to Vercel, configure custom domain