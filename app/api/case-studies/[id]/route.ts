import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      slug,
      title,
      summary,
      client,
      industry,
      services,
      challenge,
      outcome,
      metrics,
      cover_image_url,
      content,
      date,
      featured,
    } = body;

    const updates: Record<string, unknown> = {};
    if (slug != null) updates.slug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (title != null) updates.title = title;
    if (summary != null) updates.summary = summary;
    if (client != null) updates.client = client;
    if (industry != null) updates.industry = industry;
    if (services != null) updates.services = Array.isArray(services) ? services : [];
    if (challenge != null) updates.challenge = challenge;
    if (outcome != null) updates.outcome = outcome;
    if (metrics != null) updates.metrics = Array.isArray(metrics) ? metrics : [];
    if (cover_image_url != null) updates.cover_image_url = cover_image_url;
    if (content != null) updates.case_content = content;
    if (date != null) updates.case_date = date;
    if (featured != null) updates.featured = !!featured;

    const { data, error } = await supabaseAdmin
      .from('milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Case study update error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('milestones')
      .delete()
      .eq('id', id)
      .is('project_id', null);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Case study delete error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
