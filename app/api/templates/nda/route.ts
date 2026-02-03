import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { loadLogoDataUrl } from '@/lib/loadLogoForPDF';

function addLogoSafe(doc: jsPDF, pageWidth: number, marginRight: number, marginTop: number) {
  const logoDataUrl = loadLogoDataUrl();
  if (!logoDataUrl) return;
  try {
    doc.addImage(logoDataUrl, 'PNG', pageWidth - marginRight - 40, marginTop - 2, 40, 14);
  } catch {
    // jsPDF PNG decode can fail in serverless; skip logo
  }
}

export async function GET() {
  try {
    const doc = new jsPDF();
    
    const marginLeft = 20;
    const marginRight = 20;
    const marginTop = 20;
    const pageWidth = 210;
    const lineHeight = 6;
    
    const navyBlue = [11, 25, 48];
    const signalRed = [210, 59, 59];
    
    addLogoSafe(doc, pageWidth, marginRight, marginTop);

    let currentY = marginTop + 20;
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('Non-Disclosure Agreement (NDA)', marginLeft, currentY);
    currentY += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
    doc.text('Note: This is a basic template. Please have your legal counsel review before signing.', marginLeft, currentY);
    currentY += 10;
    
    // Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Date: _____________________', marginLeft, currentY);
    currentY += 10;
    
    // Parties
    doc.setFont('helvetica', 'bold');
    doc.text('Between:', marginLeft, currentY);
    currentY += lineHeight + 2;
    
    doc.setFont('helvetica', 'normal');
    const parties = [
      '1. IE Global (Service Provider)',
      '   Address: [Your Address]',
      '   Email: hello@ie-global.net',
      '',
      '2. _________________________________________ (Client)',
      '   Company Name: _________________________________________________________________',
      '   Address: ______________________________________________________________________',
      '   Email: ________________________________________________________________________',
    ];
    
    parties.forEach(line => {
      doc.text(line, marginLeft, currentY);
      currentY += lineHeight;
    });
    
    currentY += 5;
    
    // Purpose
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Purpose:', marginLeft, currentY);
    currentY += lineHeight + 2;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const purpose = doc.splitTextToSize(
      'The parties wish to explore a business opportunity together and will need to disclose certain confidential ' +
      'information to each other for the purpose of evaluating and potentially pursuing this opportunity.',
      pageWidth - marginLeft - marginRight
    );
    purpose.forEach((line: string) => {
      doc.text(line, marginLeft, currentY);
      currentY += lineHeight;
    });
    
    currentY += 5;
    
    // Agreement sections
    const sections = [
      {
        title: '1. Definition of Confidential Information',
        content: 'Confidential Information includes all information disclosed by either party, whether in writing, orally, ' +
                 'or by any other means, including but not limited to: technical data, trade secrets, know-how, research, ' +
                 'product plans, products, services, customers, customer lists, markets, software, developments, inventions, ' +
                 'processes, formulas, technology, designs, drawings, engineering, hardware configuration information, ' +
                 'marketing, finances, or other business information.'
      },
      {
        title: '2. Non-Disclosure Obligations',
        content: 'Each party agrees to hold and maintain the Confidential Information in strictest confidence and not to ' +
                 'disclose such Confidential Information to third parties without the prior written consent of the disclosing party.'
      },
      {
        title: '3. Use of Confidential Information',
        content: 'The Confidential Information shall be used solely for the purpose described above and shall not be used ' +
                 'for any other purpose or in any other manner.'
      },
      {
        title: '4. Term',
        content: 'This Agreement shall remain in effect for a period of three (3) years from the date first written above.'
      },
    ];
    
    sections.forEach(section => {
      if (currentY > 250) {
        doc.addPage();
        currentY = marginTop;
        addLogoSafe(doc, pageWidth, marginRight, marginTop);
        currentY += 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(section.title, marginLeft, currentY);
      currentY += lineHeight + 2;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(section.content, pageWidth - marginLeft - marginRight);
      lines.forEach((line: string) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = marginTop;
          addLogoSafe(doc, pageWidth, marginRight, marginTop);
          currentY += 20;
        }
        doc.text(line, marginLeft, currentY);
        currentY += lineHeight;
      });
      
      currentY += 5;
    });
    
    // Signatures
    doc.addPage();
    currentY = marginTop + 20;
    
    addLogoSafe(doc, pageWidth, marginRight, marginTop);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Signatures:', marginLeft, currentY);
    currentY += 15;
    
    // IE Global signature
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('IE Global:', marginLeft, currentY);
    currentY += lineHeight + 2;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Signature: ________________________________________________', marginLeft, currentY);
    currentY += lineHeight + 3;
    doc.text('Name: ____________________________________________________', marginLeft, currentY);
    currentY += lineHeight + 3;
    doc.text('Title: ____________________________________________________', marginLeft, currentY);
    currentY += lineHeight + 3;
    doc.text('Date: ____________________________________________________', marginLeft, currentY);
    currentY += 15;
    
    // Client signature
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', marginLeft, currentY);
    currentY += lineHeight + 2;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Signature: ________________________________________________', marginLeft, currentY);
    currentY += lineHeight + 3;
    doc.text('Name: ____________________________________________________', marginLeft, currentY);
    currentY += lineHeight + 3;
    doc.text('Title: ____________________________________________________', marginLeft, currentY);
    currentY += lineHeight + 3;
    doc.text('Date: ____________________________________________________', marginLeft, currentY);
    
    const pdfBlob = doc.output('blob');
    
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="IE-Global-NDA.pdf"',
      },
    });
  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}

