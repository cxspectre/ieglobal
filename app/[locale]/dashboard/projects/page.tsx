'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress_percentage: number;
  start_date: string | null;
  end_date: string | null;
  expected_completion_date: string | null;
  clients: {
    id: string;
    company_name: string;
  } | null;
};

type ClientOption = { id: string; company_name: string };

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  useEffect(() => {
    const status = searchParams.get('status');
    const client = searchParams.get('client');
    if (status) setStatusFilter(status);
    if (client) setClientFilter(client);
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
      if (profile?.role !== 'admin' && profile?.role !== 'employee') {
        router.push('/portal');
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
      const [projectsRes, clientsRes] = await Promise.all([
        (supabase as any).from('projects').select('*, clients!inner(id, company_name)').order('created_at', { ascending: false }),
        (supabase as any).from('clients').select('id, company_name').order('company_name', { ascending: true }),
      ]);
      if (projectsRes.data) setProjects(projectsRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.clients?.company_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesClient = clientFilter === 'all' || p.clients?.id === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const inProgressCount = filteredProjects.filter((p) => ['in_progress', 'planning', 'review'].includes(p.status)).length;
  const completedCount = filteredProjects.filter((p) => p.status === 'completed').length;
  const avgProgress = filteredProjects.length > 0
    ? Math.round(filteredProjects.reduce((s, p) => s + (p.progress_percentage ?? 0), 0) / filteredProjects.length)
    : 0;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'review': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'on_hold': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading projects...</p>
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
              <Link
                href="/dashboard"
                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Back to dashboard"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <p className="text-white/50 text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Projects
                  <span className="text-white/50 font-normal ml-2">
                    {filteredProjects.length} of {projects.length}
                  </span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/clients"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New project
              </Link>
            </div>
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
                  <span className="text-xl font-bold text-navy-900">{filteredProjects.length}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Total</p>
                  <p className="text-xs text-slate-500">projects</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-700">{inProgressCount}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">In progress</p>
                  <p className="text-xs text-slate-500">planning, active, review</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-700">{completedCount}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Completed</p>
                  <p className="text-xs text-slate-500">done</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-navy-900">{avgProgress}%</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Avg. progress</p>
                  <p className="text-xs text-slate-500">across filtered</p>
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
                  placeholder="Search by project or client..."
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
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none text-navy-900 text-sm font-medium"
                >
                  <option value="all">All statuses</option>
                  <option value="in_progress">In progress</option>
                  <option value="planning">Planning</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On hold</option>
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
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-signal-red shadow-sm' : 'text-slate-600 hover:text-navy-900'}`}
                    title="Grid view"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-signal-red shadow-sm' : 'text-slate-600 hover:text-navy-900'}`}
                    title="List view"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Projects */}
          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-16 text-center shadow-sm border border-slate-200/80"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="font-bold text-navy-900 mb-1">
                {search || statusFilter !== 'all' || clientFilter !== 'all' ? 'No projects match' : 'No projects yet'}
              </p>
              <p className="text-sm text-slate-600 mb-6">
                {search || statusFilter !== 'all' || clientFilter !== 'all'
                  ? 'Try adjusting filters'
                  : 'Projects are created from a client. Pick a client and add one.'}
              </p>
              {!search && statusFilter === 'all' && clientFilter === 'all' && (
                <Link
                  href="/dashboard/clients"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors"
                >
                  Go to clients
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
              {filteredProjects.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}/milestones`}
                  className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:bg-signal-red transition-colors">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy-900 truncate group-hover:text-signal-red">{p.name}</p>
                      <p className="text-sm text-slate-500 truncate">{p.clients?.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-2 w-32">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-signal-red rounded-full" style={{ width: `${p.progress_percentage ?? 0}%` }} />
                      </div>
                      <span className="text-sm font-bold w-8">{p.progress_percentage ?? 0}%</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusStyle(p.status)}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-signal-red group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/dashboard/projects/${p.id}/milestones`}
                    className="block rounded-2xl bg-white shadow-sm border border-slate-200/80 hover:shadow-md hover:border-signal-red/20 transition-all overflow-hidden group"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:bg-signal-red transition-colors">
                          {p.name.charAt(0)}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusStyle(p.status)}`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-navy-900 mb-1 group-hover:text-signal-red transition-colors truncate">
                        {p.name}
                      </h3>
                      <Link
                        href={`/dashboard/clients/${p.clients?.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-slate-600 hover:text-signal-red transition-colors truncate block mb-3"
                      >
                        {p.clients?.company_name}
                      </Link>
                      {p.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{p.description}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-signal-red rounded-full transition-all" style={{ width: `${p.progress_percentage ?? 0}%` }} />
                        </div>
                        <span className="text-sm font-bold text-navy-900">{p.progress_percentage ?? 0}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                        <span>Start: {formatDate(p.start_date)}</span>
                        {p.expected_completion_date && (
                          <span>Due: {formatDate(p.expected_completion_date)}</span>
                        )}
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-slate-50 group-hover:bg-signal-red/5 border-t border-slate-100 transition-colors">
                      <span className="text-sm font-semibold text-signal-red flex items-center gap-2">
                        View milestones
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </div>
    </div>
  );
}
