import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { emailTemplate } from '@/lib/email-template';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const PORTAL_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ie-global.net';

export async function POST(request: Request) {
  try {
    const { invoiceId } = await request.json();
    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('*, clients!inner(company_name, contact_person, contact_email)')
      .eq('id', invoiceId)
      .single();

    if (invError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const client = invoice.clients as { company_name: string; contact_person: string; contact_email: string };
    const contactEmail = client?.contact_email;
    if (!contactEmail) {
      return NextResponse.json({ error: 'Client has no email' }, { status: 400 });
    }

    const amount = parseFloat(invoice.total_amount ?? invoice.amount ?? 0).toFixed(2);
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const portalLink = `${PORTAL_URL.replace(/\/$/, '')}/portal/invoices`;

    if (!resend || !process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: 'Email service not configured',
      });
    }

    const html = emailTemplate(`
      <p>Hi ${client?.contact_person || 'there'},</p>
      <p>A new invoice is ready for ${client?.company_name || 'your company'}. Payment is due within 15 days.</p>
      <p><strong>Invoice:</strong> ${invoice.invoice_number}<br>
      <strong>Amount:</strong> €${amount}<br>
      <strong>Due date:</strong> ${dueDate}</p>
      <p>You can view and download the invoice in your client portal. If you have any questions, please do not hesitate to reach out.</p>
      <p><a href="${portalLink}" class="button">View Invoices in Portal</a></p>
      <p style="font-size: 14px; color: #64748b;">Or log in at <a href="${PORTAL_URL}/login" style="color: #E63946;">${PORTAL_URL}/login</a></p>
      <p>Best regards,<br>The IE Global Team</p>
    `);

    await resend.emails.send({
      from: 'IE Global <contact@ie-global.net>',
      to: contactEmail,
      subject: `Invoice ${invoice.invoice_number} is ready – due ${new Date(invoice.due_date).toLocaleDateString('en-GB')}`,
      html,
    });

    return NextResponse.json({ success: true, emailSent: true });
  } catch (err) {
    console.error('Invoice created email error:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
