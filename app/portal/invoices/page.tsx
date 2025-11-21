'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';
import Link from 'next/link';

type Invoice = {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  description: string | null;
  subtotal?: number;
  vat_amount?: number;
  vat_rate?: number;
  total_amount?: number;
  client_id: string;
};

export default function ClientInvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Get profile
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('client_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.client_id) {
      setLoading(false);
      return;
    }

    // Load invoices
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', profile.client_id)
      .order('issue_date', { ascending: false });

    if (invoicesData) setInvoices(invoicesData);
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // Get client info
      const { data: clientData } = await (supabase as any)
        .from('clients')
        .select('*')
        .eq('id', invoice.client_id)
        .single();

      if (!clientData) {
        alert('Client data not found');
        return;
      }

      // Generate PDF
      const pdfBlob = await generateInvoicePDF({
        invoiceNumber: invoice.invoice_number,
        customerNumber: clientData.customer_number || '',
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
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
        subtotal: invoice.subtotal || invoice.amount / 1.21,
        vatRate: invoice.vat_rate || 21,
        vatAmount: invoice.vat_amount || (invoice.amount - invoice.amount / 1.21),
        totalAmount: invoice.total_amount || invoice.amount,
        currency: invoice.currency,
        description: invoice.description || 'Professional Services',
      });

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate invoice PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal" className="font-bold text-xl text-navy-900">
              Portal
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/portal" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Overview
              </Link>
              <Link href="/portal/milestones" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Milestones
              </Link>
              <Link href="/portal/invoices" className="text-sm font-medium text-navy-900 border-b-2 border-signal-red pb-0.5">
                Invoices
              </Link>
              <Link href="/portal/files" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Files
              </Link>
              <Link href="/portal/messages" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Messages
              </Link>
            </nav>
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-navy-900 mb-8">Invoices</h1>

          {invoices.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-slate-700">No invoices yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="bg-white p-8 border-l-4 border-signal-red">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-2xl font-bold text-navy-900">{invoice.invoice_number}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>
                      {invoice.description && (
                        <p className="text-slate-700 mb-4">{invoice.description}</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Issued</p>
                          <p className="font-semibold text-navy-900">
                            {new Date(invoice.issue_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Due</p>
                          <p className="font-semibold text-navy-900">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        {invoice.paid_date && (
                          <div>
                            <p className="text-slate-600">Paid</p>
                            <p className="font-semibold text-green-700">
                              {new Date(invoice.paid_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-600">Currency</p>
                          <p className="font-semibold text-navy-900">{invoice.currency}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-6 flex flex-col items-end gap-3">
                      <p className="text-3xl font-bold text-navy-900">
                        €{invoice.amount.toFixed(2)}
                      </p>
                      {invoice.status === 'pending' && (
                        <p className="text-sm text-slate-600">Payment pending</p>
                      )}
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="px-4 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

