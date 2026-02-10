'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type BoekhoudType = 'sales_invoice' | 'purchase_invoice' | 'receipt' | 'bank_statement';

type BoekhoudStatus = 'needs_review' | 'approved' | 'rejected';

type BoekhoudDocument = {
  id: string;
  file_url: string;
  file_path: string;
  type: BoekhoudType;
  vendor_name: string | null;
  client_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  service_period_start: string | null;
  service_period_end: string | null;
  total_excl_vat: number | null;
  vat_total: number | null;
  total_incl_vat: number | null;
  currency: string;
  status: BoekhoudStatus;
  booked_date: string | null;
  tags: string[] | null;
  notes: string | null;
  vat_breakdown?: { rate: number; base: number; vat: number }[] | null;
};

type VatSummary = {
  revenueExclVat: number;
  vatCollected: number;
  expensesExclVat: number;
  vatPaid: number;
  netVatDue: number;
};

function getQuarterDates(year: number, quarter: number) {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export default function BoekhoudPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const now = new Date();
  const initialYear = now.getFullYear();
  const initialQuarter = Math.floor(now.getMonth() / 3) + 1;

  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [year, setYear] = useState(initialYear);
  const [quarter, setQuarter] = useState(initialQuarter);
  const [basis, setBasis] = useState<'invoice' | 'booked'>('invoice');
  const [uploadType, setUploadType] = useState<BoekhoudType>('sales_invoice');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const [approvedDocsRaw, setApprovedDocsRaw] = useState<BoekhoudDocument[]>([]);
  const [reviewDocs, setReviewDocs] = useState<BoekhoudDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<BoekhoudDocument | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    type: 'sales_invoice' as BoekhoudType,
    vendor_name: '',
    client_name: '',
    invoice_number: '',
    invoice_date: '',
    due_date: '',
    booked_date: '',
    vat_rate: '21.00',
    total_incl_vat: '',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setAuthChecked(true);
    };

    void checkAuth();
  }, [router, supabase]);

  useEffect(() => {
    if (!authChecked) return;
    void loadDocuments();
  }, [authChecked, year, quarter]);

  const periodRange = useMemo(() => getQuarterDates(year, quarter), [year, quarter]);

  const approvedDocs = useMemo(() => {
    const startDate = new Date(periodRange.start);
    const endDate = new Date(periodRange.end);

    return approvedDocsRaw.filter((doc) => {
      const dateStr =
        basis === 'invoice'
          ? doc.invoice_date
          : doc.booked_date || doc.invoice_date;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= startDate && d <= endDate;
    });
  }, [approvedDocsRaw, basis, periodRange]);

  const periodLabel = useMemo(() => {
    return `Q${quarter} ${year}`;
  }, [quarter, year]);

  const vatSummary: VatSummary = useMemo(() => {
    let revenueExclVat = 0;
    let vatCollected = 0;
    let expensesExclVat = 0;
    let vatPaid = 0;

    approvedDocs.forEach((doc) => {
      const base = Number(doc.total_excl_vat || 0);
      const vat = Number(doc.vat_total || 0);

      if (doc.type === 'sales_invoice') {
        revenueExclVat += base;
        vatCollected += vat;
      } else if (doc.type === 'purchase_invoice' || doc.type === 'receipt') {
        expensesExclVat += base;
        vatPaid += vat;
      }
    });

    const netVatDue = vatCollected - vatPaid;

    return {
      revenueExclVat,
      vatCollected,
      expensesExclVat,
      vatPaid,
      netVatDue,
    };
  }, [approvedDocs]);

  const vatByRate = useMemo(() => {
    const map = new Map<number, { base: number; vat: number }>();

    approvedDocs.forEach((doc) => {
      const breakdown = doc.vat_breakdown;
      if (breakdown && Array.isArray(breakdown)) {
        breakdown.forEach((entry) => {
          const current = map.get(entry.rate) || { base: 0, vat: 0 };
          current.base += entry.base || 0;
          current.vat += entry.vat || 0;
          map.set(entry.rate, current);
        });
      }
    });

    return Array.from(map.entries())
      .map(([rate, value]) => ({
        rate,
        base: Math.round(value.base * 100) / 100,
        vat: Math.round(value.vat * 100) / 100,
      }))
      .sort((a, b) => a.rate - b.rate);
  }, [approvedDocs]);

  const dataHealth = useMemo(() => {
    const missingInvoiceNumber = approvedDocsRaw.filter(
      (doc) => !doc.invoice_number
    ).length;
    const missingDates = approvedDocsRaw.filter(
      (doc) => !doc.invoice_date
    ).length;
    const missingTotals = approvedDocsRaw.filter(
      (doc) => doc.total_incl_vat == null
    ).length;

    return {
      needsReview: reviewDocs.length,
      missingInvoiceNumber,
      missingDates,
      missingTotals,
    };
  }, [approvedDocsRaw, reviewDocs]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const [approvedRes, reviewRes] = await Promise.all([
        (supabase as any)
          .from('boekhoud_documents')
          .select('*')
          .eq('status', 'approved')
          .order('invoice_date', { ascending: true }),
        (supabase as any)
          .from('boekhoud_documents')
          .select('*')
          .eq('status', 'needs_review')
          .order('created_at', { ascending: false }),
      ]);

      if (approvedRes.error) throw approvedRes.error;
      if (reviewRes.error) throw reviewRes.error;

      setApprovedDocsRaw((approvedRes.data || []) as BoekhoudDocument[]);
      setReviewDocs((reviewRes.data || []) as BoekhoudDocument[]);
    } catch (err: any) {
      console.error('Error loading Boekhoud documents:', err);
      setError(err.message || 'Failed to load Boekhoud data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select at least one file.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const filesArray = Array.from(selectedFiles);

      for (const file of filesArray) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `boekhoud/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('client-files')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('client-files')
          .getPublicUrl(path);
        if (!publicUrl) throw new Error('Could not get public URL for uploaded file');

        const { error: insertError } = await (supabase as any)
          .from('boekhoud_documents')
          .insert({
            type: uploadType,
            file_url: publicUrl,
            file_path: path,
            status: 'needs_review',
            created_by: session.user.id,
          });

        if (insertError) throw insertError;
      }

      setSelectedFiles(null);
      await loadDocuments();
      alert('✅ Files uploaded. Fill in details in the review queue, then approve.');
    } catch (err: any) {
      console.error('Error uploading Boekhoud documents:', err);
      setError(err.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const openReview = (doc: BoekhoudDocument) => {
    setSelectedDoc(doc);
    setReviewForm({
      type: doc.type,
      vendor_name: doc.vendor_name || '',
      client_name: doc.client_name || '',
      invoice_number: doc.invoice_number || '',
      invoice_date: doc.invoice_date || '',
      due_date: doc.due_date || '',
      booked_date: doc.booked_date || '',
      vat_rate: '21.00',
      total_incl_vat: doc.total_incl_vat != null ? String(doc.total_incl_vat) : '',
    });
    // Try to auto-extract details from the PDF in the background
    if (doc.file_url) {
      void enrichFromPdf(doc.file_url);
    }
  };

  const saveReview = async (approve: boolean) => {
    if (!selectedDoc) return;

    setSavingReview(true);
    setError(null);

    try {
      const vatRate = parseFloat(reviewForm.vat_rate || '21');
      const totalIncl = parseFloat(reviewForm.total_incl_vat || '0');

      let totalExcl = selectedDoc.total_excl_vat || null;
      let vatAmount = selectedDoc.vat_total || null;

      if (!Number.isNaN(totalIncl) && totalIncl > 0 && !Number.isNaN(vatRate)) {
        const base = totalIncl / (1 + vatRate / 100);
        const vat = totalIncl - base;
        totalExcl = Math.round(base * 100) / 100;
        vatAmount = Math.round(vat * 100) / 100;
      }

      const vatBreakdown =
        totalExcl != null && vatAmount != null
          ? [
              {
                rate: vatRate,
                base: totalExcl,
                vat: vatAmount,
              },
            ]
          : null;

      const { error: updateError } = await (supabase as any)
        .from('boekhoud_documents')
        .update({
          type: reviewForm.type,
          vendor_name: reviewForm.vendor_name || null,
          client_name: reviewForm.client_name || null,
          invoice_number: reviewForm.invoice_number || null,
          invoice_date: reviewForm.invoice_date || null,
          due_date: reviewForm.due_date || null,
          booked_date: reviewForm.booked_date || null,
          total_incl_vat: !Number.isNaN(totalIncl) && totalIncl > 0 ? totalIncl : null,
          total_excl_vat: totalExcl,
          vat_total: vatAmount,
          vat_breakdown: vatBreakdown,
          status: approve ? 'approved' : 'rejected',
        })
        .eq('id', selectedDoc.id);

      if (updateError) throw updateError;

      setSelectedDoc(null);
      await loadDocuments();
    } catch (err: any) {
      console.error('Error updating Boekhoud document:', err);
      setError(err.message || 'Failed to update document');
    } finally {
      setSavingReview(false);
    }
  };

  const exportCsv = () => {
    if (approvedDocs.length === 0) {
      alert('No approved documents in this period.');
      return;
    }

    const headers = [
      'Type',
      'Vendor/Client',
      'Invoice Number',
      'Invoice Date',
      'Due Date',
      'Total excl VAT',
      'VAT amount',
      'Total incl VAT',
      'Currency',
      'VAT rate(s)',
    ];

    const rows = approvedDocs.map((doc) => [
      doc.type,
      doc.type === 'sales_invoice'
        ? doc.client_name || ''
        : doc.vendor_name || '',
      doc.invoice_number || '',
      doc.invoice_date || '',
      doc.due_date || '',
      (doc.total_excl_vat ?? 0).toFixed(2),
      (doc.vat_total ?? 0).toFixed(2),
      (doc.total_incl_vat ?? 0).toFixed(2),
      doc.currency || 'EUR',
      (doc.vat_breakdown || [])
        .map((entry) => `${entry.rate}%`)
        .join(' / '),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boekhoud-${periodLabel.replace(' ', '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const enrichFromPdf = async (fileUrl: string) => {
    try {
      const res = await fetch('/api/boekhoud-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        invoiceNumber?: string;
        invoiceDate?: string;
        dueDate?: string;
        totalInclEur?: number;
        currencyOriginal?: string;
      };

      setReviewForm((prev) => ({
        ...prev,
        invoice_number: prev.invoice_number || data.invoiceNumber || '',
        invoice_date: prev.invoice_date || data.invoiceDate || '',
        due_date: prev.due_date || data.dueDate || '',
        total_incl_vat:
          prev.total_incl_vat ||
          (data.totalInclEur != null ? data.totalInclEur.toFixed(2) : ''),
      }));
    } catch {
      // Silent fail – user can still fill in manually
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-700">Loading Boekhoud data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pt-12 lg:pt-16 pb-16 px-4 lg:px-6">
      {/* Hero header */}
      <div className="mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 lg:p-8 shadow-md border border-white/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/60 font-semibold mb-1">
                Admin · Finance
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold mb-1">Boekhoud (VAT overview)</h1>
              <p className="text-sm lg:text-base text-white/80 max-w-xl">
                Turn a pile of invoices, receipts and bank PDFs into a clean quarterly VAT overview
                and export pack for your accountant.
              </p>
            </div>
            <div className="flex items-end gap-4">
              <div className="px-4 py-3 rounded-xl bg-black/10 border border-white/10">
                <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-1">
                  Current period
                </p>
                <p className="text-lg font-semibold">{periodLabel}</p>
                <p className="text-xs text-white/60 mt-1">
                  Basis:&nbsp;
                  <span className="font-semibold">
                    {basis === 'invoice' ? 'Invoice date' : 'Booked on'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Period filters + summary */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">VAT period</p>
          <div className="flex gap-3 items-center mb-2">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
            >
              {[year, year - 1, year - 2].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={quarter}
              onChange={(e) => setQuarter(Number(e.target.value))}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
            >
              <option value={1}>Q1 (Jan–Mar)</option>
              <option value={2}>Q2 (Apr–Jun)</option>
              <option value={3}>Q3 (Jul–Sep)</option>
              <option value={4}>Q4 (Oct–Dec)</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              Basis
            </span>
            <button
              type="button"
              onClick={() => setBasis('invoice')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                basis === 'invoice'
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Invoice date
            </button>
            <button
              type="button"
              onClick={() => setBasis('booked')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                basis === 'booked'
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Booked on
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Current view: <span className="font-semibold text-navy-900">{periodLabel}</span>
          </p>
          <button
            onClick={exportCsv}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-navy-900 text-sm font-semibold text-navy-900 hover:bg-navy-900 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 16V4m0 12l-3-3m3 3l3-3M4 20h16"
              />
            </svg>
            Export CSV
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Revenue (excl. VAT)</p>
          <p className="text-2xl font-bold text-emerald-700">
            €{vatSummary.revenueExclVat.toFixed(2)}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            VAT collected: <span className="font-semibold text-navy-900">€{vatSummary.vatCollected.toFixed(2)}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Expenses (excl. VAT)</p>
          <p className="text-2xl font-bold text-red-700">
            €{vatSummary.expensesExclVat.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            VAT paid: <span className="font-semibold text-navy-900">€{vatSummary.vatPaid.toFixed(2)}</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Net VAT due:{' '}
            <span
              className={`font-semibold ${
                vatSummary.netVatDue >= 0 ? 'text-navy-900' : 'text-emerald-700'
              }`}
            >
              €{vatSummary.netVatDue.toFixed(2)}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Data health</p>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>
              <span className="font-semibold text-amber-700">
                {dataHealth.needsReview} in review
              </span>{' '}
              waiting to be approved
            </li>
            <li>
              <span className="font-semibold">
                {dataHealth.missingInvoiceNumber}
              </span>{' '}
              approved docs missing invoice number
            </li>
            <li>
              <span className="font-semibold">
                {dataHealth.missingDates}
              </span>{' '}
              approved docs missing invoice date
            </li>
            <li>
              <span className="font-semibold">
                {dataHealth.missingTotals}
              </span>{' '}
              approved docs missing total incl. VAT
            </li>
          </ul>
        </div>
      </div>

      {/* VAT rate breakdown */}
      {vatByRate.length > 0 && (
        <div className="mb-8 bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">VAT by rate</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vatByRate.map((entry) => (
              <div key={entry.rate} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-1">
                  {entry.rate}% rate
                </p>
                <p className="text-xs text-slate-500">Base</p>
                <p className="text-sm font-semibold text-navy-900">
                  €{entry.base.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-slate-500">VAT</p>
                <p className="text-sm font-semibold text-navy-900">
                  €{entry.vat.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-bold text-navy-900 mb-1">Upload & ingest</h2>
          <p className="text-sm text-slate-600 mb-3">
            Drop in PDFs or images for sales invoices, purchase invoices, receipts and bank
            statements.
          </p>
          <ul className="text-xs text-slate-500 mb-4 space-y-1">
            <li>• Files go to the review queue as “needs review”</li>
            <li>• Only approved docs show up in VAT totals</li>
          </ul>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
            Upload documents
          </button>
        </div>

        {/* Review queue summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-navy-900">Review queue</h2>
              <p className="text-xs text-slate-600">
                Sanity-check extraction before it hits your VAT view.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              {reviewDocs.length} to review
            </span>
          </div>
          <ul className="text-xs text-slate-500 mb-4 space-y-1">
            <li>• Approve to include in VAT totals</li>
            <li>• Reject to keep noisy docs out of your books</li>
          </ul>
          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7h18M3 12h18M3 17h18"
              />
            </svg>
            Open review queue
          </button>
        </div>

        {/* Approved docs summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-navy-900">Approved documents</h2>
              <p className="text-xs text-slate-600">
                These rows power your VAT view for {periodLabel}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {approvedDocs.length} approved
              </span>
              {approvedDocs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTransactionsModal(true)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Open transactions
                </button>
              )}
            </div>
          </div>

          {approvedDocs.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-lg">
              No approved documents in this VAT period yet.
            </div>
          ) : (
            <>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Party</th>
                        <th className="px-3 py-2 text-left">Invoice #</th>
                        <th className="px-3 py-2 text-right">Incl. VAT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedDocs.slice(0, 6).map((doc) => (
                        <tr key={doc.id} className="border-b border-slate-100 last:border-b-0">
                          <td className="px-3 py-2 whitespace-nowrap">
                            {doc.invoice_date || '—'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap capitalize">
                            {doc.type.replace('_', ' ')}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {doc.type === 'sales_invoice'
                              ? doc.client_name || '—'
                              : doc.vendor_name || '—'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {doc.invoice_number || '—'}
                          </td>
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            €{(doc.total_incl_vat ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {approvedDocs.length > 6 && (
                <p className="mt-2 text-xs text-slate-500">
                  Showing first 6 of {approvedDocs.length} documents. Use{' '}
                  <button
                    type="button"
                    onClick={() => setShowTransactionsModal(true)}
                    className="underline font-semibold text-navy-900"
                  >
                    Open transactions
                  </button>{' '}
                  for the full list.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Review drawer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
          <div className="w-full max-w-md h-full bg-white shadow-xl border-l border-slate-200 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Review document</p>
                <p className="text-sm font-semibold text-navy-900 truncate">
                  {selectedDoc.invoice_number || selectedDoc.file_path}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <a
                href={selectedDoc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Open PDF
              </a>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type
                </label>
                <select
                  value={reviewForm.type}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      type: e.target.value as BoekhoudType,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
                >
                  <option value="sales_invoice">Sales invoice (outgoing)</option>
                  <option value="purchase_invoice">Purchase invoice (expense)</option>
                  <option value="receipt">Receipt</option>
                  <option value="bank_statement">Bank statement</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client / Supplier
                  </label>
                  <input
                    type="text"
                    value={
                      reviewForm.type === 'sales_invoice'
                        ? reviewForm.client_name
                        : reviewForm.vendor_name
                    }
                    onChange={(e) =>
                      setReviewForm((prev) =>
                        reviewForm.type === 'sales_invoice'
                          ? { ...prev, client_name: e.target.value }
                          : { ...prev, vendor_name: e.target.value }
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
                    placeholder={
                      reviewForm.type === 'sales_invoice' ? 'Client name' : 'Supplier name'
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice number
                  </label>
                  <input
                    type="text"
                    value={reviewForm.invoice_number}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        invoice_number: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
                    placeholder="e.g., INV-2026-02-123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice date
                  </label>
                  <input
                    type="date"
                    value={reviewForm.invoice_date}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        invoice_date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={reviewForm.due_date}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        due_date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    VAT rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={reviewForm.vat_rate}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        vat_rate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total incl. VAT (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={reviewForm.total_incl_vat}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        total_incl_vat: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Booked on (optional)
                </label>
                <input
                  type="date"
                  value={reviewForm.booked_date}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      booked_date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => saveReview(false)}
                disabled={savingReview}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Reject
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveReview(true)}
                  disabled={savingReview}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-signal-red text-white hover:bg-signal-red/90 disabled:opacity-50"
                >
                  {savingReview ? 'Saving…' : 'Approve & include in VAT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Upload documents</p>
                <h2 className="text-lg font-bold text-navy-900">
                  Ingest invoices, receipts & statements
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles(null);
                }}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-1">
                  Document type
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as BoekhoudType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none"
                >
                  <option value="sales_invoice">Sales invoice (outgoing)</option>
                  <option value="purchase_invoice">Purchase invoice (expenses)</option>
                  <option value="receipt">Receipt (small expense)</option>
                  <option value="bank_statement">Bank statement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-1">
                  Files <span className="text-signal-red">*</span>
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                    const files = e.dataTransfer.files;
                    if (files?.length) setSelectedFiles(files);
                  }}
                  className={`relative w-full min-h-[140px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                    isDragging
                      ? 'border-signal-red bg-signal-red/5'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    id="boekhoud-file-input"
                    accept=".pdf,image/*"
                    multiple
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="sr-only"
                  />
                  {selectedFiles && selectedFiles.length > 0 ? (
                    <div className="text-center p-2">
                      <p className="text-sm font-semibold text-navy-900">
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {Array.from(selectedFiles).map((f) => f.name).join(', ')}
                      </p>
                      <label
                        htmlFor="boekhoud-file-input"
                        className="mt-2 inline-block text-xs font-semibold text-signal-red hover:underline cursor-pointer"
                      >
                        Change files
                      </label>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-10 h-10 text-slate-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm font-medium text-slate-700">
                        {isDragging ? 'Drop files here' : 'Drag & drop PDFs or images here'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">or</p>
                      <label
                        htmlFor="boekhoud-file-input"
                        className="mt-1 text-xs font-semibold text-signal-red hover:underline cursor-pointer"
                      >
                        browse to select
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                      Upload to review queue
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review queue modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Review queue</p>
                <h2 className="text-lg font-bold text-navy-900">
                  {reviewDocs.length} document{reviewDocs.length === 1 ? '' : 's'} to review
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Click a row to open the review drawer, fix fields, and approve or reject.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {reviewDocs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-500">
                  No documents waiting for review.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {reviewDocs.map((doc) => (
                    <li key={doc.id}>
                      <button
                        type="button"
                        onClick={() => {
                          openReview(doc);
                          setShowReviewModal(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-navy-900 truncate">
                            {doc.invoice_number || 'Missing invoice number'}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {doc.type === 'sales_invoice'
                              ? doc.client_name || 'Client not set'
                              : doc.vendor_name || 'Vendor not set'}
                          </p>
                        </div>
                        <div className="text-right text-xs text-slate-500 whitespace-nowrap">
                          <p>{doc.invoice_date || 'Date ?'}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {(doc.total_incl_vat ?? 0) > 0
                              ? `€${(doc.total_incl_vat ?? 0).toFixed(2)} incl. VAT`
                              : 'Amount ?'}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transactions modal */}
      {showTransactionsModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Transactions · {periodLabel}
                </p>
                <h2 className="text-lg font-bold text-navy-900">
                  All approved Boekhoud documents
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowTransactionsModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {approvedDocs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-500">
                  No approved documents for this period.
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Party</th>
                      <th className="px-3 py-2 text-left">Invoice #</th>
                      <th className="px-3 py-2 text-right">Excl. VAT</th>
                      <th className="px-3 py-2 text-right">VAT</th>
                      <th className="px-3 py-2 text-right">Incl. VAT</th>
                      <th className="px-3 py-2 text-left">VAT rate(s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedDocs.map((doc) => (
                      <tr key={doc.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-3 py-2 whitespace-nowrap">
                          {basis === 'booked'
                            ? doc.booked_date || doc.invoice_date || '—'
                            : doc.invoice_date || '—'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap capitalize">
                          {doc.type.replace('_', ' ')}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {doc.type === 'sales_invoice'
                            ? doc.client_name || '—'
                            : doc.vendor_name || '—'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {doc.invoice_number || '—'}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          €{(doc.total_excl_vat ?? 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          €{(doc.vat_total ?? 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          €{(doc.total_incl_vat ?? 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                          {(doc.vat_breakdown || [])
                            .map((entry) => `${entry.rate}%`)
                            .join(' / ') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

