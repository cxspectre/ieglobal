'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';
import Link from 'next/link';

export default function NewInvoicePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientData, setClientData] = useState<any>(null);
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadClient();
  }, []);

  const loadClient = async () => {
    const { data } = await (supabase as any)
      .from('clients')
      .select('*')
      .eq('id', params.id as string)
      .single();
    
    if (data) setClientData(data);
  };

  const [formData, setFormData] = useState({
    invoice_number: '',
    amount: '',
    description: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    project_id: '',
    vat_rate: '21.00',
  });

  // Calculate VAT breakdown
  const calculateVAT = () => {
    const amount = parseFloat(formData.amount) || 0;
    const vatRate = parseFloat(formData.vat_rate) || 21;
    const subtotal = amount / (1 + vatRate / 100);
    const vatAmount = amount - subtotal;
    const totalAmount = amount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  };

  const vatBreakdown = calculateVAT();

  // Auto-calculate due date (15 business days from issue date)
  useEffect(() => {
    if (formData.issue_date && !formData.due_date) {
      const issueDate = new Date(formData.issue_date);
      let businessDays = 0;
      let daysToAdd = 1;
      
      while (businessDays < 15) {
        const checkDate = new Date(issueDate);
        checkDate.setDate(issueDate.getDate() + daysToAdd);
        const dayOfWeek = checkDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Saturday or Sunday
          businessDays++;
        }
        if (businessDays < 15) {
          daysToAdd++;
        }
      }
      
      const dueDate = new Date(issueDate);
      dueDate.setDate(issueDate.getDate() + daysToAdd);
      
      setFormData(prev => ({
        ...prev,
        due_date: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.issue_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      if (!clientData) throw new Error('Client data not loaded');

      const vatRate = parseFloat(formData.vat_rate) || 21;
      const { subtotal, vatAmount, totalAmount } = vatBreakdown;

      // Generate customer number if not exists
      const customerNumber = clientData.customer_number || `2025-${String(Math.floor(Math.random() * 900) + 100)}`;
      
      // Generate PDF with proper address structure
      const pdfBlob = await generateInvoicePDF({
        invoiceNumber: formData.invoice_number,
        customerNumber: customerNumber,
        issueDate: formData.issue_date,
        dueDate: formData.due_date,
        clientName: clientData.company_name,
        clientContact: clientData.contact_person,
        clientAddress: {
          street: clientData.address_street || '',
          city: clientData.address_city || '',
          postalCode: clientData.address_postal_code || '',
          country: clientData.address_country || 'Netherlands',
        },
        clientKvK: clientData.kvk_number || '',
        clientVAT: clientData.vat_number || '',
        subtotal: subtotal,
        vatRate: vatRate,
        vatAmount: vatAmount,
        totalAmount: totalAmount,
        currency: 'EUR',
        description: formData.description || 'Professional Services',
      });

      // Upload PDF to storage
      const pdfFileName = `${formData.invoice_number}.pdf`;
      const pdfPath = `${params.id}/invoices/${pdfFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(pdfPath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('client-files')
        .getPublicUrl(pdfPath);

      // Create invoice with VAT breakdown
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          client_id: params.id as string,
          project_id: formData.project_id || null,
          invoice_number: formData.invoice_number,
          amount: totalAmount,
          currency: 'EUR',
          status: 'pending',
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          description: formData.description || null,
          file_url: publicUrl,
          vat_rate: vatRate,
          subtotal: subtotal,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          created_by: session.user.id,
        } as any)
        .select('id')
        .single();

      if (invoiceError) throw invoiceError;

      // Notify client by email (non-blocking)
      const invoiceId = (newInvoice as { id?: string } | null)?.id;
      if (invoiceId) {
        fetch('/api/invoice-created-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId }),
        }).catch((e) => console.warn('Invoice email failed:', e));
      }

      // Save PDF as file record
      await (supabase as any).from('files').insert({
        client_id: params.id as string,
        file_name: pdfFileName,
        file_type: 'application/pdf',
        file_size: pdfBlob.size,
        file_url: publicUrl,
        storage_path: pdfPath,
        category: 'document',
        uploaded_by: session.user.id,
      } as any);

      // Log activity
      await supabase.from('activities').insert({
        client_id: params.id as string,
        user_id: session.user.id,
        action_type: 'invoice_created',
        description: `Invoice ${formData.invoice_number} created for €${totalAmount.toFixed(2)} (incl. VAT)`,
      } as any);

      setLoading(false);
      alert(`✅ Invoice created and PDF generated!\n\nThe client has been notified by email.\n\nFile: ${pdfFileName}\nTotal: €${totalAmount.toFixed(2)} (incl. VAT)`);

      // Redirect back
      router.push(`/dashboard/clients/${params.id}`);
    } catch (err: any) {
      console.error('Error creating invoice:', err);
      setError(err.message || 'Failed to create invoice');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/clients/${params.id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-signal-red mb-4 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Client
        </Link>
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Create Invoice</h1>
        <p className="text-slate-700">Generate a new EU-compliant invoice for this client</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-1 w-full bg-signal-red" aria-hidden />
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-sm">
              {error}
            </div>
          )}

          {/* Invoice Number */}
          <div>
            <label htmlFor="invoice_number" className="block text-sm font-semibold text-navy-900 mb-2">
              Invoice Number <span className="text-signal-red">*</span>
            </label>
            <input
              type="text"
              id="invoice_number"
              required
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              placeholder="e.g., INV-2024-001"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="issue_date" className="block text-sm font-semibold text-navy-900 mb-2">
                Issue Date <span className="text-signal-red">*</span>
              </label>
              <input
                type="date"
                id="issue_date"
                required
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="due_date" className="block text-sm font-semibold text-navy-900 mb-2">
                Due Date <span className="text-signal-red">*</span>
                <span className="text-xs text-slate-500 ml-2">(Auto-calculated: 15 business days)</span>
              </label>
              <input
                type="date"
                id="due_date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Amount and VAT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-navy-900 mb-2">
                Total Amount (incl. VAT) <span className="text-signal-red">*</span>
              </label>
              <input
                type="number"
                id="amount"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="vat_rate" className="block text-sm font-semibold text-navy-900 mb-2">
                VAT Rate (%) <span className="text-signal-red">*</span>
              </label>
              <input
                type="number"
                id="vat_rate"
                required
                step="0.01"
                min="0"
                max="100"
                value={formData.vat_rate}
                onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* VAT Breakdown Preview */}
          {formData.amount && (
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <h3 className="text-sm font-semibold text-navy-900 mb-3">VAT Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-700">Subtotal (excl. VAT):</span>
                  <span className="font-semibold">€{vatBreakdown.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">VAT ({formData.vat_rate}%):</span>
                  <span className="font-semibold">€{vatBreakdown.vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300">
                  <span className="text-navy-900 font-semibold">Total (incl. VAT):</span>
                  <span className="text-signal-red font-bold text-lg">€{vatBreakdown.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-navy-900 mb-2">
              Description / Service Details
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the services or products being invoiced..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none resize-none transition-colors"
            />
          </div>

          {/* Client Info Notice */}
          {clientData && (!clientData.address_street || !clientData.vat_number) && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-sm text-yellow-900">
                <strong>⚠️ Missing Client Information:</strong> This client is missing address or VAT details. 
                Please <Link href={`/dashboard/clients/${params.id}`} className="underline font-semibold">update the client profile</Link> to ensure EU-compliant invoices.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
            <Link
              href={`/dashboard/clients/${params.id}`}
              className="px-8 py-3 bg-gray-100 text-navy-900 font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
