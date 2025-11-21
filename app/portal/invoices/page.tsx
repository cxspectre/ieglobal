'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-navy-900 mb-3">Invoices</h1>
            <p className="text-xl text-slate-700">View and download your invoices</p>
          </div>

          {invoices.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-16 text-center shadow-lg">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">No invoices yet</h2>
              <p className="text-slate-600">You'll see invoices here when they're issued</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-l-4 border-signal-red hover:shadow-xl transition-shadow duration-300">
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

