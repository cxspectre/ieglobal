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
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [preferences, setPreferences] = useState({
    showUpcomingMilestones: true,
    showProjectStatus: true,
    showRecentInvoices: true,
    showRecentClients: true,
    showRecentActivity: true,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);
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

        // Load dashboard preferences
        if (profile?.dashboard_preferences) {
          setPreferences({
            showUpcomingMilestones: profile.dashboard_preferences.showUpcomingMilestones !== false,
            showProjectStatus: profile.dashboard_preferences.showProjectStatus !== false,
            showRecentInvoices: profile.dashboard_preferences.showRecentInvoices !== false,
            showRecentClients: profile.dashboard_preferences.showRecentClients !== false,
            showRecentActivity: profile.dashboard_preferences.showRecentActivity !== false,
          });
        }

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

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        alert('Authentication error. Please refresh the page and try again.');
        setSavingPreferences(false);
        return;
      }

      if (!session) {
        console.error('No session found');
        alert('You must be logged in to save preferences.');
        setSavingPreferences(false);
        return;
      }

      console.log('Saving preferences:', preferences);
      console.log('User ID:', session.user.id);

      const { data, error } = await (supabase as any)
        .from('profiles')
        .update({ dashboard_preferences: preferences })
        .eq('id', session.user.id)
        .select();

      if (error) {
        console.error('Error saving preferences:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        alert(`Failed to save preferences: ${error.message || 'Unknown error'}. Please check the browser console for details.`);
        setSavingPreferences(false);
      } else {
        console.log('Preferences saved successfully:', data);
        setShowCustomizeModal(false);
        // Update user profile in state
        setUser((prev: any) => ({
          ...prev,
          profile: { ...prev.profile, dashboard_preferences: preferences },
        }));
        setSavingPreferences(false);
        // Show success message
        alert('Dashboard preferences saved successfully!');
      }
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      console.error('Error stack:', err.stack);
      alert(`Failed to save preferences: ${err.message || 'Unknown error'}. Please check the browser console for details.`);
      setSavingPreferences(false);
    }
  };

  const handleTogglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCustomizeModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-slate-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                title="Customize Dashboard"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Customize
              </button>
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
            <Link href="/dashboard/projects" className="bg-white p-8 border border-gray-200 hover:shadow-lg transition-shadow duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Projects</p>
                  <p className="text-5xl font-bold text-navy-900">{stats.inProgressProjects}</p>
                </div>
                <svg className="w-12 h-12 text-blue-500/30 group-hover:text-blue-500/50 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs text-slate-500 group-hover:text-signal-red transition-colors duration-200">{stats.completedProjects} completed • {stats.totalProjects} total • View all →</p>
            </Link>

            {/* Revenue */}
            <Link href="/dashboard/revenue" className="bg-gradient-to-br from-green-600 to-emerald-600 p-8 text-white hover:shadow-lg transition-shadow duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-white/80 mb-1">Total Revenue</p>
                  <p className="text-4xl font-bold">€{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <svg className="w-12 h-12 text-white/30 group-hover:text-white/50 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-white/70 group-hover:text-white transition-colors duration-200">View revenue insights →</p>
            </Link>

            {/* Invoices */}
            <Link href="/dashboard/invoices" className="bg-white p-8 border border-gray-200 hover:shadow-lg transition-shadow duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Invoices</p>
                  <p className="text-5xl font-bold text-navy-900">{stats.pendingInvoices}</p>
                </div>
                <svg className="w-12 h-12 text-yellow-500/30 group-hover:text-yellow-500/50 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs text-slate-500 group-hover:text-signal-red transition-colors duration-200">
                {stats.overdueInvoices > 0 && (
                  <span className="text-red-600 font-semibold">{stats.overdueInvoices} overdue • </span>
                )}
                View all invoices →
              </p>
            </Link>
          </div>

          {/* Upcoming Milestones */}
          {preferences.showUpcomingMilestones && upcomingMilestones.length > 0 && (
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
          {preferences.showProjectStatus && Object.keys(projectsByStatus).length > 0 && (
            <div className="bg-white p-8 mb-8 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-navy-900">Projects by Status</h2>
                <Link
                  href="/dashboard/projects"
                  className="text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors duration-200 flex items-center gap-1"
                >
                  View all projects
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Object.entries(projectsByStatus).map(([status, count]: [string, any]) => {
                  const statusConfig = {
                    in_progress: {
                      color: 'bg-blue-50 border-blue-200',
                      iconColor: 'text-blue-600',
                      bgColor: 'bg-blue-100',
                      label: 'In Progress',
                    },
                    completed: {
                      color: 'bg-green-50 border-green-200',
                      iconColor: 'text-green-600',
                      bgColor: 'bg-green-100',
                      label: 'Completed',
                    },
                    on_hold: {
                      color: 'bg-yellow-50 border-yellow-200',
                      iconColor: 'text-yellow-600',
                      bgColor: 'bg-yellow-100',
                      label: 'On Hold',
                    },
                    cancelled: {
                      color: 'bg-red-50 border-red-200',
                      iconColor: 'text-red-600',
                      bgColor: 'bg-red-100',
                      label: 'Cancelled',
                    },
                    planning: {
                      color: 'bg-purple-50 border-purple-200',
                      iconColor: 'text-purple-600',
                      bgColor: 'bg-purple-100',
                      label: 'Planning',
                    },
                  };

                  const config = statusConfig[status as keyof typeof statusConfig] || {
                    color: 'bg-gray-50 border-gray-200',
                    iconColor: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    label: status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                  };

                  return (
                    <Link
                      key={status}
                      href={`/dashboard/projects?status=${status}`}
                      className={`${config.color} border-2 rounded-lg p-6 hover:shadow-md transition-all duration-200 group`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`${config.bgColor} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                          {status === 'in_progress' && (
                            <svg className={`w-6 h-6 ${config.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                          {status === 'completed' && (
                            <svg className={`w-6 h-6 ${config.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {status === 'on_hold' && (
                            <svg className={`w-6 h-6 ${config.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {status === 'cancelled' && (
                            <svg className={`w-6 h-6 ${config.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {!['in_progress', 'completed', 'on_hold', 'cancelled'].includes(status) && (
                            <svg className={`w-6 h-6 ${config.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-3xl font-bold text-navy-900 mb-1">{count}</p>
                          <p className="text-sm font-semibold text-slate-700">{config.label}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Invoices */}
          {preferences.showRecentInvoices && recentInvoices.length > 0 && (
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
          {(preferences.showRecentClients || preferences.showRecentActivity) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Clients */}
              {preferences.showRecentClients && (
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
              )}

              {/* Recent Activity */}
              {preferences.showRecentActivity && (
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
              )}
            </div>
          )}

          {/* Customize Modal */}
          {showCustomizeModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-signal-red/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Customize Dashboard</h2>
                        <p className="text-sm text-white/80 mt-1">Choose which sections to display</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCustomizeModal(false)}
                      className="text-white/70 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                  <div className="space-y-3">
                    {/* Upcoming Milestones */}
                    <div className={`group relative flex items-center justify-between p-5 rounded-lg border-2 transition-all duration-200 ${
                      preferences.showUpcomingMilestones 
                        ? 'bg-yellow-50 border-yellow-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                          preferences.showUpcomingMilestones 
                            ? 'bg-yellow-500' 
                            : 'bg-gray-100'
                        }`}>
                          <svg className={`w-6 h-6 ${preferences.showUpcomingMilestones ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-navy-900 text-lg mb-1">Upcoming Milestones</h3>
                          <p className="text-sm text-slate-600">Show milestones due in the next 7 days</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePreference('showUpcomingMilestones')}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          preferences.showUpcomingMilestones 
                            ? 'bg-yellow-500 focus:ring-yellow-500' 
                            : 'bg-gray-300 focus:ring-gray-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                            preferences.showUpcomingMilestones ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Project Status Overview */}
                    <div className={`group relative flex items-center justify-between p-5 rounded-lg border-2 transition-all duration-200 ${
                      preferences.showProjectStatus 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                          preferences.showProjectStatus 
                            ? 'bg-blue-500' 
                            : 'bg-gray-100'
                        }`}>
                          <svg className={`w-6 h-6 ${preferences.showProjectStatus ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-navy-900 text-lg mb-1">Project Status Overview</h3>
                          <p className="text-sm text-slate-600">Show breakdown of projects by status</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePreference('showProjectStatus')}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          preferences.showProjectStatus 
                            ? 'bg-blue-500 focus:ring-blue-500' 
                            : 'bg-gray-300 focus:ring-gray-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                            preferences.showProjectStatus ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Recent Invoices */}
                    <div className={`group relative flex items-center justify-between p-5 rounded-lg border-2 transition-all duration-200 ${
                      preferences.showRecentInvoices 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                          preferences.showRecentInvoices 
                            ? 'bg-green-500' 
                            : 'bg-gray-100'
                        }`}>
                          <svg className={`w-6 h-6 ${preferences.showRecentInvoices ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-navy-900 text-lg mb-1">Recent Invoices</h3>
                          <p className="text-sm text-slate-600">Show the 5 most recent invoices</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePreference('showRecentInvoices')}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          preferences.showRecentInvoices 
                            ? 'bg-green-500 focus:ring-green-500' 
                            : 'bg-gray-300 focus:ring-gray-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                            preferences.showRecentInvoices ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Recent Clients */}
                    <div className={`group relative flex items-center justify-between p-5 rounded-lg border-2 transition-all duration-200 ${
                      preferences.showRecentClients 
                        ? 'bg-purple-50 border-purple-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                          preferences.showRecentClients 
                            ? 'bg-purple-500' 
                            : 'bg-gray-100'
                        }`}>
                          <svg className={`w-6 h-6 ${preferences.showRecentClients ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-navy-900 text-lg mb-1">Recent Clients</h3>
                          <p className="text-sm text-slate-600">Show the 5 most recently added clients</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePreference('showRecentClients')}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          preferences.showRecentClients 
                            ? 'bg-purple-500 focus:ring-purple-500' 
                            : 'bg-gray-300 focus:ring-gray-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                            preferences.showRecentClients ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Recent Activity */}
                    <div className={`group relative flex items-center justify-between p-5 rounded-lg border-2 transition-all duration-200 ${
                      preferences.showRecentActivity 
                        ? 'bg-orange-50 border-orange-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                          preferences.showRecentActivity 
                            ? 'bg-orange-500' 
                            : 'bg-gray-100'
                        }`}>
                          <svg className={`w-6 h-6 ${preferences.showRecentActivity ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-navy-900 text-lg mb-1">Recent Activity</h3>
                          <p className="text-sm text-slate-600">Show recent system activities and updates</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePreference('showRecentActivity')}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          preferences.showRecentActivity 
                            ? 'bg-orange-500 focus:ring-orange-500' 
                            : 'bg-gray-300 focus:ring-gray-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                            preferences.showRecentActivity ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Changes will be saved to your profile
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowCustomizeModal(false)}
                      className="px-6 py-2.5 text-slate-700 font-semibold hover:bg-white border border-gray-300 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      disabled={savingPreferences}
                      className="px-6 py-2.5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingPreferences ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
    </div>
  );
}

