import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, role, interests, message, consent } = body;

    // Validate required fields
    if (!name || !email || !company || !interests || !message || !consent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Integrate with your email service or CRM
    // Example integrations:
    // - Resend: https://resend.com
    // - Formspree: https://formspree.io
    // - SendGrid: https://sendgrid.com
    // - HubSpot: https://developers.hubspot.com/docs/api/crm/contacts
    
    // For now, log to console (replace with actual integration)
    console.log('Contact form submission:', {
      name,
      email,
      company,
      role,
      interests,
      message,
      consent,
      timestamp: new Date().toISOString(),
    });

    // Example: Send email using Resend (uncomment when configured)
    /*
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'contact@ieglobal.com',
      to: 'hello@ieglobal.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Role:</strong> ${role || 'Not provided'}</p>
        <p><strong>Interests:</strong> ${interests.join(', ')}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
    */

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

