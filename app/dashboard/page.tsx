'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

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
  }, []);

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
      .limit(6);

    if (recentClientsData) setRecentClients(recentClientsData);

    // Get recent activity
    const { data: activityData } = await (supabase as any)
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading...</p>
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
            <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
            <p className="text-sm text-slate-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <Link
              href="/dashboard/clients/new"
            className="px-6 py-3 bg-signal-red text-white font-semibold rounded-full hover:bg-signal-red/90 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Client
            </Link>
        </div>
          </div>

      <div className="max-w-7xl mx-auto px-8 pb-12">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-navy-900 mb-2">
            Welcome back, {user?.profile?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-xl text-slate-700">
            Let's make today productive
          </p>
                </div>

        {/* Stats Row - Subtle Professional Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Link href="/dashboard/clients" className="group">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-signal-red/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Clients</p>
                  <p className="text-3xl font-bold text-navy-900">{stats.activeClients}</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 group-hover:text-signal-red transition-colors duration-200">
                View all clients →
              </div>
            </div>
          </Link>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-navy-900/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Active Projects</p>
                <p className="text-3xl font-bold text-navy-900">{stats.inProgressProjects}</p>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {stats.completedProjects} done • {stats.totalProjects} total
            </div>
                </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Revenue</p>
                <p className="text-2xl font-bold text-green-700">€{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-xs text-slate-500">Paid invoices YTD</div>
                </div>

          <div className={`bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${stats.overdueInvoices > 0 ? 'ring-2 ring-red-500/20' : ''}`}>
            <div className="flex items-center gap-4 mb-3">
              <div className={`w-12 h-12 rounded-xl ${stats.overdueInvoices > 0 ? 'bg-red-500/10' : 'bg-slate-700/10'} flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${stats.overdueInvoices > 0 ? 'text-red-600' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Invoices</p>
                <p className="text-3xl font-bold text-navy-900">{stats.pendingInvoices}</p>
              </div>
            </div>
            {stats.overdueInvoices > 0 && (
              <div className="text-xs font-semibold text-red-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {stats.overdueInvoices} overdue
              </div>
                )}
            </div>
          </div>

        {/* Alert: Upcoming Milestones */}
          {upcomingMilestones.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-10 border-l-4 border-signal-red">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-signal-red/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
                    <div>
                <h2 className="text-xl font-bold text-navy-900">Upcoming This Week</h2>
                <p className="text-sm text-slate-600">{upcomingMilestones.length} milestones due in the next 7 days</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {upcomingMilestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <p className="font-semibold text-navy-900">{milestone.title}</p>
                    <p className="text-sm text-slate-600">
                      {milestone.projects.clients.company_name} • {milestone.projects.name}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-white rounded-lg text-sm font-semibold text-navy-900 whitespace-nowrap ml-4 border border-gray-200">
                    {new Date(milestone.expected_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Clients & Invoices */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Clients */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-navy-900">Clients</h2>
                <Link
                  href="/dashboard/clients"
                  className="text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors duration-200"
                >
                  View all →
                </Link>
              </div>
              {recentClients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-700 mb-4">No clients yet</p>
                  <Link
                    href="/dashboard/clients/new"
                    className="inline-block px-6 py-3 bg-signal-red text-white font-semibold rounded-full hover:bg-signal-red/90 transition-all duration-200"
                  >
                    Add Your First Client
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentClients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/clients/${client.id}`}
                      className="group p-5 rounded-xl bg-slate-50 hover:bg-white transition-all duration-200 border border-gray-200 hover:border-signal-red/30 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-navy-900 group-hover:text-signal-red transition-colors duration-200 mb-1">
                            {client.company_name}
                          </p>
                      <p className="text-sm text-slate-600">{client.contact_person}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          client.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Since {new Date(client.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Invoices */}
            {recentInvoices.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900">Recent Invoices</h2>
                    {stats.overdueInvoices > 0 && (
                      <p className="text-sm text-red-600 font-semibold mt-1">
                        ⚠️ {stats.overdueInvoices} overdue - needs attention
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-navy-900">{invoice.invoice_number}</p>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{invoice.clients?.company_name || 'Unknown'}</p>
                      </div>
                      <p className="text-xl font-bold text-navy-900 ml-4">€{invoice.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Activity Feed */}
          <div className="space-y-8">
            {/* Project Status Pie */}
            {Object.keys(projectsByStatus).length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-navy-900 mb-5">Project Status</h3>
                <div className="space-y-3">
                  {Object.entries(projectsByStatus).map(([status, count]: [string, any]) => {
                    const total = Object.values(projectsByStatus).reduce((a: any, b: any) => a + b, 0);
                    const percentage = (count / total * 100).toFixed(0);
                    const colorMap: any = {
                      'in_progress': 'bg-blue-500',
                      'completed': 'bg-green-500',
                      'on_hold': 'bg-yellow-500',
                      'planning': 'bg-purple-500',
                      'cancelled': 'bg-gray-400',
                    };
                    const color = colorMap[status] || 'bg-gray-500';
                    
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700 capitalize font-medium">{status.replace('_', ' ')}</span>
                          <span className="font-bold text-navy-900">{count}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Activity Feed */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-navy-900 mb-5">Activity Feed</h3>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-signal-red/10 flex items-center justify-center flex-shrink-0 border-2 border-signal-red">
                          <div className="w-2 h-2 bg-signal-red rounded-full" />
                        </div>
                        {index < recentActivity.length - 1 && (
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm text-slate-700 leading-relaxed">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(activity.created_at).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e63946;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d62839;
        }
      `}</style>
    </div>
  );
}
