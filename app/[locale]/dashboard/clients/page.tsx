'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

type Client = {
  id: string;
  company_name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string | null;
  industry: string | null;
  status: string;
  onboarding_status: string | null;
  priority_level: string | null;
  website: string | null;
  created_at: string;
  projects?: { id: string; status: string }[];
  invoices?: { id: string; status: string }[];
};

type ViewMode = 'grid' | 'list';

function getClientStatus(c: Client): 'no_project' | 'active' | 'invoiced' | 'paid' | 'stalled' {
  const projects = c.projects || [];
  const invoices = c.invoices || [];
  const hasProjects = projects.length > 0;
  const hasActiveProject = projects.some((p) => ['in_progress', 'planning', 'review'].includes(p.status));
  const hasPaidInvoice = invoices.some((i) => i.status === 'paid');
  const hasPendingInvoice = invoices.some((i) => ['pending', 'overdue'].includes(i.status));

  if (!hasProjects) return 'no_project';
  if (hasPaidInvoice) return 'paid';
  if (hasPendingInvoice) return 'invoiced';
  if (hasActiveProject) return 'active';
  return 'stalled';
}

const STATUS_CHIP: Record<string, { label: string; className: string }> = {
  no_project: { label: 'No project', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  active: { label: 'Active', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  invoiced: { label: 'Invoiced', className: 'bg-violet-100 text-violet-800 border-violet-200' },
  paid: { label: 'Paid', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  stalled: { label: 'Stalled', className: 'bg-red-100 text-red-800 border-red-200' },
};

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkAuthAndLoadClients = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await (supabase as any)
        .from('clients')
        .select('*, projects(id, status), invoices(id, status)')
        .order('company_name', { ascending: true });

      if (error) {
        console.error('Error loading clients:', error);
      } else {
        setClients(data || []);
      }

      setLoading(false);
    };

    checkAuthAndLoadClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.company_name.toLowerCase().includes(search.toLowerCase()) ||
      client.contact_person.toLowerCase().includes(search.toLowerCase()) ||
      client.contact_email.toLowerCase().includes(search.toLowerCase()) ||
      (client.industry && client.industry.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      {/* Floating hero nav bar */}
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-white/50 text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Clients
                  <span className="text-white/50 font-normal ml-2">
                    {filteredClients.length} of {clients.length}
                  </span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/dashboard/clients/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors border border-white/10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Client
              </Link>
              <Link
                href="/dashboard/clients/onboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Onboard Client
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, contact, email, or industry..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900"
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
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  {[
                    { key: 'all', label: `All`, count: clients.length },
                    { key: 'active', label: 'Active', count: clients.filter((c) => c.status === 'active').length },
                    { key: 'inactive', label: 'Inactive', count: clients.filter((c) => c.status === 'inactive').length },
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilterStatus(key)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        filterStatus === key ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-signal-red shadow-sm' : 'text-slate-600 hover:text-navy-900'}`}
                    title="List view"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-signal-red shadow-sm' : 'text-slate-600 hover:text-navy-900'}`}
                    title="Grid view"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Clients Display */}
          {filteredClients.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-16 text-center shadow-sm border border-slate-200/80"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="font-bold text-navy-900 mb-1">
                {search ? 'No clients match your search' : 'No clients yet'}
              </p>
              <p className="text-sm text-slate-600 mb-6">
                {search ? 'Try a different search term' : 'Onboard your first client to get started'}
              </p>
              {!search && (
                <Link
                  href="/dashboard/clients/onboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors"
                >
                  Onboard Client
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </motion.div>
          ) : viewMode === 'list' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden"
            >
              {filteredClients.map((client, index) => {
                const status = getClientStatus(client);
                const chip = STATUS_CHIP[status];
                return (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:bg-signal-red transition-colors">
                          {client.company_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="text-base font-bold text-navy-900 group-hover:text-signal-red transition-colors truncate">
                              {client.company_name}
                            </h3>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${chip.className}`}>
                              {chip.label}
                            </span>
                            {client.onboarding_status === 'completed' && (
                              <span className="px-2 py-0.5 bg-signal-red/10 text-signal-red text-xs font-bold rounded border border-signal-red/20">
                                Onboarded
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                            <span className="flex items-center gap-1.5 truncate">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {client.contact_person}
                            </span>
                            <span className="flex items-center gap-1.5 truncate">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {client.contact_email}
                            </span>
                            {client.industry && (
                              <span className="text-slate-500">{client.industry}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            client.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {client.status}
                        </span>
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-signal-red group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client, index) => {
                const status = getClientStatus(client);
                const chip = STATUS_CHIP[status];
                return (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="block rounded-2xl bg-white shadow-sm border border-slate-200/80 hover:shadow-md hover:border-signal-red/20 transition-all overflow-hidden group"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:bg-signal-red transition-colors">
                            {client.company_name.charAt(0)}
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${chip.className}`}>
                            {chip.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-navy-900 group-hover:text-signal-red transition-colors mb-1 truncate">
                          {client.company_name}
                        </h3>
                        {client.industry && <p className="text-sm text-slate-600 mb-3">{client.industry}</p>}
                        <div className="space-y-1.5 text-sm text-slate-600">
                          <p className="truncate">{client.contact_person}</p>
                          <p className="truncate">{client.contact_email}</p>
                        </div>
                      </div>
                      <div className="px-5 py-3 bg-slate-50 group-hover:bg-signal-red/5 border-t border-slate-100 transition-colors">
                        <span className="text-sm font-semibold text-signal-red flex items-center gap-2">
                          View
                          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
