# Template subdomains (slug.ie-global.net)

Templates are served at branded subdomains like `consulting.ie-global.net`.

## DNS setup (Cloudflare or any DNS host)

Your domain is managed in **Cloudflare** (or your DNS provider)—add the records there. Vercel only needs the domain added so it accepts the traffic.

### 1. Add domain in Vercel

Project Settings → Domains → Add `*.ie-global.net`. Vercel will show the target to use.

### 2. Add CNAME in Cloudflare

In Cloudflare → DNS → Records:

| Type  | Name | Target                    | Proxy          |
|-------|------|---------------------------|----------------|
| CNAME | `*`  | `cname.vercel-dns.com`    | DNS only (grey)|

Use the exact target Vercel shows for `*.ie-global.net`.

**Proxy:** Turn the cloud off (grey) for this record so Vercel can manage SSL.

**Note:** `www` and `dashboard` may have their own records. The wildcard `*` applies to subdomains not explicitly defined.

## Environment

Optional in `.env.local`:

```
NEXT_PUBLIC_TEMPLATE_BASE_DOMAIN=ie-global.net
```

Defaults to `ie-global.net` if not set.

## Flow

1. **Admin:** Add template with slug (e.g. `consulting`), upload zip of built site
2. **Storage:** Files stored in Supabase `website-templates` bucket at `{slug}/index.html`, `{slug}/style.css`, etc.
3. **Request:** `consulting.ie-global.net/` → middleware rewrites to `/templates/preview/consulting/`
4. **Route:** Fetches from storage, injects `<base href>` for relative paths, serves content

## Local testing

Visit `http://localhost:3000/templates/preview/consulting` (no subdomain needed) to test a template.
