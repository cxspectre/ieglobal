import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdmZip from 'adm-zip';
import type { Database } from '@/lib/supabase/client';

const TEMPLATE_BASE_DOMAIN = process.env.NEXT_PUBLIC_TEMPLATE_BASE_DOMAIN || 'templates.ie-global.net';

const ALLOWED_EXTENSIONS = new Set([
  'html', 'htm', 'css', 'js', 'mjs', 'json', 'png', 'jpg', 'jpeg', 'gif', 'webp',
  'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'xml', 'map',
]);

const SKIP_PATH_PATTERNS = ['/node_modules/', '/__MACOSX/', '/.git/', '/.DS_Store'];

function shouldSkipPath(path: string): boolean {
  const p = path.replace(/\\/g, '/');
  return SKIP_PATH_PATTERNS.some((pat) => p.includes(pat)) || p.includes('/._');
}

function getExt(path: string): string {
  const i = path.lastIndexOf('.');
  return i >= 0 ? path.slice(i + 1).toLowerCase() : '';
}

const MIME_TYPES: Record<string, string> = {
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  mjs: 'application/javascript',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  eot: 'application/vnd.ms-fontobject',
  xml: 'application/xml',
  map: 'application/json',
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    let supabase;
    let user: { id: string } | null = null;

    if (bearerToken) {
      supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
      );
      const { data: { user: u } } = await supabase.auth.getUser();
      user = u;
    }

    if (!user) {
      const serverClient = await createServerSupabaseClient();
      const { data: { user: u } } = await serverClient.auth.getUser();
      user = u;
      supabase = serverClient;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'employee'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const slug = formData.get('slug') as string;
    const zipFile = formData.get('file') as File | null;
    const folderFiles = formData.getAll('files') as File[];

    if (!slug?.trim()) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }
    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (safeSlug.length < 2) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    let normalizedEntries: { path: string; content: Buffer }[] = [];
    let stripPrefix = '';

    if (zipFile && zipFile instanceof File && zipFile.name.toLowerCase().endsWith('.zip')) {
      // Zip upload
      const arrayBuffer = await zipFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();

      for (const entry of entries) {
        if (entry.isDirectory) continue;
        const rawPath = entry.entryName.replace(/\\/g, '/').replace(/\/+/g, '/');
        if (shouldSkipPath(rawPath)) continue;
        const ext = getExt(rawPath);
        if (!ALLOWED_EXTENSIONS.has(ext)) continue;

        normalizedEntries.push({ path: rawPath, content: Buffer.from(entry.getData()) });
      }
    } else if (folderFiles && folderFiles.length > 0 && folderFiles.every((f) => f instanceof File)) {
      // Folder upload (multiple files)
      const rawEntries: { path: string; content: Buffer }[] = [];
      for (const file of folderFiles) {
        const f = file as File;
        const rawPath = (f.webkitRelativePath || f.name || '').replace(/\\/g, '/').replace(/\/+/g, '/');
        if (!rawPath || shouldSkipPath(rawPath)) continue;
        const ext = getExt(rawPath);
        if (!ALLOWED_EXTENSIONS.has(ext)) continue;

        const arrayBuffer = await f.arrayBuffer();
        rawEntries.push({ path: rawPath, content: Buffer.from(arrayBuffer) });
      }
      normalizedEntries = rawEntries;
    } else {
      return NextResponse.json(
        { error: 'Upload a .zip file or select a folder with your built site (index.html, CSS, JS, images).' },
        { status: 400 }
      );
    }

    // Find index.html or index.htm to determine the root folder to strip
    const indexEntry = normalizedEntries.find(
      (e) => e.path.endsWith('/index.html') || e.path.endsWith('/index.htm') || e.path === 'index.html' || e.path === 'index.htm'
    );
    if (indexEntry) {
      const idx = indexEntry.path.lastIndexOf('/');
      stripPrefix = idx >= 0 ? indexEntry.path.slice(0, idx + 1) : '';
    } else {
      const first = normalizedEntries[0];
      if (first) {
        const idx = first.path.indexOf('/');
        stripPrefix = idx >= 0 ? first.path.slice(0, idx + 1) : '';
      }
    }

    if (normalizedEntries.length === 0) {
      return NextResponse.json(
        { error: 'No valid files. Include index.html and assets (html, css, js, png, etc.).' },
        { status: 400 }
      );
    }

    // Use service role for storage upload (we've verified user is admin/employee)
    const storageClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const uploaded: string[] = [];
    let lastError: { message: string } | null = null;
    for (const { path: rawPath, content } of normalizedEntries) {
      const entryPath = stripPrefix ? rawPath.replace(stripPrefix, '') : rawPath;
      if (!entryPath || entryPath.startsWith('/')) continue;

      const storagePath = `${safeSlug}/${entryPath}`;
      const contentType = MIME_TYPES[getExt(entryPath)] || 'application/octet-stream';
      const { error } = await storageClient.storage
        .from('website-templates')
        .upload(storagePath, content, { upsert: true, contentType });

      if (error) {
        console.error('Upload error:', storagePath, error);
        lastError = error;
        continue;
      }
      uploaded.push(entryPath);
    }

    if (uploaded.length === 0 && lastError) {
      return NextResponse.json(
        { error: `Upload failed: ${lastError.message}` },
        { status: 500 }
      );
    }

    // Ensure a website_templates row exists so the preview route can serve the template
    const templateUrl = `https://${safeSlug}.${TEMPLATE_BASE_DOMAIN}`;
    const { data: existingRow } = await (storageClient as any)
      .from('website_templates')
      .select('id')
      .eq('slug', safeSlug)
      .maybeSingle();
    if (!existingRow) {
      const nameFromSlug = safeSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      await (storageClient as any)
        .from('website_templates')
        .insert({
          name: nameFromSlug,
          slug: safeSlug,
          category: 'Other',
          template_url: templateUrl,
          published: true,
          created_by: user?.id ?? null,
        });
    }

    return NextResponse.json({
      slug: safeSlug,
      uploaded: uploaded.length,
      files: uploaded,
      templateUrl,
    });
  } catch (err) {
    console.error('Template upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
