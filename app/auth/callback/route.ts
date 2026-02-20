import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

function createSupabaseServerClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // OAuth callback (e.g. Sign in with Microsoft, or link identity from profile)
  if (code) {
    const nextPath = requestUrl.searchParams.get('next');
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('OAuth code exchange error:', error);
      const dest = nextPath ? `/login?error=oauth_failed&next=${encodeURIComponent(nextPath)}` : '/login?error=oauth_failed';
      return NextResponse.redirect(new URL(dest, request.url));
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL('/login?error=session', request.url));
    }
    // If redirecting back from "link account" flow, send user to the page they came from
    if (nextPath && nextPath.startsWith('/')) {
      return NextResponse.redirect(new URL(nextPath, request.url));
    }
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile) {
      return NextResponse.redirect(new URL('/login?error=no_profile', request.url));
    }
    const redirectPath = profile.role === 'client' ? '/en/portal' : '/en/dashboard';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // OTP callback (e.g. password reset email link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(new URL('/reset-password', request.url));
    }
    console.error('OTP verification error:', error);
  }

  return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
}
