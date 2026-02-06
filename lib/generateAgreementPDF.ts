import { jsPDF } from 'jspdf';
import { loadLogoDataUrl } from './loadLogoForPDF';
import {
  IE_GLOBAL,
  fillTemplate,
  fillPartnershipTemplate,
  type AgreementFormData,
  type PartnershipFormData,
  NDA_TEXT,
  MSA_TEXT,
  SOW_TEXT,
  SLA_TEXT,
  OSA_TEXT,
  DPA_TEXT,
  PARTNERSHIP_TEXT,
} from './agreements';

type AgreementType = 'nda' | 'msa' | 'sow' | 'sla' | 'osa' | 'dpa' | 'partnership';

const marginLeft = 20;
const marginRight = 20;
const marginTop = 20;
const pageWidth = 210;
const lineHeight = 6;
const navyBlue = [11, 25, 48];
const signalRed = [230, 57, 70];

// Logo positioning: match generateInvoicePDF.ts exactly
const logoW = 38;
const logoH = 40;
const logoRightX = pageWidth - 15;
const logoLeftX = logoRightX - logoW;
const logoBottomY = 46;
const logoTop = logoBottomY - logoH;

function addLogoSafe(doc: jsPDF) {
  const logoDataUrl = loadLogoDataUrl();
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', logoLeftX, logoTop, logoW, logoH);
    } catch {
      // fallback to text
    }
  }
  if (!logoDataUrl) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('IE ', logoRightX - 18, logoTop + 14);
    doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
    doc.text('Global', logoRightX, logoTop + 18, { align: 'right' });
  }
}

function addSection(doc: jsPDF, currentY: { value: number }, title: string, content: string) {
  if (currentY.value > 250) {
    doc.addPage();
    addLogoSafe(doc);
    currentY.value = logoBottomY + 20;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text(title, marginLeft, currentY.value);
  currentY.value += lineHeight + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const lines = doc.splitTextToSize(content, pageWidth - marginLeft - marginRight);
  for (const line of lines) {
    if (currentY.value > 270) {
      doc.addPage();
      addLogoSafe(doc);
      currentY.value = logoBottomY + 20;
    }
    doc.text(line, marginLeft, currentY.value);
    currentY.value += lineHeight;
  }
  currentY.value += 5;
}

function addSignatures(doc: jsPDF, currentY: { value: number }) {
  if (currentY.value > 180) {
    doc.addPage();
    addLogoSafe(doc);
    currentY.value = logoBottomY + 20;
  } else {
    currentY.value += 15;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Signatures:', marginLeft, currentY.value);
  currentY.value += 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('IE Global:', marginLeft, currentY.value);
  currentY.value += lineHeight + 2;
  doc.setFont('helvetica', 'normal');
  doc.text('Signature: ________________________________________________', marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text(`Name: ${IE_GLOBAL.contact}`, marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text('Title: Managing Director', marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text('Date: ________________________________________________', marginLeft, currentY.value);
  currentY.value += 15;

  doc.setFont('helvetica', 'bold');
  doc.text('Client:', marginLeft, currentY.value);
  currentY.value += lineHeight + 2;
  doc.setFont('helvetica', 'normal');
  doc.text('Signature: ________________________________________________', marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text('Name: ____________________________________________________', marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text('Title: ____________________________________________________', marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text('Date: ____________________________________________________', marginLeft, currentY.value);
}

function addPartnerSignatures(doc: jsPDF, currentY: { value: number }, partnerName: string) {
  if (currentY.value > 180) {
    doc.addPage();
    addLogoSafe(doc);
    currentY.value = logoBottomY + 20;
  } else {
    currentY.value += 15;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Signatures:', marginLeft, currentY.value);
  currentY.value += 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('IE Global:', marginLeft, currentY.value);
  currentY.value += lineHeight + 2;
  doc.setFont('helvetica', 'normal');
  doc.text('Signature: ________________________________________________', marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text(`Name: ${IE_GLOBAL.contact}`, marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text('Title: Managing Director', marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text('Date: ________________________________________________', marginLeft, currentY.value);
  currentY.value += 15;

  doc.setFont('helvetica', 'bold');
  doc.text('Partner:', marginLeft, currentY.value);
  currentY.value += lineHeight + 2;
  doc.setFont('helvetica', 'normal');
  doc.text('Signature: ________________________________________________', marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text(`Name: ${partnerName || '____________________________________________________'}`, marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text('Title: ____________________________________________________', marginLeft, currentY.value);
  currentY.value += lineHeight + 3;
  doc.text('Date: ____________________________________________________', marginLeft, currentY.value);
}

export async function generateAgreementPDF(
  agreementType: AgreementType,
  data: AgreementFormData | PartnershipFormData
): Promise<Blob> {
  const doc = new jsPDF();
  addLogoSafe(doc);
  let currentY = { value: logoBottomY + 20 };

  let title = '';
  let preamble = '';
  let sections: { title: string; content: string }[] = [];
  let needsSignatures = true;

  switch (agreementType) {
    case 'partnership': {
      const pData = data as PartnershipFormData;
      title = fillPartnershipTemplate(PARTNERSHIP_TEXT.title, pData);
      preamble = fillPartnershipTemplate(PARTNERSHIP_TEXT.preamble, pData);
      sections = PARTNERSHIP_TEXT.sections.map((s) => ({
        title: s.title,
        content: fillPartnershipTemplate(s.content, pData),
      }));
      needsSignatures = true;
      break;
    }
    case 'nda': {
      const cData = data as AgreementFormData;
      title = fillTemplate(NDA_TEXT.title, cData);
      preamble = fillTemplate(NDA_TEXT.parties, cData);
      sections = NDA_TEXT.sections.map((s) => ({ title: s.title, content: fillTemplate(s.content, cData) }));
      break;
    }
    case 'msa': {
      const cData = data as AgreementFormData;
      title = fillTemplate(MSA_TEXT.title, cData);
      preamble = fillTemplate(MSA_TEXT.preamble, cData);
      sections = MSA_TEXT.sections.map((s) => ({ title: s.title, content: fillTemplate(s.content, cData) }));
      break;
    }
    case 'sow': {
      const cData = data as AgreementFormData;
      title = fillTemplate(SOW_TEXT.title, cData);
      preamble = fillTemplate(SOW_TEXT.preamble, cData);
      sections = SOW_TEXT.sections.map((s) => ({ title: s.title, content: fillTemplate(s.content, cData) }));
      needsSignatures = false;
      break;
    }
    case 'sla': {
      const cData = data as AgreementFormData;
      title = fillTemplate(SLA_TEXT.title, cData);
      preamble = fillTemplate(SLA_TEXT.preamble, cData);
      sections = SLA_TEXT.sections.map((s) => ({ title: s.title, content: fillTemplate(s.content, cData) }));
      break;
    }
    case 'osa': {
      const cData = data as AgreementFormData;
      title = fillTemplate(OSA_TEXT.title, cData);
      preamble = fillTemplate(OSA_TEXT.preamble, cData);
      sections = OSA_TEXT.sections.map((s) => ({ title: s.title, content: fillTemplate(s.content, cData) }));
      break;
    }
    case 'dpa': {
      const cData = data as AgreementFormData;
      title = fillTemplate(DPA_TEXT.title, cData);
      preamble = fillTemplate(DPA_TEXT.preamble, cData);
      sections = DPA_TEXT.sections.map((s) => ({ title: s.title, content: fillTemplate(s.content, cData) }));
      break;
    }
    default:
      throw new Error(`Unknown agreement type: ${agreementType}`);
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text(title, marginLeft, currentY.value);
  currentY.value += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('This is a template. Please have your legal counsel review before signing.', marginLeft, currentY.value);
  currentY.value += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  // Preamble (wrap long lines to avoid cut-off)
  const contentWidth = pageWidth - marginLeft - marginRight;
  const preambleLines = preamble.split('\n');
  for (const line of preambleLines) {
    const wrapped = doc.splitTextToSize(line, contentWidth);
    for (const w of wrapped) {
      if (currentY.value > 270) {
        doc.addPage();
        addLogoSafe(doc);
        currentY.value = logoBottomY + 20;
      }
      doc.text(w, marginLeft, currentY.value);
      currentY.value += lineHeight;
    }
  }
  currentY.value += 8;

  // Sections
  for (const section of sections) {
    addSection(doc, currentY, section.title, section.content);
  }

  if (needsSignatures) {
    if (agreementType === 'partnership') {
      addPartnerSignatures(doc, currentY, (data as PartnershipFormData).partner_contact || (data as PartnershipFormData).partner_name);
    } else {
      addSignatures(doc, currentY);
    }
  }

  return doc.output('blob');
}

export function getAgreementFilename(type: AgreementType, companyNameOrPartner: string): string {
  const slug = (companyNameOrPartner || 'unknown').replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 30);
  const typeLabels: Record<AgreementType, string> = {
    nda: 'NDA',
    msa: 'MSA',
    sow: 'SOW',
    sla: 'SLA',
    osa: 'Ongoing-Support',
    dpa: 'DPA',
    partnership: 'UI-UX-Partnership',
  };
  return `IE-Global-${typeLabels[type]}-${slug}.pdf`;
}
