import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/client';

export const runtime = 'nodejs';

const TEMPLATE_BASE_DOMAIN = process.env.NEXT_PUBLIC_TEMPLATE_BASE_DOMAIN || 'templates.ie-global.net';

function getSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

function getContentType(filePath: string): string {
  const ext = filePath.includes('.') ? filePath.slice(filePath.lastIndexOf('.')) : '';
  return MIME_TYPES[ext] || 'application/octet-stream';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path?: string[] }> }
) {
  try {
    const { slug, path: pathSegments } = await params;
    const filePath = pathSegments && pathSegments.length > 0
      ? pathSegments.join('/')
      : 'index.html';
    const storagePath = `${slug}/${filePath}`;

    const supabase = getSupabase();

    const { data: template } = await supabase
      .from('website_templates')
      .select('id')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (!template) {
      return new NextResponse(
        'Template not found. Add this template in the dashboard first (Dashboard → Templates → Add template) with the same slug as in the URL, then upload your .zip or dist folder.',
        { status: 404, headers: { 'Content-Type': 'text/plain' } }
      );
    }

    let fileData: Blob | null = null;
    let downloadError: { message: string } | null = null;
    ({ data: fileData, error: downloadError } = await supabase.storage
      .from('website-templates')
      .download(storagePath));

    // Fallback to index.htm if index.html not found
    if ((downloadError || !fileData) && filePath === 'index.html') {
      const { data: altData, error: altError } = await supabase.storage
        .from('website-templates')
        .download(`${slug}/index.htm`);
      if (!altError && altData) {
        fileData = altData;
        downloadError = null;
      }
    }

    if (downloadError || !fileData) {
      if (filePath === 'index.html') {
        return new NextResponse('Template has no index.html. Upload a zip with your built site (index.html at root or in dist/build).', { status: 404 });
      }
      return new NextResponse('Not found', { status: 404 });
    }

    const contentType = getContentType(filePath);
    const buffer = Buffer.from(await fileData.arrayBuffer());

    if (filePath.endsWith('.html') || filePath === 'index.html') {
      const html = buffer.toString('utf-8');
      const baseTag = `<base href="https://${slug}.${TEMPLATE_BASE_DOMAIN}/">`;
      const injected = html.includes('<head>')
        ? html.replace('<head>', `<head>${baseTag}`)
        : html.includes('<html>')
          ? html.replace('<html>', `<html><head>${baseTag}</head>`)
          : baseTag + html;

      return new NextResponse(injected, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Template preview error:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
