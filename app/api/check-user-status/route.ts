import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user from auth.users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) throw error;

    const user = users?.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ 
        exists: false,
        active: false,
      });
    }

    // Check if user has logged in (last_sign_in_at exists) or email is confirmed
    const isActive = !!(user.last_sign_in_at || user.email_confirmed_at);

    return NextResponse.json({
      exists: true,
      active: isActive,
      lastSignIn: user.last_sign_in_at,
      emailConfirmed: user.email_confirmed_at,
    });
  } catch (error: any) {
    console.error('Check user status error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

