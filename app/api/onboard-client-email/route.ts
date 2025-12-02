import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only if API key exists
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
        await resend.emails.send({
          from: 'IE Global <no-reply@ie-global.net>',
          to: contactEmail,
          subject: `Document Upload Request - ${clientName}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                    line-height: 1.6; 
                    color: #0B1930; 
                    margin: 0;
                    padding: 0;
                  }
                  .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 40px 20px; 
                  }
                  .header { 
                    background: linear-gradient(135deg, #0B1930 0%, #1a2942 100%); 
                    color: white; 
                    padding: 40px 30px; 
                    border-radius: 8px;
                    margin-bottom: 30px; 
                  }
                  .header h1 { 
                    margin: 0 0 10px 0; 
                    font-size: 28px; 
                  }
                  .header p { 
                    margin: 0; 
                    opacity: 0.9; 
                    font-size: 16px; 
                  }
                  .content { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                  }
                  .document-list {
                    background: #F7F9FC;
                    padding: 20px;
                    border-radius: 6px;
                    border-left: 4px solid #D23B3B;
                    margin: 20px 0;
                  }
                  .document-list h3 {
                    margin: 0 0 15px 0;
                    color: #0B1930;
                    font-size: 18px;
                  }
                  .document-list ul {
                    margin: 0;
                    padding-left: 20px;
                  }
                  .document-list li {
                    color: #0B1930;
                    margin: 10px 0;
                    font-weight: 500;
                  }
                  .required-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    background: #DC2626;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    border-radius: 3px;
                    margin-left: 8px;
                  }
                  .button { 
                    display: inline-block; 
                    padding: 14px 28px; 
                    background: #D23B3B; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: 600; 
                    margin: 20px 0;
                  }
                  .footer { 
                    margin-top: 30px; 
                    padding-top: 20px; 
                    border-top: 2px solid #f0f0f0; 
                    font-size: 14px; 
                    color: #5F6B7A; 
                    text-align: center;
                  }
                  .info-box {
                    background: #FEF3C7;
                    padding: 15px 20px;
                    border-radius: 6px;
                    border-left: 4px solid #F59E0B;
                    margin: 20px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>📄 Document Upload Request</h1>
                    <p>Help us get started with ${clientName}</p>
                  </div>
                  
                  <div class="content">
                    <p style="font-size: 18px; margin-bottom: 20px;">Hi ${contactPerson},</p>
                    
                    <p>To help us prepare for your project and ensure a smooth kickoff, we need a few documents from you.</p>
                    
                    <div class="document-list">
                      <h3>📋 Required Documents:</h3>
                      <ul>
                        ${requiredDocuments.map((docId: string) => {
                          const docLabels: Record<string, {label: string, required: boolean}> = {
                            'discovery': { label: 'Discovery Questionnaire', required: true },
                            'access': { label: 'Access Credentials (domain, hosting, current platform)', required: true },
                            'brand': { label: 'Brand Files (logos, style guide, fonts, colors)', required: false },
                            'technical': { label: 'Technical Documentation (if applicable)', required: false },
                            'nda': { label: 'Signed Non-Disclosure Agreement', required: false },
                            'other': { label: 'Other Supporting Documents', required: false }
                          };
                          const doc = docLabels[docId] || { label: docId, required: false };
                          return `<li>${doc.label}${doc.required ? '<span class="required-badge">REQUIRED</span>' : ''}</li>`;
                        }).join('')}
                      </ul>
                    </div>

                    <div style="margin: 30px 0; text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ie-global.net'}/upload/${body.clientId}" 
                         style="display: inline-block; padding: 16px 32px; background: #D23B3B; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                        📤 Upload Documents Securely
                      </a>
                    </div>

                    <div class="info-box">
                      <p style="margin: 0; color: #92400E;"><strong>💡 Easy Upload:</strong> Click the button above to access our secure upload portal. You can download templates for required documents and upload everything directly - no email attachments needed!</p>
                    </div>

                    <p style="margin-top: 25px;"><strong>Why we need these:</strong></p>
                    <ul style="color: #5F6B7A; padding-left: 20px;">
                      <li style="margin-bottom: 10px;">To understand your current setup and goals</li>
                      <li style="margin-bottom: 10px;">To prepare a detailed project plan and timeline</li>
                      <li style="margin-bottom: 10px;">To ensure we have everything ready for kickoff</li>
                      <li style="margin-bottom: 10px;">To identify any potential technical requirements early</li>
                    </ul>

                    <div style="margin: 30px 0; padding: 20px; background: #F7F9FC; border-left: 4px solid #D23B3B; border-radius: 4px;">
                      <p style="margin: 0; color: #0B1930;"><strong>⏰ Timeline:</strong> Please send these documents within the next 3-5 business days so we can stay on schedule for your project kickoff.</p>
                    </div>

                    <p style="margin-top: 25px;">If you have any questions or need help, just reply to this email or reach out to us at hello@ie-global.net</p>
                  </div>

                  <div class="footer">
                    <p><strong>IE Global</strong><br>
                    Building Systems That Matter<br>
                    <a href="https://ie-global.net" style="color: #D23B3B; text-decoration: none;">ie-global.net</a> • 
                    <a href="mailto:hello@ie-global.net" style="color: #D23B3B; text-decoration: none;">hello@ie-global.net</a></p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      }

      // Send welcome email to client if requested
      if (sendWelcomeEmail) {
        await resend.emails.send({
          from: 'IE Global <no-reply@ie-global.net>',
          to: contactEmail,
          subject: `Welcome to IE Global, ${clientName}!`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                    line-height: 1.6; 
                    color: #0B1930; 
                    margin: 0;
                    padding: 0;
                  }
                  .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 40px 20px; 
                  }
                  .header { 
                    background: linear-gradient(135deg, #0B1930 0%, #1a2942 100%); 
                    color: white; 
                    padding: 40px 30px; 
                    border-radius: 8px;
                    margin-bottom: 30px; 
                  }
                  .header h1 { 
                    margin: 0 0 10px 0; 
                    font-size: 28px; 
                  }
                  .header p { 
                    margin: 0; 
                    opacity: 0.9; 
                    font-size: 16px; 
                  }
                  .content { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                  }
                  .field { 
                    margin-bottom: 20px; 
                  }
                  .label { 
                    font-weight: 600; 
                    color: #0B1930; 
                    margin-bottom: 8px; 
                    font-size: 14px;
                  }
                  .value { 
                    color: #5F6B7A; 
                    font-size: 16px;
                  }
                  .button { 
                    display: inline-block; 
                    padding: 14px 28px; 
                    background: #D23B3B; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: 600; 
                    margin: 20px 0;
                  }
                  .footer { 
                    margin-top: 30px; 
                    padding-top: 20px; 
                    border-top: 2px solid #f0f0f0; 
                    font-size: 14px; 
                    color: #5F6B7A; 
                    text-align: center;
                  }
                  .services-list {
                    background: #F7F9FC;
                    padding: 15px 20px;
                    border-radius: 6px;
                    margin: 15px 0;
                  }
                  .services-list li {
                    color: #0B1930;
                    margin: 8px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Welcome to IE Global!</h1>
                    <p>We're excited to partner with ${clientName}</p>
                  </div>
                  
                  <div class="content">
                    <p style="font-size: 18px; margin-bottom: 20px;">Hi ${contactPerson},</p>
                    
                    <p>Thank you for choosing IE Global as your technology partner. We're committed to building intelligent, scalable systems that drive real business value.</p>
                    
                    <p style="margin-top: 25px;"><strong>What happens next?</strong></p>
                    
                    <ol style="color: #5F6B7A; padding-left: 20px;">
                      <li style="margin-bottom: 12px;">Your dedicated project lead will reach out within 1 business day</li>
                      <li style="margin-bottom: 12px;">We'll schedule a kickoff meeting to align on goals and timeline</li>
                      <li style="margin-bottom: 12px;">You'll receive access to your client portal to track progress</li>
                      <li style="margin-bottom: 12px;">We'll begin the discovery phase to understand your needs deeply</li>
                    </ol>

                    ${serviceCategories && serviceCategories.length > 0 ? `
                      <div style="margin: 30px 0;">
                        <p style="font-weight: 600; color: #0B1930; margin-bottom: 10px;">Services We'll Be Providing:</p>
                        <div class="services-list">
                          <ul style="margin: 0; padding-left: 20px;">
                            ${serviceCategories.map((service: string) => `<li>${service}</li>`).join('')}
                          </ul>
                        </div>
                      </div>
                    ` : ''}

                    <div style="margin: 30px 0; padding: 20px; background: #F7F9FC; border-left: 4px solid #D23B3B; border-radius: 4px;">
                      <p style="margin: 0; color: #0B1930;"><strong>💡 Pro Tip:</strong> Keep all project-related documents organized and accessible. We'll request some initial materials to help us get started quickly.</p>
                    </div>

                    <p style="margin-top: 25px;">If you have any questions in the meantime, don't hesitate to reach out.</p>
                    
                    <a href="https://ie-global.net/contact" class="button">Contact Your Team</a>
                  </div>

                  <div class="footer">
                    <p><strong>IE Global</strong><br>
                    Building Systems That Matter<br>
                    <a href="https://ie-global.net" style="color: #D23B3B; text-decoration: none;">ie-global.net</a> • 
                    <a href="mailto:hello@ie-global.net" style="color: #D23B3B; text-decoration: none;">hello@ie-global.net</a></p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      }

      // Send internal notification to IE Global team
      await resend.emails.send({
        from: 'IE Global <contact@ie-global.net>',
        to: 'hello@ie-global.net',
        subject: `🎉 New Client Onboarded: ${clientName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0B1930; color: white; padding: 30px; margin-bottom: 30px; border-radius: 8px; }
                .field { margin-bottom: 20px; padding: 15px; background: #F7F9FC; border-radius: 6px; }
                .label { font-weight: 600; color: #0B1930; margin-bottom: 5px; font-size: 14px; }
                .value { color: #5F6B7A; font-size: 16px; }
                .badge { display: inline-block; padding: 4px 12px; background: #D23B3B; color: white; border-radius: 4px; font-size: 12px; font-weight: 600; margin-right: 6px; margin-bottom: 6px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; font-size: 14px; color: #888; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 28px;">🎉 New Client Onboarded</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">A new client has completed the onboarding workflow</p>
                </div>
                
                <div class="field">
                  <div class="label">Company Name</div>
                  <div class="value" style="font-size: 20px; font-weight: 600; color: #0B1930;">${clientName}</div>
                </div>

                <div class="field">
                  <div class="label">Contact Person</div>
                  <div class="value">${contactPerson}</div>
                </div>

                <div class="field">
                  <div class="label">Contact Email</div>
                  <div class="value"><a href="mailto:${contactEmail}" style="color: #D23B3B;">${contactEmail}</a></div>
                </div>

                ${serviceCategories && serviceCategories.length > 0 ? `
                  <div class="field">
                    <div class="label">Service Categories</div>
                    <div class="value">
                      ${serviceCategories.map((service: string) => `<span class="badge">${service}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}

                ${projectLead ? `
                  <div class="field">
                    <div class="label">Project Lead Assigned</div>
                    <div class="value">${projectLead}</div>
                  </div>
                ` : ''}

                <div class="field">
                  <div class="label">Welcome Email Sent</div>
                  <div class="value">${sendWelcomeEmail ? '✅ Yes' : '❌ No'}</div>
                </div>

                <div style="margin-top: 30px; padding: 20px; background: #D23B3B; border-radius: 8px;">
                  <p style="margin: 0; color: white;"><strong>Action Required:</strong> Review the onboarding details in the dashboard and reach out to ${contactPerson} within 1 business day.</p>
                </div>

                <div class="footer">
                  <p>This is an automated notification from the IE Global client onboarding system.<br>
                  <strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                </div>
              </div>
            </body>
          </html>
        `,
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

