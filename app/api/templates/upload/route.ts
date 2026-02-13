import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdmZip from 'adm-zip';

const TEMPLATE_BASE_DOMAIN = process.env.NEXT_PUBLIC_TEMPLATE_BASE_DOMAIN || 'ie-global.net';

const ALLOWED_EXTENSIONS = new Set([
  'html', 'htm', 'css', 'js', 'mjs', 'json', 'png', 'jpg', 'jpeg', 'gif', 'webp',
  'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'xml', 'txt', 'map',
]);

function getExt(path: string): string {
  const i = path.lastIndexOf('.');
  return i >= 0 ? path.slice(i + 1).toLowerCase() : '';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
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
    const file = formData.get('file') as File;

    if (!slug?.trim()) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }
    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (safeSlug.length < 2) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'file (zip) is required' }, { status: 400 });
    }
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({ error: 'File must be a .zip' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const uploaded: string[] = [];
    for (const entry of entries) {
      if (entry.isDirectory) continue;
      let entryPath = entry.entryName.replace(/\\/g, '/').replace(/^[^/]+\//, '').replace(/\/+/g, '/');
      if (!entryPath) continue;
      const ext = getExt(entryPath);
      if (!ALLOWED_EXTENSIONS.has(ext)) continue;

      const storagePath = `${safeSlug}/${entryPath}`;
      const content = entry.getData();
      const { error } = await supabase.storage
        .from('website-templates')
        .upload(storagePath, content, { upsert: true });

      if (error) {
        console.error('Upload error:', storagePath, error);
        continue;
      }
      uploaded.push(entryPath);
    }

    return NextResponse.json({
      slug: safeSlug,
      uploaded: uploaded.length,
      files: uploaded,
      templateUrl: `https://${safeSlug}.${TEMPLATE_BASE_DOMAIN}`,
    });
  } catch (err) {
    console.error('Template upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
