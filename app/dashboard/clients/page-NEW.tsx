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
  industry: string | null;
  status: string;
  onboarding_status: string | null;
  priority_level: string | null;
  website: string | null;
  expected_timeline: string | null;
  created_at: string;
};

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
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

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => {
      const matchesSearch = 
        client.company_name.toLowerCase().includes(search.toLowerCase()) ||
        client.contact_person.toLowerCase().includes(search.toLowerCase()) ||
        client.contact_email.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || client.priority_level === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.company_name.localeCompare(b.company_name);
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority_level as keyof typeof priorityOrder] ?? 999) - 
                 (priorityOrder[b.priority_level as keyof typeof priorityOrder] ?? 999);
        default:
          return 0;
      }
    });

  const activeClients = clients.filter(c => c.status === 'active').length;
  const onboardedClients = clients.filter(c => c.onboarding_status === 'completed').length;
  const highPriorityClients = clients.filter(c => c.priority_level === 'high' || c.priority_level === 'critical').length;

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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-navy-900 mb-2">Clients</h1>
            <p className="text-slate-700 text-lg">Manage all your client accounts and projects</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-signal-red text-signal-red font-semibold hover:bg-signal-red hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Client</span>
            </Link>
            <Link
              href="/dashboard/clients/onboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Onboard Client</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Clients</span>
              <svg className="w-5 h-5 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-navy-900">{clients.length}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Active</span>
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-green-600">{activeClients}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Onboarded</span>
              <svg className="w-5 h-5 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-signal-red">{onboardedClients}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">High Priority</span>
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-orange-600">{highPriorityClients}</div>
          </div>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-navy-900 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by company, person, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Filter by Priority */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-semibold text-navy-900">Sort by:</span>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              sortBy === 'newest' ? 'bg-signal-red text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy('oldest')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              sortBy === 'oldest' ? 'bg-signal-red text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Oldest
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              sortBy === 'name' ? 'bg-signal-red text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Name A-Z
          </button>
          <button
            onClick={() => setSortBy('priority')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              sortBy === 'priority' ? 'bg-signal-red text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Priority
          </button>
        </div>
      </motion.div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center"
        >
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-xl text-slate-700 mb-6">
            {search || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'No clients match your filters.'
              : 'No clients yet. Onboard your first client to get started!'}
          </p>
          {!search && filterStatus === 'all' && filterPriority === 'all' && (
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/dashboard/clients/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-signal-red text-signal-red font-semibold hover:bg-signal-red hover:text-white transition-all duration-200"
              >
                <span>Quick Add Client</span>
              </Link>
              <Link
                href="/dashboard/clients/onboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
              >
                <span>Onboard First Client</span>
              </Link>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link
                href={`/dashboard/clients/${client.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-signal-red/50 transition-all duration-200 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-navy-900 group-hover:text-signal-red transition-colors mb-1">
                        {client.company_name}
                      </h3>
                      {client.industry && (
                        <p className="text-sm text-slate-600">{client.industry}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full flex-shrink-0 ${
                      client.status === 'active'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {client.status === 'active' ? '✓' : '○'}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {client.onboarding_status === 'completed' && (
                      <span className="px-2 py-1 bg-signal-red/10 text-signal-red text-xs font-semibold rounded border border-signal-red/20">
                        Onboarded
                      </span>
                    )}
                    {client.priority_level && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${
                        client.priority_level === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                        client.priority_level === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        client.priority_level === 'medium' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {client.priority_level}
                      </span>
                    )}
                    {client.expected_timeline && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded border border-blue-200">
                        {client.expected_timeline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-3">
                  {/* Contact Person */}
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-900 truncate">{client.contact_person}</p>
                      <p className="text-xs text-slate-600 truncate">{client.contact_email}</p>
                    </div>
                  </div>

                  {/* Website */}
                  {client.website && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <p className="text-sm text-slate-700 truncate">{client.website}</p>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-slate-700">
                      Since {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Card Footer - View Details */}
                <div className="px-6 py-4 bg-off-white border-t border-gray-100 group-hover:bg-signal-red/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-signal-red group-hover:text-signal-red">
                      View Details
                    </span>
                    <svg className="w-5 h-5 text-signal-red group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredClients.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-navy-900">{filteredClients.length}</span> of{' '}
            <span className="font-semibold text-navy-900">{clients.length}</span> clients
          </p>
        </div>
      )}
    </div>
  );
}

