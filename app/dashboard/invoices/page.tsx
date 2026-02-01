'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Invoice = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  description: string | null;
  file_url: string | null;
  clients: {
    id: string;
    company_name: string;
  } | null;
  projects: {
    id: string;
    name: string;
  } | null;
};

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [clients, setClients] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  useEffect(() => {
    const clientParam = searchParams.get('client');
    if (clientParam) {
      setClientFilter(clientParam);
    }
  }, [searchParams]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (invoices.length > 0) {
      applyFilters();
    }
  }, [statusFilter, clientFilter, invoices]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin' && profile?.role !== 'employee') {
        router.push('/portal');
        return;
      }

      await loadData();
    } catch (err) {
      console.error('Auth check error:', err);
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load all invoices with client and project info
      const { data: invoicesData, error: invoicesError } = await (supabase as any)
        .from('invoices')
        .select(`
          *,
          clients!inner(id, company_name),
          projects(id, name)
        `)
        .order('created_at', { ascending: false });

      if (invoicesError) {
        console.error('Error loading invoices:', invoicesError);
      } else {
        setInvoices(invoicesData || []);
        setFilteredInvoices(invoicesData || []);
      }

      // Load all clients for filter
      const { data: clientsData } = await (supabase as any)
        .from('clients')
        .select('id, company_name')
        .order('company_name', { ascending: true });

      if (clientsData) {
        setClients(clientsData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    // Filter by client
    if (clientFilter !== 'all') {
      filtered = filtered.filter(inv => inv.clients?.id === clientFilter);
    }

    setFilteredInvoices(filtered);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    setDeletingId(invoiceId);

    try {
      // Get invoice to check for file (invoice PDFs live in client-files bucket)
      const { data: invoice } = await (supabase as any)
        .from('invoices')
        .select('storage_path, file_url')
        .eq('id', invoiceId)
        .single();

      // Derive storage path: invoices are stored in client-files bucket (path like clientId/invoices/file.pdf)
      const storagePath =
        invoice?.storage_path ||
        (invoice?.file_url?.match(/\/client-files\/(.+)$/)?.[1] ?? null);

      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('client-files')
          .remove([storagePath]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      }

      // Delete invoice record
      const { error: deleteError } = await (supabase as any)
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (deleteError) {
        throw deleteError;
      }

      // Log activity
      await (supabase as any)
        .from('activities')
        .insert({
          type: 'invoice_deleted',
          description: `Invoice deleted`,
          user_id: (await supabase.auth.getSession()).data.session?.user.id,
        });

      // Reload invoices
      await loadData();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('Failed to delete invoice. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Invoices</h1>
          <p className="text-lg text-slate-700">
            Manage all client invoices
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-semibold text-navy-900 mb-2">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label htmlFor="clientFilter" className="block text-sm font-semibold text-navy-900 mb-2">
              Filter by Client
            </label>
            <select
              id="clientFilter"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900"
            >
              <option value="all">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-700 text-lg">No invoices found.</p>
            {invoices.length === 0 && (
              <Link
                href="/dashboard/clients"
                className="mt-4 inline-block text-signal-red hover:text-signal-red/80 font-semibold"
              >
                Create your first invoice →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-off-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-off-white transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-navy-900">{invoice.invoice_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/clients/${invoice.clients?.id}`}
                        className="text-signal-red hover:text-signal-red/80 font-semibold"
                      >
                        {invoice.clients?.company_name || 'N/A'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {invoice.projects?.name ? (
                        <Link
                          href={`/dashboard/projects/${invoice.projects.id}`}
                          className="text-slate-700 hover:text-signal-red"
                        >
                          {invoice.projects.name}
                        </Link>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-navy-900">€{invoice.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {formatDate(invoice.issue_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.file_url && (
                          <a
                            href={invoice.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors duration-200"
                            title="View PDF"
                          >
                            View
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          disabled={deletingId === invoice.id}
                          className="px-3 py-1 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete invoice"
                        >
                          {deletingId === invoice.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredInvoices.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 border border-gray-200">
            <p className="text-sm text-slate-600 mb-1">Total Invoices</p>
            <p className="text-3xl font-bold text-navy-900">{filteredInvoices.length}</p>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <p className="text-sm text-slate-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-navy-900">
              €{filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <p className="text-sm text-slate-600 mb-1">Paid Invoices</p>
            <p className="text-3xl font-bold text-green-600">
              {filteredInvoices.filter(inv => inv.status === 'paid').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

