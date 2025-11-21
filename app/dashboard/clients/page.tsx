'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Client = {
  id: string;
  company_name: string;
  contact_person: string;
  contact_email: string;
  industry: string | null;
  status: string;
  created_at: string;
};

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkAuthAndLoadClients = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Load clients
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading clients:', error);
      } else {
        setClients(data || []);
      }
      
      setLoading(false);
    };

    checkAuthAndLoadClients();
  }, []);

  const filteredClients = clients
    .filter(client => {
      const matchesSearch = 
    client.company_name.toLowerCase().includes(search.toLowerCase()) ||
    client.contact_person.toLowerCase().includes(search.toLowerCase()) ||
        client.contact_email.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

  const activeCount = clients.filter(c => c.status === 'active').length;
  const inactiveCount = clients.filter(c => c.status === 'inactive').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Floating Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold text-navy-900">Clients</h1>
            <p className="text-sm text-slate-600">{clients.length} total • {activeCount} active</p>
            </div>
            <Link
              href="/dashboard/clients/new"
            className="px-6 py-3 bg-gradient-to-r from-signal-red to-red-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            Add Client
            </Link>
        </div>
          </div>

      <div className="max-w-7xl mx-auto px-8 pb-12">
        {/* Search & Filter Bar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            <input
              type="text"
                  placeholder="Search by company name, contact person, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900 bg-white"
            />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { label: 'All', value: 'all' as const, count: clients.length },
                { label: 'Active', value: 'active' as const, count: activeCount },
                { label: 'Inactive', value: 'inactive' as const, count: inactiveCount },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    statusFilter === filter.value
                      ? 'bg-gradient-to-r from-signal-red to-red-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
          </div>

        {/* Clients Grid */}
          {filteredClients.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-16 text-center shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-2">
              {search ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {search ? 'Try adjusting your search or filters' : 'Add your first client to get started'}
              </p>
              {!search && (
                <Link
                  href="/dashboard/clients/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-signal-red to-red-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Client
                </Link>
              )}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="group"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      client.status === 'active' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                          }`}>
                            {client.status}
                          </span>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-signal-red group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Company Info */}
                  <h3 className="text-xl font-bold text-navy-900 mb-2 group-hover:text-signal-red transition-colors duration-200">
                    {client.company_name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-slate-700">{client.contact_person}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-slate-600 truncate">{client.contact_email}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {client.industry || 'No industry set'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(client.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                          </Link>
                    ))}
              </div>
        )}

        {/* Results Counter */}
        {filteredClients.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Showing {filteredClients.length} of {clients.length} clients
            </p>
            </div>
          )}
      </div>
    </div>
  );
}
