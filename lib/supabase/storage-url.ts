/**
 * Storage URL normalisation.
 *
 * Rows written while Supabase was served from a custom domain still carry
 * that host in their image URLs. When the custom domain is retired those
 * links break even though the objects still exist. This rewrites any URL
 * on a retired host to the currently configured Supabase origin.
 */

const DEFAULT_LEGACY_HOSTS = 'cdn.ie-global.net';

function legacyStorageHosts(): readonly string[] {
  return (process.env.NEXT_PUBLIC_LEGACY_STORAGE_HOSTS ?? DEFAULT_LEGACY_HOSTS)
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

/** Returns the URL unchanged unless its host is a retired storage domain, in which case the current Supabase origin is used. */
export function normalizeStorageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const currentOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!currentOrigin) return url;

  try {
    const parsed = new URL(url);
    if (!legacyStorageHosts().includes(parsed.hostname.toLowerCase())) return url;
    return `${new URL(currentOrigin).origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

/** Array form of normalizeStorageUrl; drops empty entries and keeps null when the input is null. */
export function normalizeStorageUrls(urls: string[] | null | undefined): string[] | null {
  if (!urls) return null;
  return urls
    .map((url) => normalizeStorageUrl(url))
    .filter((url): url is string => Boolean(url));
}
