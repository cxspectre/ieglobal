'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

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
};

export default function ClientInvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<{ client_id?: string } | null>(null);
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

    setProfile(profile);
    if (!profile?.client_id) {
      setLoading(false);
      setInvoices([]);
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

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading invoices...</p>
        </div>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Invoices</h1>
        <p className="text-slate-600 text-sm">View and download your invoices</p>
      </div>

      {!profile?.client_id ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200/80 shadow-sm">
          <p className="text-slate-600">Your account is not yet linked to a client. Contact <a href="mailto:hello@ie-global.net" className="text-signal-red font-medium hover:underline">hello@ie-global.net</a> for access.</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl bg-white p-16 text-center border border-slate-200/80 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-semibold text-navy-900 mb-1">No invoices yet</p>
          <p className="text-sm text-slate-500">You'll see your invoices here once they're issued.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const fileUrl = (invoice as { file_url?: string }).file_url;
            return (
              <div
                key={invoice.id}
                className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="text-xl font-bold text-navy-900">{invoice.invoice_number}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getStatusStyle(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                    {invoice.description && (
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">{invoice.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
                      <span>Issued {new Date(invoice.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>Due {new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {invoice.paid_date && (
                        <span className="text-emerald-700 font-medium">Paid {new Date(invoice.paid_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <p className="text-2xl font-bold text-navy-900">€{invoice.amount.toFixed(2)}</p>
                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-signal-red hover:bg-signal-red/90 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">PDF not available</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

