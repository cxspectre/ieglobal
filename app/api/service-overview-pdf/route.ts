import { NextResponse } from 'next/server';
import { generateServiceOverviewPDF } from '@/lib/generateServiceOverviewPDF';

export async function GET() {
  try {
    const pdfBlob = await generateServiceOverviewPDF();
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="IE-Global-Service-Overview.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating service overview PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

