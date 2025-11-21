import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { email, fullName, role } = await request.json();

    if (!email || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify role is valid
    if (role !== 'employee' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
      }
    });

    if (authError) throw authError;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: role,
        client_id: null,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    // Generate invitation link
    const { data: resetData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
      }
    });

    const invitationLink = resetData?.properties?.action_link;

    // Send email via Resend
    if (resend && invitationLink) {
      await resend.emails.send({
        from: 'IE Global <contact@ie-global.net>',
        to: email,
        subject: 'Welcome to IE Global - Set Your Password',
        html: `
          <h2>Welcome to IE Global, ${fullName}!</h2>
          <p>Your ${role} account has been created. Click below to set your password:</p>
          <p><a href="${invitationLink}" style="display: inline-block; padding: 12px 24px; background: #E63946; color: white; text-decoration: none; font-weight: bold;">Set My Password</a></p>
          <p>Or copy this link: ${invitationLink}</p>
          <p>— The IE Global Team</p>
        `,
      });
    }

    return NextResponse.json({
      message: 'Employee account created successfully',
      userId: authData.user.id,
      invitationLink,
    });
  } catch (error: any) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create employee account' },
      { status: 500 }
    );
  }
}

