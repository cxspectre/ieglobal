'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import PortalNav from '@/components/portal/PortalNav';

type Stats = {
  activeClients: number;
  totalProjects: number;
  inProgressProjects: number;
  pendingInvoices: number;
  totalRevenue: number;
  completedProjects: number;
  overdueInvoices: number;
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
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    activeClients: 0,
    totalProjects: 0,
    inProgressProjects: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    completedProjects: 0,
    overdueInvoices: 0,
  });
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<UpcomingMilestone[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [projectsByStatus, setProjectsByStatus] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // Get profile
        const { data: profile, error } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          setError('Could not load profile');
          setLoading(false);
          return;
        }

        if (profile?.role !== 'admin' && profile?.role !== 'employee') {
          router.push('/portal');
          return;
        }

        setUser({ ...session.user, profile });

        // Load dashboard stats
        await loadStats();
        
        setLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        setLoading(false);
      }
    };

    checkUser();
  }, []); // Remove dependencies to prevent re-checking

  const loadStats = async () => {
    // Get active clients count
    const { count: clientsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get total projects
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Get in-progress projects
    const { count: inProgressCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress');

    // Get completed projects
    const { count: completedCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Get pending invoices count
    const { count: pendingInvoicesCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get overdue invoices (due date passed and not paid)
    const today = new Date().toISOString().split('T')[0];
    const { count: overdueCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .lt('due_date', today)
      .neq('status', 'paid');

    // Get total revenue (paid invoices)
    const { data: paidInvoices } = await (supabase as any)
      .from('invoices')
      .select('amount')
      .eq('status', 'paid');

    const totalRevenue = paidInvoices?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;

    // Get recent clients
    const { data: recentClientsData } = await (supabase as any)
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentClientsData) setRecentClients(recentClientsData);

    // Get recent activity
    const { data: activityData } = await (supabase as any)
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (activityData) setRecentActivity(activityData);

    // Get upcoming milestones (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const { data: milestonesData } = await (supabase as any)
      .from('milestones')
      .select(`
        id,
        title,
        expected_date,
        projects!inner (
          name,
          clients!inner (
            company_name
          )
        )
      `)
      .gte('expected_date', today)
      .lte('expected_date', nextWeek.toISOString().split('T')[0])
      .neq('status', 'completed')
      .order('expected_date', { ascending: true })
      .limit(5);

    if (milestonesData) setUpcomingMilestones(milestonesData);

    // Get recent invoices
    const { data: invoicesData } = await (supabase as any)
      .from('invoices')
      .select('*, clients(company_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (invoicesData) setRecentInvoices(invoicesData);

    // Get projects breakdown by status
    const { data: allProjects } = await (supabase as any)
      .from('projects')
      .select('status');

    if (allProjects) {
      const statusCounts = allProjects.reduce((acc: any, project: any) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {});
      setProjectsByStatus(statusCounts);
    }

    setStats({
      activeClients: clientsCount || 0,
      totalProjects: projectsCount || 0,
      inProgressProjects: inProgressCount || 0,
      pendingInvoices: pendingInvoicesCount || 0,
      totalRevenue,
      completedProjects: completedCount || 0,
      overdueInvoices: overdueCount || 0,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-4xl font-bold text-navy-900 mb-2">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.profile?.full_name?.split(' ')[0]}
              </h1>
              <p className="text-lg text-slate-700">
                Here's what's happening with your projects
              </p>
            </div>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Client
            </Link>
          </div>

          {/* Stats Grid - Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Clients */}
            <Link href="/dashboard/clients" className="bg-gradient-to-br from-signal-red to-red-600 p-8 text-white hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-white/80 mb-1">Active Clients</p>
                  <p className="text-5xl font-bold">{stats.activeClients}</p>
                </div>
                <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm text-white/70 group-hover:text-white transition-colors duration-200">View all clients →</p>
            </Link>

            {/* Projects */}
            <div className="bg-white p-8 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Projects</p>
                  <p className="text-5xl font-bold text-navy-900">{stats.inProgressProjects}</p>
                </div>
                <svg className="w-12 h-12 text-blue-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs text-slate-500">{stats.completedProjects} completed • {stats.totalProjects} total</p>
            </div>

            {/* Revenue */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-8 text-white hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-white/80 mb-1">Total Revenue</p>
                  <p className="text-4xl font-bold">€{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-white/70">From paid invoices</p>
            </div>

            {/* Invoices */}
            <div className="bg-white p-8 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Invoices</p>
                  <p className="text-5xl font-bold text-navy-900">{stats.pendingInvoices}</p>
                </div>
                <svg className="w-12 h-12 text-yellow-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs text-slate-500">
                {stats.overdueInvoices > 0 && (
                  <span className="text-red-600 font-semibold">{stats.overdueInvoices} overdue • </span>
                )}
                Pending payment
              </p>
            </div>
          </div>

          {/* Upcoming Milestones */}
          {upcomingMilestones.length > 0 && (
            <div className="bg-white p-8 mb-8">
              <h2 className="text-xl font-bold text-navy-900 mb-6">⚡ Upcoming Milestones (Next 7 Days)</h2>
              <div className="space-y-3">
                {upcomingMilestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start justify-between p-4 bg-yellow-50 border-l-4 border-yellow-500">
                    <div>
                      <p className="font-semibold text-navy-900">{milestone.title}</p>
                      <p className="text-sm text-slate-700">
                        {milestone.projects.clients.company_name} • {milestone.projects.name}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-yellow-700 whitespace-nowrap ml-4">
                      {new Date(milestone.expected_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Status Overview */}
          {Object.keys(projectsByStatus).length > 0 && (
            <div className="bg-white p-8 mb-8">
              <h2 className="text-xl font-bold text-navy-900 mb-6">Projects by Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(projectsByStatus).map(([status, count]: [string, any]) => (
                  <div key={status} className="text-center p-4 bg-off-white">
                    <p className="text-2xl font-bold text-navy-900">{count}</p>
                    <p className="text-xs text-slate-600 capitalize">{status.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Invoices */}
          {recentInvoices.length > 0 && (
            <div className="bg-white p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy-900">Recent Invoices</h2>
                {stats.overdueInvoices > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold">
                    {stats.overdueInvoices} Overdue
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-off-white">
                    <div className="flex-1">
                      <p className="font-semibold text-navy-900">{invoice.invoice_number}</p>
                      <p className="text-sm text-slate-600">{invoice.clients?.company_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-navy-900">€{invoice.amount.toFixed(2)}</span>
                      <span className={`px-3 py-1 text-xs font-semibold ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Clients & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Clients */}
            <div className="bg-white p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy-900">Recent Clients</h2>
                <Link
                  href="/dashboard/clients/new"
                  className="text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors duration-200"
                >
                  + Add Client
                </Link>
              </div>
              {recentClients.length === 0 ? (
                <p className="text-slate-700 text-sm">No clients yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentClients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/clients/${client.id}`}
                      className="block p-4 bg-off-white hover:bg-gray-100 transition-colors duration-200"
                    >
                      <p className="font-semibold text-navy-900">{client.company_name}</p>
                      <p className="text-sm text-slate-600">{client.contact_person}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-8">
              <h2 className="text-xl font-bold text-navy-900 mb-6">Recent Activity</h2>
              {recentActivity.length === 0 ? (
                <p className="text-slate-700 text-sm">No recent activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="w-2 h-2 bg-signal-red rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
    </div>
  );
}

