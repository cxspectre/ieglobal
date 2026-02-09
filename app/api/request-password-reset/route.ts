import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { emailTemplate } from '@/lib/email-template';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, redirectTo } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const trimmedEmail = email.trim();
    const baseUrl = (process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://ie-global.net').replace(/\/$/, '');
    const redirectUrl = (redirectTo && typeof redirectTo === 'string' && redirectTo.startsWith('http')) ? redirectTo : `${baseUrl}/en/reset-password`;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: trimmedEmail,
      options: { redirectTo: redirectUrl },
    });

    if (error || !data?.properties?.action_link) {
      console.error('Password reset generateLink error:', error);
      return NextResponse.json({ message: 'If an account exists for this email, you will receive a reset link.' }, { status: 200 });
    }

    const actionLink = data.properties.action_link;

    if (!resend || !process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json({ message: 'If an account exists for this email, you will receive a reset link.' }, { status: 200 });
    }

    const html = emailTemplate(`
      <p><strong>Reset your password</strong></p>
      <p>You requested a password reset for your IE Global account. Click the button below to choose a new password:</p>
      <p><a href="${actionLink}" class="button">Reset password</a></p>
      <p style="font-size: 13px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
    `);

    await resend.emails.send({
      from: 'IE Global <contact@ie-global.net>',
      to: trimmedEmail,
      subject: 'Reset your IE Global password',
      html,
    });

    return NextResponse.json({ message: 'If an account exists for this email, you will receive a reset link.' }, { status: 200 });
  } catch (err: unknown) {
    console.error('Request password reset error:', err);
    return NextResponse.json({ message: 'If an account exists for this email, you will receive a reset link.' }, { status: 200 });
  }
}
