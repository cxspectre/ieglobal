import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { emailTemplate } from '@/lib/email-template';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, businessName, email } = body;

    if (!name || !businessName || !email) {
      return NextResponse.json(
        { error: 'Name, business name, and email are required' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY || !resend) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json(
        { message: 'Form submitted successfully (email service not configured)' },
        { status: 200 }
      );
    }

    const html = emailTemplate(`
      <p><strong>Template Request</strong></p>
      <p style="margin:16px 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Name</p>
      <p style="margin:0 0 16px 0;">${name}</p>
      <p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Business name</p>
      <p style="margin:0 0 16px 0;">${businessName}</p>
      <p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Email</p>
      <p style="margin:0 0 16px 0;"><a href="mailto:${email}" style="color:#E63946;">${email}</a></p>
      <p style="margin-top:24px;font-size:13px;color:#64748b;">Submitted: ${new Date().toLocaleString()}</p>
    `);

    await resend.emails.send({
      from: 'IE Global <contact@ie-global.net>',
      to: 'hello@ie-global.net',
      replyTo: email,
      subject: `Template request: ${businessName} (${name})`,
      html,
    });

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('Template request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit. Please try again or email hello@ie-global.net.' },
      { status: 500 }
    );
  }
}
