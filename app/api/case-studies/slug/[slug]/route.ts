import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('milestones')
      .select('*')
      .eq('slug', slug)
      .is('project_id', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(null, { status: 404 });
      }
      throw error;
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('Case study get error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
