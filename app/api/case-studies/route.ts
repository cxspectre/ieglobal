import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('milestones')
      .select('*')
      .is('project_id', null)
      .order('case_date', { ascending: false });

    if (error) throw error;
    const mapped = (data || []).map((row: Record<string, unknown>) => ({
      ...row,
      content: row.case_content ?? row.content ?? '',
      date: row.case_date ?? row.date ?? row.created_at,
    }));
    return NextResponse.json(mapped);
  } catch (err) {
    console.error('Case studies list error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      slug,
      title,
      summary,
      client,
      industry,
      services = [],
      challenge,
      outcome,
      metrics = [],
      cover_image_url,
      content,
      date,
      featured = false,
    } = body;

    if (!title || !summary || !client || !industry || !challenge) {
      return NextResponse.json(
        { error: 'Missing required fields: title, summary, client, industry, challenge' },
        { status: 400 }
      );
    }

    const slugValue = (slug || title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data, error } = await supabaseAdmin
      .from('milestones')
      .insert({
        project_id: null,
        slug: slugValue,
        title,
        summary,
        client,
        industry,
        services: Array.isArray(services) ? services : [],
        challenge,
        outcome: outcome || null,
        metrics: Array.isArray(metrics) ? metrics : [],
        cover_image_url: cover_image_url || null,
        case_content: content || '',
        case_date: date || new Date().toISOString().slice(0, 10),
        featured: !!featured,
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Case study create error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
