# Template subdomains (slug.templates.ie-global.net)

Templates are served at branded subdomains like `aura-ai.templates.ie-global.net`.

## Subdomain delegation (one-time setup)

Vercel **does not support wildcard domains with external DNS**. To get automatic wildcards without manual DNS per template, we delegate only the `templates` subdomain to Vercel via NS records. Cloudflare keeps the main domain; Vercel manages `*.templates.ie-global.net`.

### 1. Add NS records in Cloudflare

Cloudflare → DNS → Records → Add record (add both):

| Type | Name      | Content              | Proxy   |
|------|-----------|----------------------|---------|
| NS   | `templates` | `ns1.vercel-dns.com` | N/A     |
| NS   | `templates` | `ns2.vercel-dns.com` | N/A     |

### 2. Add domains in Vercel

Project Settings → Domains → Add:

1. `templates.ie-global.net`
2. `*.templates.ie-global.net` (wildcard)

Vercel will verify via the NS records. Once configured, all subdomains (e.g. `aura-ai.templates.ie-global.net`) work automatically with no per-template DNS changes.

## Environment

In Vercel (and optionally `.env.local`):

```
NEXT_PUBLIC_TEMPLATE_BASE_DOMAIN=templates.ie-global.net
```

Defaults to `templates.ie-global.net` if not set.

## Flow

1. **Admin:** Add template with slug (e.g. `aura-ai`), upload zip of built site
2. **Storage:** Files stored in Supabase `website-templates` bucket at `{slug}/index.html`, `{slug}/style.css`, etc.
3. **Request:** `aura-ai.templates.ie-global.net/` → middleware rewrites to `/templates/preview/aura-ai/`
4. **Route:** Fetches from storage, injects `<base href>` for relative paths, serves content

## Local testing

Visit `http://localhost:3000/templates/preview/aura-ai` (no subdomain needed) to test a template.
