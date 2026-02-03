import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { emailTemplate } from '@/lib/email-template';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, message, timeline, ongoingSupport } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log to console for debugging
    console.log('Contact form submission:', {
      name,
      email,
      company,
      message,
      timeline,
      ongoingSupport,
      timestamp: new Date().toISOString(),
    });

    // Send email using Resend
    if (!process.env.RESEND_API_KEY || !resend) {
      console.error('RESEND_API_KEY is not set!');
      return NextResponse.json(
        { message: 'Form submitted successfully (email service not configured)' },
        { status: 200 }
      );
    }

    try {
      const html = emailTemplate(`
        <p><strong>New Contact Form Submission</strong></p>
        <p style="margin:16px 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Name</p>
        <p style="margin:0 0 16px 0;">${name}</p>
        <p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Email</p>
        <p style="margin:0 0 16px 0;"><a href="mailto:${email}" style="color:#E63946;">${email}</a></p>
        ${company ? `<p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Company</p><p style="margin:0 0 16px 0;">${company}</p>` : ''}
        ${timeline ? `<p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Timeline</p><p style="margin:0 0 16px 0;">${timeline}</p>` : ''}
        <p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Ongoing Support Requested</p>
        <p style="margin:0 0 16px 0;">${ongoingSupport ? 'Yes' : 'No'}</p>
        <p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Message</p>
        <p style="margin:0;white-space:pre-wrap;">${message}</p>
        <p style="margin-top:24px;font-size:13px;color:#64748b;">Submitted: ${new Date().toLocaleString()}</p>
      `);
      const emailResult = await resend.emails.send({
        from: 'IE Global <contact@ie-global.net>',
        to: 'hello@ie-global.net',
        replyTo: email,
        subject: `New Contact: ${name}${company ? ` from ${company}` : ''}`,
        html,
      });

      console.log('Email sent successfully via Resend:', emailResult);
    } catch (emailError) {
      console.error('Resend email error:', emailError);
      // Still return success to user, but log the email error
      return NextResponse.json(
        { message: 'Form submitted successfully (email delivery pending)' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

