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
  // IE Global logo (JPEG format for better compatibility with jsPDF)
  const logoDataUrl = 'data:image/jpeg;base64,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rS6nLvLkOoEEt57DGVqswZeXukojXB6VYH8leFi//be4cB+S3M2+UgmQGRY7sis9bJ4ppWXVGMDPTGLSmEtMJwZnaCqUw20im1fHkZlN5cdZNF5YIriJbFDquoqEnZ70p5vZjQonG3enso5tdnRWTnUU/lRWDy8UBK3OgYdaqg/r9qrVquyTimXBkKdUmzKFcErOJFX2Sy6Sp7ajq/oqni5rsj64seYW52dA2+sFtjMI5kAOXt78Jv9B+/+Id85U43foiGZ/xmIUo29a7OdixeCly9SaV49l//zvHnH5YUFIxZwburM9V3355X7nnTT8w9NbT3Osz9RLe3nB9be+u4H98yVqU0hhAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQgAAEIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQgAAEIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQgAAEIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQgAAEIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQgAAEIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQgAAEIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQgAAEIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQgAAEIQAACEIAABCAAAQhAAAIQAACEIAABCAAAQhAAAIQuK8J/B/1owgfZwQzXAAAAABJRU5ErkJggg==';
  
  try {
    const logoWidth = 40;
    const logoHeight = 14;
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
