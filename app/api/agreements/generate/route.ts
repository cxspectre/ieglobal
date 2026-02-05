import { NextResponse } from 'next/server';
import { generateAgreementPDF, getAgreementFilename } from '@/lib/generateAgreementPDF';
import type { AgreementFormData } from '@/lib/agreements';

const VALID_TYPES = ['nda', 'msa', 'sow', 'sla', 'osa', 'dpa'] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agreementType, ...formData } = body;

    if (!agreementType || !VALID_TYPES.includes(agreementType)) {
      return NextResponse.json(
        { error: 'Invalid agreement type. Must be one of: nda, msa, sow, sla, osa, dpa' },
        { status: 400 }
      );
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
    const filename = getAgreementFilename(agreementType, data.company_name);

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
