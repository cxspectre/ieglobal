import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { loadLogoDataUrl } from '@/lib/loadLogoForPDF';

function addLogoSafe(doc: jsPDF, pageWidth: number, marginRight: number, marginTop: number) {
  const logoDataUrl = loadLogoDataUrl();
  if (!logoDataUrl) return;
  try {
    doc.addImage(logoDataUrl, 'PNG', pageWidth - marginRight - 40, marginTop - 2, 40, 14);
  } catch {
    // jsPDF PNG decode can fail in some environments; skip logo
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
    doc.setFontSize(20);
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('Access Credentials Form', marginLeft, currentY);
    currentY += 12;
    
    // Security Notice
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
    doc.text('⚠ CONFIDENTIAL - Handle with care. Encrypt this document when sending.', marginLeft, currentY);
    currentY += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(95, 107, 122);
    doc.text('Please provide access credentials for systems relevant to the project.', marginLeft, currentY);
    currentY += 8;
    
    // Company Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('Company Information', marginLeft, currentY);
    currentY += lineHeight + 2;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const companyFields = [
      'Company Name: _________________________________________________________________',
      '',
      'Project Name: __________________________________________________________________',
      '',
      'Date: __________________________________________________________________________',
      '',
    ];
    
    companyFields.forEach(field => {
      doc.text(field, marginLeft, currentY);
      currentY += lineHeight;
    });
    
    currentY += 5;
    
    // Domain & Hosting
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('1. Domain & Hosting', marginLeft, currentY);
    currentY += lineHeight + 2;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const domainFields = [
      'Domain Name: ___________________________________________________________________',
      '',
      'Domain Registrar: ______________________________________________________________',
      '',
      'Registrar Login URL: ___________________________________________________________',
      '',
      'Username: ______________________________________________________________________',
      '',
      'Password: ______________________________________________________________________',
      '',
      'Hosting Provider: ______________________________________________________________',
      '',
      'Hosting Login URL: _____________________________________________________________',
      '',
      'Username: ______________________________________________________________________',
      '',
      'Password: ______________________________________________________________________',
      '',
      'FTP/SFTP Host: _________________________________________________________________',
      '',
      'FTP Username: __________________________________________________________________',
      '',
      'FTP Password: __________________________________________________________________',
      '',
    ];
    
    domainFields.forEach(field => {
      if (currentY > 270) {
        doc.addPage();
        currentY = marginTop;
        addLogoSafe(doc, pageWidth, marginRight, marginTop);
        currentY += 15;
      }
      doc.text(field, marginLeft, currentY);
      currentY += lineHeight;
    });
    
    // CMS/Platform Access
    doc.addPage();
    currentY = marginTop + 20;
    addLogoSafe(doc, pageWidth, marginRight, marginTop);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('2. CMS / Platform Access', marginLeft, currentY);
    currentY += lineHeight + 2;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const cmsFields = [
      'Platform Name (e.g., WordPress, Shopify): _______________________________________',
      '',
      'Admin URL: _____________________________________________________________________',
      '',
      'Username: ______________________________________________________________________',
      '',
      'Password: ______________________________________________________________________',
      '',
      '2FA Code/Method (if applicable): _______________________________________________',
      '',
      '',
      '3. Database Access (if applicable)',
      '',
      'Database Type: _________________________________________________________________',
      '',
      'Database Host: _________________________________________________________________',
      '',
      'Database Name: _________________________________________________________________',
      '',
      'Username: ______________________________________________________________________',
      '',
      'Password: ______________________________________________________________________',
      '',
      'Port: __________________________________________________________________________',
      '',
      '',
      '4. Third-Party Services',
      '',
      'Service Name #1: _______________________________________________________________',
      '',
      'Login URL: _____________________________________________________________________',
      '',
      'Username: ______________________________________________________________________',
      '',
      'Password: ______________________________________________________________________',
      '',
      '',
      'Service Name #2: _______________________________________________________________',
      '',
      'Login URL: _____________________________________________________________________',
      '',
      'Username: ______________________________________________________________________',
      '',
      'Password: ______________________________________________________________________',
      '',
    ];
    
    cmsFields.forEach((field) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = marginTop;
        addLogoSafe(doc, pageWidth, marginRight, marginTop);
        currentY += 15;
      }
      
      if (field.startsWith('3.') || field.startsWith('4.')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
      }
      
      doc.text(field, marginLeft, currentY);
      currentY += lineHeight;
    });
    
    // Footer
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
    doc.text('Security Reminder:', marginLeft, currentY);
    currentY += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('Please encrypt this document or use the secure upload portal.', marginLeft, currentY);
    currentY += lineHeight;
    doc.text('Never send credentials via unencrypted email.', marginLeft, currentY);
    
    const pdfBlob = doc.output('blob');
    
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="IE-Global-Access-Credentials.pdf"',
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

