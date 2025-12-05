'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
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
};

type ViewMode = 'grid' | 'list';

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

      const { data, error } = await supabase
        .from('clients')
        .select('*')
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

  const filteredClients = clients.filter(client => {
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
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Clients</h1>
          <p className="text-slate-700">
            {filteredClients.length} of {clients.length} clients
          </p>
            </div>
        <div className="flex items-center gap-3">
            <Link
              href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-signal-red text-signal-red font-semibold hover:bg-signal-red hover:text-white transition-all duration-200"
            >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Client</span>
            </Link>
          <Link
            href="/dashboard/clients/onboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Onboard Client</span>
          </Link>
        </div>
          </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search clients by name, contact, email, or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
            />
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-off-white rounded-lg p-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                filterStatus === 'all'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              All ({clients.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                filterStatus === 'active'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Active ({clients.filter(c => c.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                filterStatus === 'inactive'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Inactive ({clients.filter(c => c.status === 'inactive').length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-off-white rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-signal-red shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-signal-red shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Clients Display */}
          {filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg text-slate-700 mb-4">
            {search ? 'No clients match your search' : 'No clients found'}
              </p>
              {!search && (
                <Link
              href="/dashboard/clients/onboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
                >
              Onboard Your First Client
                </Link>
              )}
            </div>
      ) : viewMode === 'list' ? (
        /* List View - Clean CRM Style */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Link
                href={`/dashboard/clients/${client.id}`}
                className="flex items-center justify-between p-5 hover:bg-off-white transition-colors border-b border-gray-100 last:border-b-0 group"
              >
                {/* Left: Company Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar/Initial */}
                  <div className="w-12 h-12 bg-gradient-to-br from-navy-900 to-navy-800 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {client.company_name.charAt(0)}
                  </div>
                  
                  {/* Company & Contact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-navy-900 group-hover:text-signal-red transition-colors truncate">
                        {client.company_name}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {client.onboarding_status === 'completed' && (
                          <span className="px-2 py-0.5 bg-signal-red/10 text-signal-red text-xs font-bold rounded border border-signal-red/20">
                            ONBOARDED
                          </span>
                        )}
                        {client.priority_level === 'critical' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded border border-red-200">
                            CRITICAL
                          </span>
                        )}
                        {client.priority_level === 'high' && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-bold rounded border border-orange-200">
                            HIGH
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {client.contact_person}
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {client.contact_email}
                      </span>
                      {client.contact_phone && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {client.contact_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Industry & Status */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  {client.industry && (
                    <div className="text-right min-w-[120px]">
                      <p className="text-xs text-slate-500 mb-0.5">Industry</p>
                      <p className="text-sm font-semibold text-navy-900">{client.industry}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${
                      client.status === 'active'
                        ? 'bg-green-100 text-green-800 border-2 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                    }`}>
                      {client.status === 'active' ? '●' : '○'}
                    </span>
                    
                    <svg className="w-5 h-5 text-signal-red opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Grid View - Card Style */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-signal-red/30 transition-all duration-200 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-navy-900 to-navy-800 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                      {client.company_name.charAt(0)}
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      client.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {client.status === 'active' ? '●' : '○'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-navy-900 group-hover:text-signal-red transition-colors mb-1 truncate">
                    {client.company_name}
                  </h3>
                  
                  {client.industry && (
                    <p className="text-sm text-slate-600">{client.industry}</p>
                  )}
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {client.onboarding_status === 'completed' && (
                      <span className="px-2 py-0.5 bg-signal-red/10 text-signal-red text-xs font-bold rounded">
                        Onboarded
                      </span>
                    )}
                    {(client.priority_level === 'critical' || client.priority_level === 'high') && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                        client.priority_level === 'critical' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {client.priority_level}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-navy-900 font-medium truncate">{client.contact_person}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-700 truncate">{client.contact_email}</span>
              </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-off-white group-hover:bg-signal-red/5 border-t border-gray-100 transition-colors">
                  <span className="text-sm font-semibold text-signal-red flex items-center justify-between">
                    <span>View Details</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
            </div>
          )}
    </div>
  );
}
