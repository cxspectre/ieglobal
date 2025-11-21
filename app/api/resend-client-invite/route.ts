import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Generate new invitation link with proper redirect
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
      }
    });

    if (resetError) {
      console.error('Resend error:', resetError);
      throw resetError;
    }

    const invitationLink = resetData?.properties?.action_link;

    // Get user's full name from profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('email', email)
      .single();

    const fullName = profile?.full_name || 'there';

    // Send email via Resend
    if (resend && invitationLink) {
      try {
        await resend.emails.send({
          from: 'IE Global <contact@ie-global.net>',
          to: email,
          subject: 'IE Global Portal - Set Your Password (Resent)',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #0B1930; color: white; padding: 30px 20px; margin-bottom: 30px; }
                  .button { display: inline-block; padding: 16px 32px; background: #E63946; color: white; text-decoration: none; font-weight: 600; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">Set Your Portal Password</h1>
                  </div>
                  
                  <p>Hi ${fullName},</p>
                  
                  <p>You requested a new invitation to access your IE Global portal. Click below to set your password:</p>
                  
                  <a href="${invitationLink}" class="button" style="color: white;">Set My Password</a>
                  
                  <p style="font-size: 14px; color: #666;">
                    Or copy this link: <span style="word-break: break-all; color: #0066cc;">${invitationLink}</span>
                  </p>
                  
                  <p>— The IE Global Team</p>
                </div>
              </body>
            </html>
          `,
        });

        console.log('Resend email sent via Resend to:', email);
      } catch (emailError) {
        console.error('Resend via Resend error:', emailError);
      }
    }

    console.log('Invitation resent to:', email);

    return NextResponse.json({
      message: 'Invitation resent successfully',
      invitationLink: invitationLink,
    });
  } catch (error: any) {
    console.error('Resend invitation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend invitation' },
      { status: 500 }
    );
  }
}


