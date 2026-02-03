import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { emailTemplate } from '@/lib/email-template';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      clientName, 
      contactPerson, 
      contactEmail,
      clientId,
      serviceCategories,
      projectLead,
      sendWelcomeEmail,
      sendUploadLink,
      requiredDocuments
    } = body;

    // Validate required fields
    if (!clientName || !contactEmail || !contactPerson) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log to console for debugging
    console.log('Client onboarding notification:', {
      clientName,
      contactPerson,
      contactEmail,
      serviceCategories,
      timestamp: new Date().toISOString(),
    });

    // Send email using Resend
    if (!process.env.RESEND_API_KEY || !resend) {
      console.warn('RESEND_API_KEY is not set - skipping email');
      return NextResponse.json(
        { 
          success: true, 
          message: 'Onboarding processed (email service not configured)',
          emailSent: false 
        },
        { status: 200 }
      );
    }

    try {
      // Send document upload request email if requested
      if (sendUploadLink && requiredDocuments && requiredDocuments.length > 0) {
        const docLabels: Record<string, { label: string; required: boolean }> = {
          discovery: { label: 'Discovery Questionnaire', required: true },
          access: { label: 'Access Credentials (domain, hosting, current platform)', required: true },
          brand: { label: 'Brand Files (logos, style guide, fonts, colors)', required: false },
          technical: { label: 'Technical Documentation (if applicable)', required: false },
          nda: { label: 'Signed Non-Disclosure Agreement', required: false },
          other: { label: 'Other Supporting Documents', required: false },
        };
        const uploadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ie-global.net'}/upload/${body.clientId}`;
        const docList = requiredDocuments
          .map((docId: string) => {
            const doc = docLabels[docId] || { label: docId, required: false };
            return `<li>${doc.label}${doc.required ? ' <span style="font-size:11px;background:#DC2626;color:white;padding:2px 8px;border-radius:3px;margin-left:6px;">REQUIRED</span>' : ''}</li>`;
          })
          .join('');
        const html = emailTemplate(`
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${contactPerson},</p>
          <p>To help us prepare for your project and ensure a smooth kickoff, we need a few documents from you.</p>
          <div style="background:#F7F9FC;padding:20px;border-radius:6px;border-left:4px solid #D23B3B;margin:20px 0;">
            <p style="margin:0 0 15px 0;font-weight:600;color:#0B1930;">Required Documents:</p>
            <ul style="margin:0;padding-left:20px;">${docList}</ul>
          </div>
          <p><a href="${uploadUrl}" class="button">Upload Documents Securely</a></p>
          <p style="font-size: 14px; color: #64748b;">Click the button above to access our secure upload portal. You can download templates for required documents and upload everything directly.</p>
          <p><strong>Why we need these:</strong></p>
          <ul style="color:#5F6B7A;padding-left:20px;">
            <li style="margin-bottom:10px;">To understand your current setup and goals</li>
            <li style="margin-bottom:10px;">To prepare a detailed project plan and timeline</li>
            <li style="margin-bottom:10px;">To ensure we have everything ready for kickoff</li>
          </ul>
          <p style="padding:20px;background:#F7F9FC;border-left:4px solid #D23B3B;border-radius:4px;"><strong>Timeline:</strong> Please send these documents within the next 3-5 business days so we can stay on schedule.</p>
          <p>If you have any questions or need help, reply to this email or reach out at hello@ie-global.net</p>
          <p>— The IE Global Team</p>
        `);
        await resend.emails.send({
          from: 'IE Global <contact@ie-global.net>',
          to: contactEmail,
          subject: `Document Upload Request – ${clientName}`,
          html,
        });
      }

      // Send welcome email to client if requested
      if (sendWelcomeEmail) {
        const servicesHtml = serviceCategories && serviceCategories.length > 0
          ? `<div style="margin:24px 0;padding:20px;background:#F7F9FC;border-radius:6px;"><p style="margin:0 0 10px 0;font-weight:600;color:#0B1930;">Services we will be providing:</p><ul style="margin:0;padding-left:20px;">${serviceCategories.map((s: string) => `<li>${s}</li>`).join('')}</ul></div>`
          : '';
        const html = emailTemplate(`
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${contactPerson},</p>
          <p>Thank you for choosing IE Global as your technology partner. We are committed to building intelligent, scalable systems that drive real business value.</p>
          <p><strong>What happens next?</strong></p>
          <ol style="color:#5F6B7A;padding-left:20px;">
            <li style="margin-bottom:12px;">Your dedicated project lead will reach out within 1 business day</li>
            <li style="margin-bottom:12px;">We will schedule a kickoff meeting to align on goals and timeline</li>
            <li style="margin-bottom:12px;">You will receive access to your client portal to track progress</li>
            <li style="margin-bottom:12px;">We will begin the discovery phase to understand your needs</li>
          </ol>
          ${servicesHtml}
          <p style="padding:20px;background:#F7F9FC;border-left:4px solid #D23B3B;border-radius:4px;"><strong>Tip:</strong> Keep all project-related documents organized. We will request some initial materials to help us get started quickly.</p>
          <p>If you have any questions in the meantime, do not hesitate to reach out.</p>
          <p><a href="https://ie-global.net/contact" class="button">Contact Your Team</a></p>
          <p>— The IE Global Team</p>
        `);
        await resend.emails.send({
          from: 'IE Global <contact@ie-global.net>',
          to: contactEmail,
          subject: `Welcome to IE Global – ${clientName}`,
          html,
        });
      }

      // Send internal notification to IE Global team
      const badgesHtml = serviceCategories && serviceCategories.length > 0
        ? serviceCategories.map((s: string) => `<span style="display:inline-block;padding:4px 12px;background:#D23B3B;color:white;border-radius:4px;font-size:12px;font-weight:600;margin-right:6px;margin-bottom:6px;">${s}</span>`).join('')
        : '';
      const internalHtml = emailTemplate(`
        <p><strong>New Client Onboarded</strong></p>
        <p>A new client has completed the onboarding workflow.</p>
        <div style="margin:20px 0;padding:15px;background:#F7F9FC;border-radius:6px;">
          <p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Company Name</p>
          <p style="margin:0;font-size:18px;font-weight:600;color:#0B1930;">${clientName}</p>
        </div>
        <div style="margin:20px 0;padding:15px;background:#F7F9FC;border-radius:6px;">
          <p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Contact Person</p>
          <p style="margin:0;">${contactPerson}</p>
        </div>
        <div style="margin:20px 0;padding:15px;background:#F7F9FC;border-radius:6px;">
          <p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Contact Email</p>
          <p style="margin:0;"><a href="mailto:${contactEmail}" style="color:#E63946;">${contactEmail}</a></p>
        </div>
        ${serviceCategories && serviceCategories.length > 0 ? `<div style="margin:20px 0;padding:15px;background:#F7F9FC;border-radius:6px;"><p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Service Categories</p><p style="margin:0;">${badgesHtml}</p></div>` : ''}
        ${projectLead ? `<div style="margin:20px 0;padding:15px;background:#F7F9FC;border-radius:6px;"><p style="margin:0 0 8px 0;font-weight:600;color:#0B1930;font-size:14px;">Project Lead</p><p style="margin:0;">${projectLead}</p></div>` : ''}
        <p><strong>Welcome Email Sent:</strong> ${sendWelcomeEmail ? 'Yes' : 'No'}</p>
        <p style="padding:20px;background:#E63946;color:white;border-radius:8px;"><strong>Action Required:</strong> Review the onboarding details in the dashboard and reach out to ${contactPerson} within 1 business day.</p>
        <p style="font-size:13px;color:#64748b;">Automated notification – ${new Date().toLocaleString()}</p>
      `);
      await resend.emails.send({
        from: 'IE Global <contact@ie-global.net>',
        to: 'hello@ie-global.net',
        subject: `New Client Onboarded: ${clientName}`,
        html: internalHtml,
      });

      return NextResponse.json(
        { 
          success: true, 
          message: 'Onboarding emails sent successfully',
          emailSent: true
        },
        { status: 200 }
      );
    } catch (emailError: any) {
      console.error('Email send error:', emailError);
      return NextResponse.json(
        { 
          success: true, 
          message: 'Onboarding processed but email failed',
          emailSent: false,
          error: emailError.message 
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Onboarding email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

