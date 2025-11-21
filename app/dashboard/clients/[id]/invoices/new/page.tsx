'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function NewInvoicePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [formData, setFormData] = useState({
    invoice_number: '',
    amount: '',
    description: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    project_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Create invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          client_id: params.id as string,
          project_id: formData.project_id || null,
          invoice_number: formData.invoice_number,
          amount: parseFloat(formData.amount),
          currency: 'EUR',
          status: 'pending',
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          description: formData.description || null,
          created_by: session.user.id,
        } as any);

      if (invoiceError) throw invoiceError;

      // Log activity
      await supabase.from('activities').insert({
        client_id: params.id as string,
        user_id: session.user.id,
        action_type: 'invoice_created',
        description: `Invoice ${formData.invoice_number} created for €${formData.amount}`,
      });

      // Redirect back
      router.push(`/dashboard/clients/${params.id}`);
    } catch (err: any) {
      console.error('Error creating invoice:', err);
      setError(err.message || 'Failed to create invoice');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-off-white">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-bold text-xl text-navy-900">
              IE Global
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-700 hover:text-signal-red transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-3xl mx-auto">
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
            <p className="text-slate-700">Generate a new invoice for this client</p>
          </div>

          {/* Form */}
          <div className="bg-white p-8 border-l-4 border-signal-red">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-navy-900 mb-2">
                  Amount (EUR) <span className="text-signal-red">*</span>
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
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-navy-900 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Invoice description or line items..."
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none resize-none"
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
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="due_date" className="block text-sm font-semibold text-navy-900 mb-2">
                    Due Date <span className="text-signal-red">*</span>
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                  />
                </div>
              </div>

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
      </main>
    </div>
  );
}

