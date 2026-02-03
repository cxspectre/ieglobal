import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { emailTemplate } from '@/lib/email-template';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const {
      email,
      fullName,
      role,
      phone,
      birth_date,
      address_street,
      address_city,
      address_postal_code,
      address_country,
      bio,
      sendInvite = true,
    } = await request.json();

    if (!email || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify role is valid (admin, employee, or partner)
    if (!['admin', 'employee', 'partner'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, employee, or partner.' },
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

    // Create profile with optional fields
    const profilePayload: Record<string, unknown> = {
      id: authData.user.id,
      email,
      full_name: fullName,
      role: role,
      client_id: null,
    };
    if (phone != null) profilePayload.phone = phone;
    if (birth_date != null) profilePayload.birth_date = birth_date;
    if (address_street != null) profilePayload.address_street = address_street;
    if (address_city != null) profilePayload.address_city = address_city;
    if (address_postal_code != null) profilePayload.address_postal_code = address_postal_code;
    if (address_country != null) profilePayload.address_country = address_country;
    if (bio != null) profilePayload.bio = bio;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload);

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    // Generate invitation link only if sendInvite is true
    let invitationLink: string | undefined;
    if (sendInvite !== false) {
      const { data: resetData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
        }
      });
      invitationLink = resetData?.properties?.action_link;
    }

    // Send email via Resend
    if (sendInvite !== false && resend && invitationLink) {
      const html = emailTemplate(`
        <p><strong>Welcome to IE Global, ${fullName}.</strong></p>
        <p>Your ${role} account has been created. Click below to set your password:</p>
        <p><a href="${invitationLink}" class="button">Set My Password</a></p>
        <p style="font-size: 14px; color: #64748b;">Or copy this link: ${invitationLink}</p>
        <p>— The IE Global Team</p>
      `);
      await resend.emails.send({
        from: 'IE Global <contact@ie-global.net>',
        to: email,
        subject: 'Welcome to IE Global – Set Your Password',
        html,
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

