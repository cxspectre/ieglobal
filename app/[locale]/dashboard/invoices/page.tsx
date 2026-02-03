'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

type Invoice = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  file_url: string | null;
  clients: { id: string; company_name: string } | null;
  projects: { id: string; name: string } | null;
};

function InvoicesPageContent() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<{ id: string; company_name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  useEffect(() => {
    const clientParam = searchParams.get('client');
    if (clientParam) setClientFilter(clientParam);
  }, [searchParams]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data: profile } = await (supabase as any).from('profiles').select('*').eq('id', session.user.id).single();
      if (profile?.role !== 'admin' && profile?.role !== 'employee' && profile?.role !== 'partner') {
        router.push('/portal');
        return;
      }
      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      await loadData();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [invRes, clRes] = await Promise.all([
        (supabase as any).from('invoices').select('*, clients!inner(id, company_name), projects(id, name)').order('created_at', { ascending: false }),
        (supabase as any).from('clients').select('id, company_name').order('company_name', { ascending: true }),
      ]);
      if (invRes.data) setInvoices(invRes.data);
      if (clRes.data) setClients(clRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.clients?.company_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesClient = clientFilter === 'all' || inv.clients?.id === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const pendingCount = filteredInvoices.filter((i) => i.status === 'pending').length;
  const overdueCount = filteredInvoices.filter((i) => i.status === 'overdue').length;
  const paidCount = filteredInvoices.filter((i) => i.status === 'paid').length;
  const totalAmount = filteredInvoices.reduce((s, i) => s + i.amount, 0);

  const markAsPaid = async (inv: Invoice) => {
    setUpdatingId(inv.id);
    try {
      await (supabase as any).from('invoices').update({
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
      }).eq('id', inv.id);
      await loadData();
    } catch (err: unknown) {
      alert('Failed: ' + (err as Error).message);
    }
    setUpdatingId(null);
  };

  const sendReminder = async (inv: Invoice) => {
    setUpdatingId(inv.id);
    try {
      const res = await fetch('/api/invoice-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: inv.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      alert(json.emailSent ? 'Reminder sent to client.' : 'Reminder API not configured.');
      await loadData();
    } catch (err: unknown) {
      alert('Failed: ' + (err as Error).message);
    }
    setUpdatingId(null);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    setDeletingId(invoiceId);
    try {
      const { data: invoice } = await (supabase as any).from('invoices').select('storage_path, file_url').eq('id', invoiceId).single();
      const storagePath = invoice?.storage_path ?? invoice?.file_url?.match(/\/client-files\/(.+)$/)?.[1];
      if (storagePath) {
        await supabase.storage.from('client-files').remove([storagePath]);
      }
      await (supabase as any).from('invoices').delete().eq('id', invoiceId);
      await loadData();
    } catch (err) {
      alert('Failed to delete.');
    }
    setDeletingId(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isOverdue = (inv: Invoice) =>
    ['pending', 'overdue'].includes(inv.status) && new Date(inv.due_date) < new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      {/* Floating hero nav */}
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors" aria-label="Back">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <p className="text-white/50 text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Invoices
                  <span className="text-white/50 font-normal ml-2">
                    {filteredInvoices.length} of {invoices.length}
                  </span>
                </h1>
              </div>
            </div>
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New invoice
            </Link>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Metrics strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
          >
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-navy-900">{filteredInvoices.length}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Total</p>
                  <p className="text-xs text-slate-500">invoices</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-700">{pendingCount}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Pending</p>
                  <p className="text-xs text-slate-500">awaiting payment</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-red-700">{overdueCount}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Overdue</p>
                  <p className="text-xs text-slate-500">needs follow-up</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-700">€{totalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Filtered total</p>
                  <p className="text-xs text-slate-500">{paidCount} paid</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search & filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by invoice # or client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none text-navy-900"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none text-navy-900 text-sm font-medium"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="paid">Paid</option>
                </select>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none text-navy-900 text-sm font-medium min-w-[160px]"
                >
                  <option value="all">All clients</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Invoices list */}
          {filteredInvoices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-16 text-center shadow-sm border border-slate-200/80"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-bold text-navy-900 mb-1">
                {search || statusFilter !== 'all' || clientFilter !== 'all' ? 'No invoices match' : 'No invoices yet'}
              </p>
              <p className="text-sm text-slate-600 mb-6">
                {search || statusFilter !== 'all' || clientFilter !== 'all' ? 'Try adjusting filters' : 'Create invoices from a client page'}
              </p>
              {!search && statusFilter === 'all' && clientFilter === 'all' && (
                <Link href="/dashboard/clients" className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90">
                  Go to clients
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden"
            >
              {filteredInvoices.map((inv, i) => (
                <div
                  key={inv.id}
                  className={`flex items-center justify-between p-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors ${
                    isOverdue(inv) ? 'bg-red-50/30' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-navy-900">{inv.invoice_number}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusStyle(inv.status)}`}>
                        {inv.status}
                      </span>
                      {isOverdue(inv) && (
                        <span className="text-[10px] font-bold text-red-600 px-2 py-0.5 bg-red-100 rounded">OVERDUE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <Link href={`/dashboard/clients/${inv.clients?.id}`} className="hover:text-signal-red">
                        {inv.clients?.company_name}
                      </Link>
                      {inv.projects?.name && <span>{inv.projects.name}</span>}
                      <span>Due {formatDate(inv.due_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-bold text-navy-900">€{inv.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      {inv.file_url && (
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="px-3 py-1.5 text-sm font-medium text-signal-red hover:bg-signal-red/10 rounded-lg transition-colors"
                        >
                          View
                        </button>
                      )}
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => markAsPaid(inv)}
                          disabled={updatingId === inv.id}
                          className="px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {updatingId === inv.id ? '...' : 'Mark paid'}
                        </button>
                      )}
                      {(inv.status === 'overdue' || isOverdue(inv)) && (
                        <button
                          onClick={() => sendReminder(inv)}
                          disabled={updatingId === inv.id}
                          className="px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {updatingId === inv.id ? '...' : 'Send reminder'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inv.id)}
                        disabled={deletingId === inv.id}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === inv.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* View invoice modal */}
      {viewInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setViewInvoice(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-invoice-title"
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
              <h2 id="view-invoice-title" className="text-lg font-bold text-navy-900">
                {viewInvoice.invoice_number} – {viewInvoice.clients?.company_name}
              </h2>
              <div className="flex items-center gap-2">
                {viewInvoice.file_url && (
                  <a
                    href={viewInvoice.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm font-medium text-signal-red hover:bg-signal-red/10 rounded-lg"
                  >
                    Open in new tab
                  </a>
                )}
                <button
                  onClick={() => setViewInvoice(null)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {viewInvoice.file_url ? (
                <iframe
                  src={viewInvoice.file_url}
                  title={`Invoice ${viewInvoice.invoice_number}`}
                  className="w-full h-[70vh] border-0"
                />
              ) : (
                <div className="p-12 text-center text-slate-500">No PDF attached</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading invoices...</p>
        </div>
      </div>
    }>
      <InvoicesPageContent />
    </Suspense>
  );
}
