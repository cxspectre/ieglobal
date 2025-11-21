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
  // IE Global logo (200x200 JPEG - 3.7KB, optimized for jsPDF compatibility)
  const logoDataUrl = 'data:image/jpeg;base64,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';
  
  try {
    const logoWidth = 40;
    const logoHeight = 40;
    doc.addImage(logoDataUrl, 'JPEG', pageWidth - marginRight - logoWidth, marginTop - 2, logoWidth, logoHeight);
  } catch (error) {
    console.error('[generateInvoicePDF] Failed to render logo', error);
    // Fallback to text-based logo
    const logoX = pageWidth - marginRight - 30;
    const logoY = marginTop + 8;
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('I', logoX, logoY);
    doc.setTextColor(62, 149, 210);
    doc.text('E', logoX + 6, logoY);
    doc.setFontSize(8);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('Global', logoX, logoY + 4);
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
