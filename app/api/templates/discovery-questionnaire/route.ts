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
    doc.setFontSize(20);
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('Discovery Questionnaire', marginLeft, currentY);
    currentY += 12;
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(95, 107, 122);
    doc.text('Please complete this questionnaire to help us understand your project needs.', marginLeft, currentY);
    currentY += 10;
    
    // Company Information Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('1. Company Information', marginLeft, currentY);
    currentY += lineHeight + 2;
    
    const questions = [
      'Company Name: _________________________________________________________________',
      '',
      'Industry: _______________________________________________________________________',
      '',
      'Number of Employees: ____________________________________________________________',
      '',
      'Website (if existing): __________________________________________________________',
      '',
      '',
      '2. Project Goals & Objectives',
      '',
      'What problem are you trying to solve?',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      'What are your primary goals for this project?',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      'How will success be measured?',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      '',
      '3. Target Audience',
      '',
      'Who are your primary users/customers?',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      'What are their main pain points or needs?',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      '',
      '4. Technical Requirements',
      '',
      'Do you have any existing systems or platforms? (Describe)',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      'Are there any specific technologies you require or prefer?',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      'Do you need integration with other tools/services? (Which ones?)',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
    ];
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    questions.forEach((question, index) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = marginTop;
        
        addLogoSafe(doc, pageWidth, marginRight, marginTop);
      }
      
      if (question.startsWith('1.') || question.startsWith('2.') || question.startsWith('3.') || question.startsWith('4.') || question.startsWith('5.')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
      }
      
      doc.text(question, marginLeft, currentY);
      currentY += lineHeight;
    });
    
    // Add new page for more questions
    doc.addPage();
    currentY = marginTop + 20;
    
    addLogoSafe(doc, pageWidth, marginRight, marginTop);
    
    const moreQuestions = [
      '5. Timeline & Budget',
      '',
      'What is your desired project timeline?',
      '_________________________________________________________________________________',
      '',
      'Do you have a budget range in mind?',
      '_________________________________________________________________________________',
      '',
      'Are there any critical deadlines we should be aware of?',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      '',
      '6. Design & User Experience',
      '',
      'Do you have existing brand guidelines? (Please attach if yes)',
      '_________________________________________________________________________________',
      '',
      'Are there any websites/apps you admire? (Please list)',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      'What feeling should users have when using your product?',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      '',
      '7. Additional Information',
      '',
      'Is there anything else we should know about your project?',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '_________________________________________________________________________________',
      '',
      '',
      'Thank you for completing this questionnaire!',
      'Please return this document via the upload portal or email to hello@ie-global.net',
    ];
    
    moreQuestions.forEach((question) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = marginTop;
        addLogoSafe(doc, pageWidth, marginRight, marginTop);
      }
      
      if (question.startsWith('5.') || question.startsWith('6.') || question.startsWith('7.')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      } else if (question.startsWith('Thank you')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
      }
      
      doc.text(question, marginLeft, currentY);
      currentY += lineHeight;
    });
    
    const pdfBlob = doc.output('blob');
    
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="IE-Global-Discovery-Questionnaire.pdf"',
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

