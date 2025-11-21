import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type InvoiceData = {
  invoiceNumber: string;
  customerNumber?: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientContact: string;
  clientAddress: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  clientKvK?: string;
  clientVAT?: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  description?: string;
  items?: Array<{
    description: string;
    quantity?: number;
    rate?: number;
    amount: number;
  }>;
};

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF();
  
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const lineHeight = 5;

  const navyBlue = [11, 25, 48];
  const signalRed = [230, 57, 70];
  const lightGray = [245, 245, 245];
  const darkGray = [100, 100, 100];

  // ---------- HEADER ----------
  // Inline IE Global invoice logo (ensures availability on production builds)
  const logoDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAAAXNSR0IArs4c6QAAAHhlWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABgAAAAAQAAAGAAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAZCgAwAEAAAAAQAAAZAAAAAAx+O3PAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAWRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD53d3cuaW5rc2NhcGUub3JnPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgqyyWIhAAAiy0lEQVR4Ae3dT6h8S34Q8O6+9715vwQ0YUZNnIgDEpAE3GTALAJusgpKEDdZhOBGA/5Fg6uEkL27oIsJAUHIKhqEQEAICGIEF5OFrgwmLpLMkKCGGcd57/fndltV55zqOn/63r7953Sdez/Ne7er6tSf7/lUn6ruvv3ru1q5ESBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACB+QT+P+HYJvHcaeqVAAAAAElFTkSuQmCC';
  try {
    const logoWidth = 40;
    const logoHeight = 14;
    doc.addImage(logoDataUrl, 'PNG', pageWidth - marginRight - logoWidth, marginTop - 2, logoWidth, logoHeight);
  } catch (error) {
    console.error('[generateInvoicePDF] Failed to render logo', error);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('IE', pageWidth - marginRight - 28, marginTop + 12);
    doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
    doc.text('Global', pageWidth - marginRight - 18, marginTop + 12);
  }

  // Bill To block
  let currentY = marginTop + 20;
  doc.setFontSize(9);
  doc.text('Bill To:', marginLeft, currentY);
  currentY += lineHeight;

  const billLines = [
    data.clientName,
    `Attn: ${data.clientContact}`,
    data.clientAddress.street,
    [data.clientAddress.postalCode, data.clientAddress.city].filter(Boolean).join(' ').trim(),
    data.clientAddress.country,
  ].filter((line): line is string => Boolean(line && line.trim()));

  billLines.forEach(line => {
    doc.setFont('helvetica', 'normal');
    doc.text(line, marginLeft, currentY);
    currentY += lineHeight;
  });
  const billBottom = currentY;

  // ---------- INVOICE TITLE & METADATA ----------
  currentY = billBottom + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('INVOICE', marginLeft, currentY);
  currentY += lineHeight + 2;

  const issueDateFormatted = new Date(data.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const dueDateFormatted = new Date(data.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const metaLines: Array<[string, string]> = [
    ['Invoice Number', data.invoiceNumber],
    ['Issue Date', issueDateFormatted],
    ['Due Date', dueDateFormatted],
  ];
  
  // Customer Ref. and VAT on same line if both exist
  if (data.customerNumber && data.clientVAT) {
    metaLines.push(['Customer Ref.', `${data.customerNumber}; VAT: ${data.clientVAT}`]);
  } else if (data.customerNumber) {
    metaLines.push(['Customer Ref.', data.customerNumber]);
  } else if (data.clientVAT) {
    metaLines.push(['VAT', data.clientVAT]);
  }

  const labelX = marginLeft;
  const valueX = marginLeft + 40;
  const preparedX = pageWidth - marginRight - 55;
  
  // Start "Prepared By" slightly above the first metadata line
  let preparedY = currentY - lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  // Render metadata lines and "Prepared By" side by side
  metaLines.forEach(([label, value], index) => {
    // Left side: Invoice metadata
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, valueX, currentY);
    
    // Right side: Prepared By (only on first line)
    if (index === 0) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Prepared By:', preparedX, preparedY);
      preparedY += lineHeight;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Cassian Drefke', preparedX, preparedY);
      preparedY += lineHeight;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Managing Director', preparedX, preparedY);
      preparedY += lineHeight;
      doc.text('+31 6 27 20 71 08', preparedX, preparedY);
      preparedY += lineHeight;
      doc.text('cdrefke@ie-global.net', preparedX, preparedY);
    }
    
    currentY += lineHeight;
  });

  // ---------- TABLE ----------
  const tableStartY = Math.max(currentY + 6, preparedY + 6);
  const tableData = (data.items && data.items.length > 0
    ? data.items
    : [{ description: data.description || 'Professional Services', quantity: 1, rate: data.subtotal, amount: data.subtotal }]
  ).map(item => [
    item.description || '',
    (item.quantity ?? 1).toString(),
    `€${(item.rate ?? item.amount).toFixed(2)}`,
    `€${item.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: navyBlue as any,
      textColor: [255, 255, 255] as any,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 6, right: 4, bottom: 6, left: 4 },
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      fontSize: 9,
      cellPadding: { top: 6, right: 4, bottom: 6, left: 4 },
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      lineColor: [215, 215, 215],
      lineWidth: 0.2,
    },
    margin: { left: marginLeft, right: marginRight },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;
  const totalsLabelX = pageWidth - marginRight - 60;
  const totalsValueX = pageWidth - marginRight;

  const totals = [
    ['Subtotal (excl. VAT)', `€${data.subtotal.toFixed(2)}`],
    [`VAT (${data.vatRate}%)`, `€${data.vatAmount.toFixed(2)}`],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  totals.forEach(([label, value]) => {
    doc.text(label, totalsLabelX, currentY, { align: 'right' });
    doc.text(value, totalsValueX, currentY, { align: 'right' });
    currentY += lineHeight + 1;
  });

  doc.setDrawColor(signalRed[0], signalRed[1], signalRed[2]);
  doc.setLineWidth(0.5);
  doc.line(totalsLabelX - 5, currentY, totalsValueX, currentY);
  currentY += lineHeight + 1;

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DUE:', totalsLabelX, currentY, { align: 'right' });
  doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
  doc.setFontSize(12);
  doc.text(`€${data.totalAmount.toFixed(2)}`, totalsValueX, currentY, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  currentY += 12;

  // ---------- PAYMENT TERMS ----------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Payment Terms:', marginLeft, currentY);
  currentY += lineHeight + 1;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const paymentText = `Payment is due by ${dueDateFormatted} (within 15 business days from the date of receipt of this invoice), unless otherwise agreed in writing. Please include invoice number ${data.invoiceNumber} as payment reference. Payment details, including IBAN (NL50 BUNQ 2152 5367 38), can be found in the footer of this invoice.`;
  doc.text(doc.splitTextToSize(paymentText, contentWidth), marginLeft, currentY);

  // ---------- FOOTER ----------
  const footerY = 255;
  const footerHeight = 42;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(0, footerY, pageWidth, footerHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const footerStartY = footerY + 8;
  const columns = [
    {
      title: 'IE GLOBAL',
      lines: ['ODER 20 Box 66193', '2491DC Den Haag', 'Netherlands'],
      x: marginLeft,
    },
    {
      title: 'LEGAL',
      lines: ['KvK: 97185515', 'BTW: NL737599054B02'],
      x: 65,
    },
    {
      title: 'Contact Information',
      lines: ['Cassian Drefke', '+31 6 27 20 71 08', 'cdrefke@ie-global.net'],
      x: 115,
    },
    {
      title: 'Payment Details',
      lines: ['Bank: BUNQ', 'Name: IE Global', 'IBAN: NL50 BUNQ', '      2152 5367 38', 'BIC: BUNQNL2A'],
      x: 165,
    },
  ];

  columns.forEach(col => {
    doc.setFont('helvetica', 'bold');
    doc.text(col.title, col.x, footerStartY);
    doc.setFont('helvetica', 'normal');
    let footerLineY = footerStartY + lineHeight;
    col.lines.forEach(line => {
      doc.text(line, col.x, footerLineY);
      footerLineY += lineHeight;
    });
  });

  return doc.output('blob');
}
