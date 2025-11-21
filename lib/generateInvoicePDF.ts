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
  // IE Global logo (optimized tiny PNG - 120x120, only 2.4KB)
  const logoDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAAAXNSR0IArs4c6QAAAHhlWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABgAAAAAQAAAGAAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAHigAwAEAAAAAQAAAHgAAAAA1DCNHgAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAWRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD53d3cuaW5rc2NhcGUub3JnPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgqyyWIhAAAHe0lEQVR4Ae2cTYgcRRTHq6p7ZrK7ghjRNcGIx6AXDwpCLiKawx5kEQ8BCUEIeBC8hJw0ICTeRLxKJCI5CIqQixdBTwuCIIKHPWhUQoIGkfhFNtnt6Srfq+6e6fnqrhp6pmbWf2U33V313quq36tXXV0zvUIggQAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgMDiEZChmvToS5dfjeLOCaN3W0ZQMyT/cmsU/eTNooPmfMqSRmoTt7tC6jeuXXrx6+F2H37lyhEViw+EVAeMMZG1IUmRkslt9M5tfZQvZEL1SqNEbCsvtcGwMLeDm0L52TXbo3ObJ7pdGZ366+1j11h0URN1LExSyhyVUfSM0fIq8duzraATbVFmYK3juYCI0s9BGbcfSpOd9bEtNtEasT9OZbfIzM1Cxg6Q4oIKbLIH8r5SR8l4Qj7+MXNcUU7uLGRZgc75HyfN//G1FElHxtkI4rwFTcEcTB7TOtlJpYqf/unjEzfq+Dxy6rOXCfFlYbRlPCKvNAVqRP5K37v+/gsXRsqHMtbPfrEqE0OONds33z3+/FCx2yUFv5tgOKmgI5AjNGrvaQoHOq3+lUqSY/MIm8CLp07Ns2mNLS5vpX/nA4UQOMiPlZnQjkXKDupgBqHTqNprBS2ayyv922FBN1MsqW+vuAuzwpKmYA62c1v5PucMkKbhCcl7vqT6aYG1r1O47k1Rs10NT/ZvHsDuhr0HxBIOBXcajXeOqvaaJKs8WzSODPr0yNbv1YiioqU5+uCYQafc4abs3zrxuvJxPZhGZ5ydBc0L7GBfKk17o2l7vv2ZvXy452AaWs3fA9lhHmN2//vXh0bTo43p8u+Ku+HKVXe7fgofV1O+nTmuaD/keQz3GXS34QiaZkaYRmcGJGZmMqyDPbvFO1VplQ5HuGuPDtMtonJGqKpoecpccTTfIxu9viFMW5v8wQ+SM4GwtHz8Wzwm1TwOj/8kYgIPrn+fR3G4CKa5lO9/dyawH82u8SwreDsrYPdHOziTnLA99HaIQ8gr1y4dmgnQRTPqSqPxdntNpUXt5N+qRZbfoum3zKrDmCmqX8ZjMAc7r3ZLVCsfaegx2DvRV3Low2hvtWVSCOdgpuQ7RdfJe/nq0Ax20hbP9WFX0Y3z8PLwdDtfjbd5tgYDRjBV7eMP+5hECo0OSZ8GzNYRs7IezsFUs/3WpMdWdC0E6y/fLvnK17ZioQTC9s4rgKiptfIk4NOjWnsL5aupGuODY6oKmlSyEU+blZMS71X7Jc8B4Wd8IaQDO9jbI41Cyx67wrah0Q6NMRbQwVS1B1u7wVErXyswiMBTfFB5Oa7COXiqmms8UlM86hJS8NYZtbLIOVNhbqpD2T3V0Rq3tNIZ/M13KboRvVDmkH5968kdEuPdzardTwdLiy3S6FOlT1ftXnSlw8ZZI4XJayx67DIpvVH29PqZL0/3tO0QVpkXrW5mgAZXm15ZXKP78JGD57b68lxBuY7ShxepLePxQAK90IiyF9J6OnmBPeS2Wqsi3f3n250zT3zXa9ecToI5eKr+1Q0Io7v0BuKmiOJNOzuwPIUoh6l9I5W3Ou01xzrld3fpzQZ1r2p1LhbbpvYDi5IcSxY6Ks/nthv+Lldu3+ZzprXN8oPnsrMqVLJznnL/Zw5mYM47wlG9pIpaJt27aEzy4cCWV4uq6aWW5a+lOUAvOH5K4feLTu6+nhXn431AnktIpxQKA/cAK1sqZPHeZWbIRJFIo/Q6F8079Zoy74rp3dwpquQB0ZsLR/Wl/Yrkz7+/89zIC+Ijwp+Y6P7vtyiExZ+3zh+rlx8xsBwZ01ButGdGte+6GDTS0Nv4LpKOMts8ITRp0LHeOYuFi2Ba4YiI7l462Xj49JU/sn7ni5IyBNvCWGhjnhIm25ooFw+ckzVj1GMPnP1qo59PNod7SVk62erQLHKAFmYP3vfm1kYmUxIcmCiydvWX27lcSdzWR1Nxkbr5SRzHokv34DS9/cPua49fLcrndRxu4rzqpZlWKtW+Rwnd/Yhe7rYLoeGFUbHwyY4ccBRxKh4fdqtUuJcq2V45KVV0koOzv2DiOz1lsD5r09G+bKzpT34oedBErc+LsmE5a4OpkE62yMrOM9tckC22huuK8rr4T0iozpoQ/+5cIOFzrDHPFM7BWl9Ku3tbIr1D8LMIKXdcl6LB5tO1iWLRVuk3ZbniPOmIGyqRmya9SyuaIpePme3+V4TyKOsHG8nQsiknkcmxTv44VJiy8n1dLs1UInr2LoT4yLr9a2slpR7K7nY/F2cgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgAAIgsKwE/gMqvFfmg4Gp6AAAAABJRU5ErkJggg==';
  
  try {
    const logoWidth = 40;
    const logoHeight = 14;
    doc.addImage(logoDataUrl, 'PNG', pageWidth - marginRight - logoWidth, marginTop - 2, logoWidth, logoHeight);
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
