'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

type DashboardStats = {
  activeClients: number;
  totalClients: number;
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  onboardedClients: number;
};

type RecentClient = {
  id: string;
  company_name: string;
  contact_person: string;
  priority_level: string | null;
  created_at: string;
};

type RecentProject = {
  id: string;
  name: string;
  status: string;
  progress_percentage: number;
  clients: {
    company_name: string;
  };
};

type UpcomingMilestone = {
  id: string;
  title: string;
  expected_date: string;
  projects: {
    name: string;
    clients: {
      company_name: string;
    };
  };
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    activeClients: 0,
    totalClients: 0,
    totalProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    onboardedClients: 0,
  });
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<UpcomingMilestone[]>([]);
  
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        // Get profile
    const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile?.role !== 'admin' && profile?.role !== 'employee') {
          router.push('/portal');
          return;
        }

        setUser({ ...session.user, profile });

    // Load all stats in parallel
    const [
      activeClientsResult,
      totalClientsResult,
      projectsResult,
      inProgressResult,
      completedResult,
      pendingInvoicesResult,
      overdueResult,
      paidInvoicesResult,
      onboardedResult
    ] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('invoices').select('*', { count: 'exact', head: true }).lt('due_date', new Date().toISOString().split('T')[0]).neq('status', 'paid'),
      supabase.from('invoices').select('amount').eq('status', 'paid'),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('onboarding_status', 'completed'),
    ]);

    const totalRevenue = paidInvoicesResult.data?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;

    setStats({
      activeClients: activeClientsResult.count || 0,
      totalClients: totalClientsResult.count || 0,
      totalProjects: projectsResult.count || 0,
      inProgressProjects: inProgressResult.count || 0,
      completedProjects: completedResult.count || 0,
      pendingInvoices: pendingInvoicesResult.count || 0,
      overdueInvoices: overdueResult.count || 0,
      totalRevenue,
      onboardedClients: onboardedResult.count || 0,
    });

    // Load recent data
    const [clientsData, projectsData, milestonesData] = await Promise.all([
      supabase.from('clients').select('id, company_name, contact_person, priority_level, created_at').order('created_at', { ascending: false }).limit(4),
      supabase.from('projects').select('id, name, status, progress_percentage, clients(company_name)').in('status', ['in_progress', 'planning', 'review']).order('created_at', { ascending: false }).limit(4),
      supabase.from('milestones').select('id, title, expected_date, projects(name, clients(company_name))').gte('expected_date', new Date().toISOString().split('T')[0]).neq('status', 'completed').order('expected_date', { ascending: true }).limit(3),
    ]);

    if (clientsData.data) setRecentClients(clientsData.data);
    if (projectsData.data) setRecentProjects(projectsData.data as any);
    if (milestonesData.data) setUpcomingMilestones(milestonesData.data as any);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="max-w-[1600px] mx-auto -m-8">
      {/* Hero Banner with Background Image */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-b-2xl mb-8"
      >
        <div className="relative h-48 md:h-56">
          <Image
            src="/pexels-xexusdesigner-777001.jpg"
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 1600px) 1600px, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-navy-900/70" />
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <p className="text-sm text-gray-300 mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {greeting}, {firstName}
                </h1>
                <p className="text-gray-200">Here&apos;s your command center</p>
              </div>
              <Link
                href="/dashboard/clients/onboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 shadow-lg w-fit"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Onboard Client</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-8">

      {/* Primary Metrics Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Clients Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-signal-red/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            <Link href="/dashboard/clients" className="text-signal-red hover:text-signal-red/80 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="text-sm text-slate-600 mb-1">Clients</p>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-4xl font-bold text-navy-900">{stats.activeClients}</p>
            <p className="text-lg text-slate-500">/ {stats.totalClients}</p>
          </div>
          <p className="text-xs text-slate-600">{stats.onboardedClients} via onboarding workflow</p>
                </div>

        {/* Projects Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            <Link href="/dashboard/projects" className="text-signal-red hover:text-signal-red/80 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="text-sm text-slate-600 mb-1">Projects</p>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-4xl font-bold text-navy-900">{stats.inProgressProjects}</p>
            <p className="text-lg text-slate-500">/ {stats.totalProjects}</p>
          </div>
          <p className="text-xs text-slate-600">{stats.completedProjects} completed</p>
                </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            <Link href="/dashboard/revenue" className="text-signal-red hover:text-signal-red/80 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="text-sm text-slate-600 mb-1">Revenue</p>
          <p className="text-4xl font-bold text-navy-900">€{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 font-semibold mt-1">Paid invoices</p>
                </div>

        {/* Invoices Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              stats.overdueInvoices > 0 ? 'bg-red-500/10' : 'bg-orange-500/10'
            }`}>
              <svg className={`w-6 h-6 ${stats.overdueInvoices > 0 ? 'text-red-600' : 'text-orange-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            <Link href="/dashboard/invoices" className="text-signal-red hover:text-signal-red/80 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="text-sm text-slate-600 mb-1">Invoices</p>
          <p className="text-4xl font-bold text-navy-900">{stats.pendingInvoices}</p>
          {stats.overdueInvoices > 0 ? (
            <p className="text-xs text-red-600 font-semibold mt-1">{stats.overdueInvoices} overdue</p>
          ) : (
            <p className="text-xs text-slate-600 mt-1">All on track</p>
          )}
        </div>
      </motion.div>

      {/* Main Content Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Milestones (Urgent) */}
          {upcomingMilestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border-l-4 border-orange-500 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Upcoming Deadlines
                </h2>
                <span className="text-xs text-slate-600">Next 7 days</span>
              </div>
              <div className="space-y-2">
                {upcomingMilestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 truncate">{milestone.title}</p>
                      <p className="text-sm text-slate-600 truncate">
                        {milestone.projects.clients.company_name} • {milestone.projects.name}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-orange-700 ml-3 flex-shrink-0">
                      {new Date(milestone.expected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Active Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Active Projects
              </h2>
                <Link
                  href="/dashboard/projects"
                className="text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors"
                >
                View All →
                    </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <p>No active projects</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}/milestones`}
                    className="block p-4 bg-off-white hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-navy-900 group-hover:text-signal-red transition-colors">
                        {project.name}
                      </p>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'review' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{project.clients?.company_name}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-signal-red h-full transition-all duration-500"
                          style={{ width: `${project.progress_percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-navy-900">{project.progress_percentage}%</span>
                  </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
            </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
              {/* Recent Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-900">Recent</h2>
                <Link
                href="/dashboard/clients"
                className="text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors"
                >
                All →
                </Link>
            </div>

            {recentClients.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <p className="text-sm">No clients yet</p>
              </div>
              ) : (
              <div className="space-y-2">
                  {recentClients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/clients/${client.id}`}
                    className="flex items-center gap-3 p-3 bg-off-white hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                    <div className="w-8 h-8 bg-gradient-to-br from-navy-900 to-navy-800 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {client.company_name.charAt(0)}
                </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-900 truncate group-hover:text-signal-red transition-colors">
                        {client.company_name}
                      </p>
                      <p className="text-xs text-slate-600 truncate">{client.contact_person}</p>
                    </div>
                    {(client.priority_level === 'critical' || client.priority_level === 'high') && (
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        client.priority_level === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                      }`} />
                    )}
                  </Link>
                  ))}
                </div>
              )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-bold text-navy-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/clients/new"
                className="flex items-center gap-3 p-3 bg-off-white hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-signal-red transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                </div>
                <span className="font-semibold text-navy-900 text-sm">Add Client</span>
              </Link>

              <Link
                href="/dashboard/projects"
                className="flex items-center gap-3 p-3 bg-off-white hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-signal-red transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                </div>
                <span className="font-semibold text-navy-900 text-sm">Find Client</span>
              </Link>

              <Link
                href="/dashboard/invoices"
                className="flex items-center gap-3 p-3 bg-off-white hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-signal-red transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                </div>
                <span className="font-semibold text-navy-900 text-sm">View Invoices</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
}
