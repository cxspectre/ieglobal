import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { emailTemplate } from '@/lib/email-template';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { clientId, email, fullName } = await request.json();

    if (!clientId || !email || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create admin client using service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create auth user with email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'client',
        client_id: clientId,
      }
    });

    if (authError) throw authError;

    // Create profile (might be auto-created by trigger, but ensure it exists)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'client',
        client_id: clientId,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail - trigger might have created it
    }

    // Generate invitation link with proper redirect
    console.log('Generating invitation link for:', email);
    
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
      }
    });

    if (resetError) {
      console.error('Link generation error:', resetError);
      throw new Error('Failed to generate invitation link');
    }

    const invitationLink = resetData?.properties?.action_link;
    console.log('Invitation link generated:', invitationLink);

    // Send email via Resend (more reliable than Supabase email)
    let emailSent = false;
    if (resend && invitationLink) {
      try {
        console.log('Sending email via Resend to:', email);
        const html = emailTemplate(`
          <p>Hi ${fullName},</p>
          <p>Your IE Global project portal has been set up. You can access your project dashboard to:</p>
          <ul style="margin: 16px 0; padding-left: 24px;">
            <li>Track project progress and milestones</li>
            <li>View and download files</li>
            <li>Review invoices</li>
            <li>Communicate with your team</li>
          </ul>
          <p><strong>To get started, click below to set your password:</strong></p>
          <p><a href="${invitationLink}" class="button">Set My Password &amp; Access Portal</a></p>
          <p style="font-size: 14px; color: #64748b;">If the button does not work, copy this link into your browser: ${invitationLink}</p>
          <p>Once you have set your password, you can log in at <a href="https://ie-global.net/login" style="color: #E63946;">ie-global.net/login</a></p>
          <p>Questions? Reply to this email or contact us at hello@ie-global.net</p>
          <p>— The IE Global Team</p>
        `);
        const emailResult = await resend.emails.send({
          from: 'IE Global <contact@ie-global.net>',
          to: email,
          subject: 'Welcome to IE Global Portal – Set Your Password',
          html,
        });

        console.log('Email sent successfully via Resend:', emailResult);
        emailSent = true;
      } catch (emailError) {
        console.error('Resend email error:', emailError);
        // Don't fail - we have the manual link as backup
      }
    } else {
      console.log('Resend not configured or no invitation link');
    }

    return NextResponse.json({
      message: emailSent 
        ? 'Client account created and email sent successfully!' 
        : 'Client account created. Email not sent - use the manual link below.',
      userId: authData.user.id,
      invitationLink: invitationLink,
      emailSent: emailSent,
    });
  } catch (error: any) {
    console.error('Create client user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client account' },
      { status: 500 }
    );
  }
}

