import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only if API key exists
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
      const emailResult = await resend.emails.send({
        from: 'IE Global <contact@ie-global.net>',
        to: 'hello@ie-global.net',
        replyTo: email, // User's email - so you can hit "Reply"
        subject: `New Contact: ${name}${company ? ` from ${company}` : ''}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0B1930; color: white; padding: 20px; margin-bottom: 30px; }
                .field { margin-bottom: 20px; }
                .label { font-weight: 600; color: #0B1930; margin-bottom: 5px; }
                .value { color: #5F6B7A; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; font-size: 14px; color: #888; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
                </div>
                
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">${name}</div>
                </div>
                
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value"><a href="mailto:${email}">${email}</a></div>
                </div>
                
                ${company ? `
                <div class="field">
                  <div class="label">Company:</div>
                  <div class="value">${company}</div>
                </div>
                ` : ''}
                
                ${timeline ? `
                <div class="field">
                  <div class="label">Timeline:</div>
                  <div class="value">${timeline}</div>
                </div>
                ` : ''}
                
                <div class="field">
                  <div class="label">Ongoing Support Requested:</div>
                  <div class="value">${ongoingSupport ? 'Yes' : 'No'}</div>
                </div>
                
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value" style="white-space: pre-wrap;">${message}</div>
                </div>
                
                <div class="footer">
                  Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
                </div>
              </div>
            </body>
          </html>
        `,
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

