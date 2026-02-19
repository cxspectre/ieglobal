import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/client';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB per image
const MAX_FILES = 10;

function getExt(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : 'jpg';
}

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
    const files = formData.getAll('files') as File[];

    if (!slug?.trim()) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (safeSlug.length < 2) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const validFiles = files.filter((f) => f instanceof File).slice(0, MAX_FILES);
    if (validFiles.length === 0) {
      return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });
    }

    const storageClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const urls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i] as File;
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_SIZE) continue;

      const ext = getExt(file.name) || 'jpg';
      const storagePath = `gallery/${safeSlug}-${i}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { error } = await storageClient.storage
        .from('website-templates')
        .upload(storagePath, buffer, { upsert: true, contentType: file.type });

      if (!error) {
        const { data: { publicUrl } } = storageClient.storage
          .from('website-templates')
          .getPublicUrl(storagePath);
        urls.push(publicUrl);
      }
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('Gallery upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
