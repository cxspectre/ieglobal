import { NextResponse } from 'next/server';
import { generateAgreementPDF, getAgreementFilename } from '@/lib/generateAgreementPDF';
import type { AgreementFormData, PartnershipFormData } from '@/lib/agreements';

const VALID_TYPES = ['nda', 'msa', 'sow', 'sla', 'osa', 'dpa', 'partnership'] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agreementType, ...formData } = body;

    if (!agreementType || !VALID_TYPES.includes(agreementType)) {
      return NextResponse.json(
        { error: 'Invalid agreement type. Must be one of: nda, msa, sow, sla, osa, dpa, partnership' },
        { status: 400 }
      );
    }

    if (agreementType === 'partnership') {
      const pData: PartnershipFormData = {
        partner_name: formData.partner_name || '',
        partner_entity_type: formData.partner_entity_type || 'individual / studio',
        partner_address: formData.partner_address || '',
        partner_email: formData.partner_email || '',
        partner_contact: formData.partner_contact || '',
        effective_date: formData.effective_date || new Date().toISOString().slice(0, 10),
        communication_tools: formData.communication_tools || 'Figma, Notion, Slack, Email',
        revision_rounds: formData.revision_rounds || '2',
        revision_rate: formData.revision_rate || 'as agreed',
        acceptance_days: formData.acceptance_days || '5',
        fee_model: formData.fee_model || 'A',
        hourly_rate: formData.hourly_rate,
        day_rate: formData.day_rate,
        billing_frequency: formData.billing_frequency || 'monthly',
        fixed_fee: formData.fixed_fee,
        retainer_amount: formData.retainer_amount,
        retainer_hours: formData.retainer_hours,
        excess_rate: formData.excess_rate,
        revenue_share_pct: formData.revenue_share_pct,
        revenue_share_days: formData.revenue_share_days,
        invoice_days: formData.invoice_days || '14',
        late_interest: formData.late_interest || 'statutory interest',
        confidentiality_years: formData.confidentiality_years || '3',
        non_solicit_months: formData.non_solicit_months || '12',
        liability_months: formData.liability_months || '12',
        notice_days: formData.notice_days || '30',
        cure_days: formData.cure_days || '10',
        governing_law: formData.governing_law || 'Netherlands',
        notice_email: formData.notice_email || 'cdrefke@ie-global.net',
      };
      const pdfBlob = await generateAgreementPDF('partnership', pData);
      const buffer = await pdfBlob.arrayBuffer();
      const filename = getAgreementFilename('partnership', pData.partner_name);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    const data: AgreementFormData = {
      client_name: formData.client_name || '',
      company_name: formData.company_name || '',
      client_address: formData.client_address || '',
      client_email: formData.client_email || '',
      client_contact: formData.client_contact || '',
      client_phone: formData.client_phone || '',
      client_kvk: formData.client_kvk || '',
      client_vat: formData.client_vat || '',
      work_types: Array.isArray(formData.work_types) ? formData.work_types : [],
      country: formData.country || 'Netherlands',
      effective_date: formData.effective_date || new Date().toISOString().slice(0, 10),
      term_months: formData.term_months || '12',
      governing_law: formData.governing_law || formData.country || 'Netherlands',
      project_description: formData.project_description || '',
      scope_summary: formData.scope_summary || '',
      support_hours: formData.support_hours || '40',
      response_time_hours: formData.response_time_hours || '24',
    };

    const pdfBlob = await generateAgreementPDF(agreementType, data);
    const buffer = await pdfBlob.arrayBuffer();
    const filename = getAgreementFilename(agreementType, data.company_name || '');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Agreement generation error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
