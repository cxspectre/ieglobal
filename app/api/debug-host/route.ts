import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host') || '';
  const xRealHost = request.headers.get('x-real-host') || '';
  const url = request.url;

  return NextResponse.json({
    host,
    xForwardedHost,
    xRealHost,
    url,
    recommended: xForwardedHost || host,
    isTemplateSubdomain: (xForwardedHost || host)
      .split(':')[0]
      .endsWith('.templates.ie-global.net'),
  });
}
