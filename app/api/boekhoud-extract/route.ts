import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

type ExtractResult = {
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  totalInclOriginal?: number;
  currencyOriginal?: string;
  totalInclEur?: number;
  fxRate?: number;
};

function findFirstMatch(text: string, regex: RegExp): string | undefined {
  const match = text.match(regex);
  return match?.[1] || match?.[0];
}

function normalizeNumber(raw: string): number | undefined {
  if (!raw) return undefined;
  // Remove currency symbols and spaces
  let cleaned = raw.replace(/[^\d.,-]/g, '');
  // If both , and . exist, assume . is decimal and , is thousands
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/,/g, '');
  } else if (cleaned.includes(',') && !cleaned.includes('.')) {
    // Only comma, assume comma is decimal separator
    cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
  }
  const num = Number.parseFloat(cleaned);
  return Number.isNaN(num) ? undefined : num;
}

function extractFromText(text: string): ExtractResult {
  const result: ExtractResult = {};

  // Invoice number
  const invoiceNumberRegex =
    /(Invoice(?:\s+number|\s+no\.?|#)?|Factuur(?:nummer)?|Factuurnr\.?)[:\s]*([A-Z0-9\-\/]+)/i;
  const invoiceMatch = text.match(invoiceNumberRegex);
  if (invoiceMatch?.[2]) {
    result.invoiceNumber = invoiceMatch[2].trim();
  }

  // Dates (very simple heuristic)
  const dateRegex =
    /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b/g;
  const allDates: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = dateRegex.exec(text)) !== null) {
    allDates.push(m[1]);
  }
  if (allDates.length > 0) {
    result.invoiceDate = allDates[0];
  }
  if (allDates.length > 1) {
    result.dueDate = allDates[1];
  }

  // Totals & currency
  const totalLineRegex = /(Total(?:\s+due)?|Amount\s+due|Totaal)[^\n]*\n?([^\n]+)/i;
  const totalLineMatch = text.match(totalLineRegex);
  let currency: string | undefined;
  let amountRaw: string | undefined;

  if (totalLineMatch) {
    const line = totalLineMatch[0];
    if (line.includes('€') || /EUR/i.test(line)) {
      currency = 'EUR';
    } else if (line.includes('$') || /USD/i.test(line)) {
      currency = 'USD';
    }
    const amountRegex = /([€$]?\s?\d[\d.,]*)/;
    const amtMatch = line.match(amountRegex);
    if (amtMatch?.[1]) {
      amountRaw = amtMatch[1];
    }
  }

  const amount = amountRaw ? normalizeNumber(amountRaw) : undefined;

  if (amount !== undefined) {
    result.totalInclOriginal = amount;
  }
  if (currency) {
    result.currencyOriginal = currency;
  }

  return result;
}

async function convertToEur(
  amount: number,
  currency: string,
): Promise<{ totalInclEur?: number; fxRate?: number }> {
  if (!amount || currency === 'EUR') {
    return { totalInclEur: amount, fxRate: 1 };
  }

  try {
    const res = await fetch(
      `https://api.exchangerate.host/convert?from=${encodeURIComponent(
        currency,
      )}&to=EUR&amount=${encodeURIComponent(amount.toString())}`,
    );
    if (!res.ok) {
      return {};
    }
    const json = (await res.json()) as { result?: number };
    if (!json.result || !Number.isFinite(json.result)) {
      return {};
    }
    const eurAmount = json.result;
    const rate = eurAmount / amount;
    return { totalInclEur: eurAmount, fxRate: rate };
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fileUrl } = (await req.json()) as { fileUrl?: string };
    if (!fileUrl) {
      return new Response(
        JSON.stringify({ error: 'fileUrl is required' }),
        { status: 400 },
      );
    }

    const pdfRes = await fetch(fileUrl);
    if (!pdfRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch PDF' }),
        { status: 400 },
      );
    }
    const arrayBuf = await pdfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    await parser.destroy();
    const base = extractFromText(textResult.text);

    if (base.totalInclOriginal && base.currencyOriginal) {
      const fx = await convertToEur(
        base.totalInclOriginal,
        base.currencyOriginal,
      );
      base.totalInclEur = fx.totalInclEur;
      base.fxRate = fx.fxRate;
    } else if (base.totalInclOriginal) {
      base.totalInclEur = base.totalInclOriginal;
      base.fxRate = 1;
    }

    return new Response(JSON.stringify(base), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Boekhoud extract error:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Extraction failed' }),
      { status: 500 },
    );
  }
}

