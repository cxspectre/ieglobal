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

  const marginLeft = 24;
  const marginRight = 24;
  const marginTop = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const lineHeight = 5.5;

  const navyBlue = [11, 25, 48];
  const signalRed = [230, 57, 70];
  const lightGray = [248, 250, 252];
  const darkGray = [71, 85, 105];
  const borderGray = [226, 232, 240];

  // ---------- LOGO (right-aligned at top; on white background) ----------
  let logoDataUrl: string | null = null;
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  try {
    const res = await fetch(`${base}/logo-invoice-pdf.png`);
    if (res.ok) {
      const blob = await res.blob();
      logoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch { /* ignore */ }

  const logoW = 38;
  const logoH = 40;
  const logoRightX = pageWidth - 15;
  const logoLeftX = logoRightX - logoW;
  const logoBottomY = 46;
  const logoTop = logoBottomY - logoH;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', logoLeftX, logoTop, logoW, logoH);
    } catch { /* fallback to text */ }
  }
  if (!logoDataUrl) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text('IE ', logoRightX - 18, logoTop + 14);
    doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
    doc.text('Global', logoRightX, logoTop + 18, { align: 'right' });
  }

  // ---------- TWO-COLUMN LAYOUT (fixed positions) ----------
  const colSplitX = marginLeft + contentWidth / 2;
  const metaLabelX = colSplitX + 8;
  const metaValueX = pageWidth - marginRight;

  let currentY = logoBottomY + 20;

  // Left column: Bill To (fixed left half)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('BILL TO', marginLeft, currentY);
  currentY += lineHeight + 1;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text(data.clientName, marginLeft, currentY);
  currentY += lineHeight;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const billLines = [
    `Attn: ${data.clientContact}`,
    data.clientAddress.street,
    [data.clientAddress.postalCode, data.clientAddress.city].filter(Boolean).join(' ').trim(),
    data.clientAddress.country,
  ].filter((line): line is string => Boolean(line && line.trim()));

  billLines.forEach((line) => {
    doc.text(line, marginLeft, currentY);
    currentY += lineHeight;
  });
  const billBottom = currentY;

  // Right column: Invoice metadata (fixed right half)
  const issueDateFormatted = new Date(data.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const dueDateFormatted = new Date(data.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  let metaY = logoBottomY + 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('INVOICE DETAILS', metaValueX, metaY, { align: 'right' });
  metaY += lineHeight + 1;

  const metaRows: [string, string][] = [
    ['Invoice number', data.invoiceNumber],
    ['Issue date', issueDateFormatted],
    ['Due date', dueDateFormatted],
  ];
  if (data.customerNumber) metaRows.push(['Customer ref.', data.customerNumber]);
  if (data.clientVAT) metaRows.push(['VAT number', data.clientVAT]);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  metaRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`${label}:`, metaLabelX, metaY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(value, metaValueX, metaY, { align: 'right' });
    metaY += lineHeight;
  });

  metaY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Prepared by', metaValueX, metaY, { align: 'right' });
  metaY += lineHeight - 1;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Cassian Drefke', metaValueX, metaY, { align: 'right' });
  metaY += lineHeight - 1;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Managing Director · cdrefke@ie-global.net', metaValueX, metaY, { align: 'right' });

  const tableStartY = Math.max(billBottom, metaY) + 12;

  const tableData = (
    data.items && data.items.length > 0
      ? data.items
      : [{ description: data.description || 'Professional Services', quantity: 1, rate: data.subtotal, amount: data.subtotal }]
  ).map((item) => [
    item.description || '',
    (item.quantity ?? 1).toString(),
    `€ ${(item.rate ?? item.amount).toFixed(2)}`,
    `€ ${item.amount.toFixed(2)}`,
  ]);

  const tableColWidths = [82, 22, 30, 28];
  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Qty', 'Price', 'Amount']],
    body: tableData,
    theme: 'plain',
    tableWidth: contentWidth,
    margin: { left: marginLeft, right: marginRight },
    headStyles: {
      fillColor: [248, 250, 252] as any,
      textColor: navyBlue as any,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 4, right: 5, bottom: 4, left: 6 },
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      fontSize: 8,
      cellPadding: { top: 4, right: 5, bottom: 4, left: 6 },
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [252, 252, 253] as any,
    },
    columnStyles: {
      0: { cellWidth: tableColWidths[0] },
      1: { cellWidth: tableColWidths[1], halign: 'center' },
      2: { cellWidth: tableColWidths[2], halign: 'right' },
      3: { cellWidth: tableColWidths[3], halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      lineColor: borderGray as any,
      lineWidth: 0.2,
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;
  const totalsValueX = pageWidth - marginRight;
  const totalsLabelX = totalsValueX - 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Subtotal (excl. VAT)', totalsLabelX, currentY, { align: 'right' });
  doc.text(`€ ${data.subtotal.toFixed(2)}`, totalsValueX, currentY, { align: 'right' });
  currentY += lineHeight + 2;
  doc.text(`VAT (${data.vatRate}%)`, totalsLabelX, currentY, { align: 'right' });
  doc.text(`€ ${data.vatAmount.toFixed(2)}`, totalsValueX, currentY, { align: 'right' });
  currentY += lineHeight + 4;

  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(totalsLabelX - 5, currentY, totalsValueX, currentY);
  currentY += lineHeight + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Total due', totalsLabelX, currentY, { align: 'right' });
  doc.setFontSize(11);
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text(`€ ${data.totalAmount.toFixed(2)}`, totalsValueX, currentY, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  currentY += 12;

  // ---------- PAYMENT TERMS ----------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Payment terms', marginLeft, currentY);
  currentY += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const paymentText = `Payment is due by ${dueDateFormatted} (within 15 business days from receipt). Please include invoice number ${data.invoiceNumber} as reference. Bank details are in the footer below.`;
  doc.text(doc.splitTextToSize(paymentText, contentWidth), marginLeft, currentY);

  // ---------- FOOTER ----------
  const footerY = 258;
  const footerHeight = 38;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(0, footerY, pageWidth, footerHeight, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.2);
  doc.line(0, footerY, pageWidth, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const footerStartY = footerY + 8;
  const footerColWidth = contentWidth / 4;
  const cols = [
    { title: 'IE GLOBAL', lines: ['Oder 20 Box 66193', '2491DC Den Haag', 'Netherlands'], x: marginLeft },
    { title: 'LEGAL', lines: ['KvK: 97185515', 'BTW: NL005254766B14'], x: marginLeft + footerColWidth },
    { title: 'CONTACT', lines: ['Cassian Drefke', '+31 6 27 20 71 08', 'cdrefke@ie-global.net'], x: marginLeft + footerColWidth * 2 },
    { title: 'BANK', lines: ['BUNQ · IE Global', 'IBAN: NL50 BUNQ 2152 5367 38', 'BIC: BUNQNL2A'], x: marginLeft + footerColWidth * 3 },
  ];

  cols.forEach((col) => {
    doc.setFont('helvetica', 'bold');
    doc.text(col.title, col.x, footerStartY);
    doc.setFont('helvetica', 'normal');
    let y = footerStartY + lineHeight - 1;
    col.lines.forEach((line) => {
      doc.text(line, col.x, y);
      y += lineHeight - 0.5;
    });
  });

  return doc.output('blob');
}
