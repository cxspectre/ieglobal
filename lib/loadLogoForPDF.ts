import { readFileSync, existsSync } from 'fs';
import path from 'path';

/**
 * Load logo as base64 for jsPDF. Uses logo-invoice-pdf.png from public folder.
 * Returns null if file not found or read fails (caller should use text fallback).
 */
export function loadLogoDataUrl(): string | null {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-invoice-pdf.png');
    if (!existsSync(logoPath)) return null;
    const buffer = readFileSync(logoPath);
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
}
