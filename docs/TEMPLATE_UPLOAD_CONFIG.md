# Template upload – what your project needs

To upload a template in **Dashboard → Templates**, the template must be a **static site** (HTML + CSS + JS + images) that we can store and serve at `slug.templates.ie-global.net`.

---

## 1. What the upload expects

- **A .zip file** or **a folder** containing:
  - **`index.html`** (or `index.htm`) – required so we know the site root
  - Static assets: CSS, JS, images, fonts (allowed extensions: html, css, js, json, png, jpg, gif, webp, svg, ico, woff, woff2, ttf, eot, xml, map)
- No `node_modules`, `.git`, or similar – only the **built output**.

---

## 2. If the template is built with **Next.js**

Use **static export** so Next.js produces a plain folder with `index.html` and assets (no Node server).

1. **In the template repo**, set in `next.config.js` (or `next.config.mjs`):

   ```js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     // optional: basePath if the template will be served from a subpath
   };
   module.exports = nextConfig;
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Output:** Next.js writes the static site into the **`out`** folder (e.g. `out/index.html`, `out/_next/...`, etc.).

4. **Zip the contents of `out`** (so that the zip has `index.html` at the top level, or in a single subfolder).  
   - Either zip the **contents** of `out` (so the zip root is `index.html`),  
   - Or zip the **`out`** folder (we detect `index.html` and strip the root folder).

5. **Upload** in Dashboard → Templates: choose that zip (or the folder), set the slug, and upload.

---

## 3. **Vercel** (what you might have meant by “vido”)

- **Vercel** is used to host the **main IE Global site** (and the template **preview** routes). You don’t need a separate Vercel project for each template.
- **Templates** are not deployed to Vercel individually. You build the template (e.g. Next.js static export), zip the build output, and upload it in the dashboard. We store the files in Supabase and serve them at `slug.templates.ie-global.net`.
- So: **Next.js** (with `output: 'export'`) gives you the static files; **Vercel** is only for the main app that serves those templates.

---

## 4. Checklist for a template to be uploadable

| Requirement | Details |
|------------|--------|
| **Static output** | Built site with `index.html` + assets (no server-side rendering at runtime). |
| **Next.js** | Use `output: 'export'` in `next.config.js`, then zip the `out` folder (or its contents). |
| **Zip or folder** | Upload a .zip or select a folder; must contain `index.html` and only allowed file types. |
| **Slug** | Pick a URL slug (e.g. `my-template`) → live at `my-template.templates.ie-global.net`. |

No extra “template config” is required in the template repo beyond building a static export and zipping it.
