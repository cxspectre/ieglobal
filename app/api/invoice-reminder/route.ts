import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

    const amount = parseFloat(invoice.amount || 0).toFixed(2);
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!resend || !process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: 'Email service not configured',
      });
    }

    await resend.emails.send({
      from: 'IE Global <no-reply@ie-global.net>',
      to: contactEmail,
      subject: `Payment reminder: Invoice ${invoice.invoice_number}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #0B1930; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { background: #0B1930; color: white; padding: 24px; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
              .amount { font-size: 24px; font-weight: bold; color: #0B1930; }
              .footer { margin-top: 24px; font-size: 12px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 20px;">Payment reminder</h1>
                <p style="margin: 8px 0 0; opacity: 0.9;">Invoice ${invoice.invoice_number}</p>
              </div>
              <div class="content">
                <p>Hi ${client?.contact_person || 'there'},</p>
                <p>This is a friendly reminder that the following invoice is overdue:</p>
                <p><strong>Invoice:</strong> ${invoice.invoice_number}<br>
                <strong>Amount:</strong> €${amount}<br>
                <strong>Due date:</strong> ${dueDate}</p>
                <p>Please arrange payment at your earliest convenience. If you have already paid, kindly disregard this reminder.</p>
                <p>If you have any questions, please don't hesitate to reach out.</p>
                <p>Best regards,<br>IE Global</p>
                <div class="footer">
                  IE Global – Digital Systems & Engineering
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true, emailSent: true });
  } catch (err) {
    console.error('Invoice reminder error:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to send reminder' },
      { status: 500 }
    );
  }
}
