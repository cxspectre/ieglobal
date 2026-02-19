import { NextResponse } from 'next/server';
import { getExpectedToken, hashPassword, COOKIE_NAME } from '@/lib/showcase-auth';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: Request) {
  const password = process.env.SHOWCASE_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: 'Showcase is not configured.' }, { status: 503 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  const submitted = typeof body.password === 'string' ? body.password.trim() : '';
  if (!submitted) {
    return NextResponse.json({ error: 'Password required.' }, { status: 400 });
  }

  const expected = getExpectedToken();
  if (!expected) {
    return NextResponse.json({ error: 'Not configured.' }, { status: 503 });
  }

  const token = hashPassword(submitted);
  if (token !== expected) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return res;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('logout') !== '1') {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return res;
}
