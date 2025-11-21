'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Stats = {
  activeClients: number;
  activeProjects: number;
  pendingInvoices: number;
  totalRevenue: number;
  thisMonthRevenue: number;
};

type Employee = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
};

type Activity = {
  id: string;
  description: string;
  created_at: string;
  action_type: string;
};

export default function CommandCenterPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ activeClients: 0, activeProjects: 0, pendingInvoices: 0, totalRevenue: 0, thisMonthRevenue: 0 });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [systemHealth, setSystemHealth] = useState({ database: 'healthy', storage: 'healthy', auth: 'healthy' });
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
    checkSystemHealth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data: profile } = await (supabase as any).from('profiles').select('role').eq('id', session.user.id).single();
    if (profile?.role !== 'admin' && profile?.role !== 'employee') {
      router.push('/portal');
    }
  };

  const loadDashboardData = async () => {
    // Stats
    const { count: clientsCount } = await (supabase as any).from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: projectsCount } = await (supabase as any).from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress');
    const { count: pendingCount } = await (supabase as any).from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    
    const { data: paidInvoices } = await (supabase as any).from('invoices').select('amount').eq('status', 'paid');
    const totalRevenue = paidInvoices?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const { data: monthInvoices } = await (supabase as any).from('invoices').select('amount').eq('status', 'paid').gte('paid_date', startOfMonth.toISOString().split('T')[0]);
    const thisMonthRevenue = monthInvoices?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;

    setStats({ activeClients: clientsCount || 0, activeProjects: projectsCount || 0, pendingInvoices: pendingCount || 0, totalRevenue, thisMonthRevenue });

    // Employees
    const { data: empData } = await (supabase as any).from('profiles').select('*').in('role', ['admin', 'employee']).order('created_at', { ascending: false });
    if (empData) setEmployees(empData);

    // Activity
    const { data: actData } = await (supabase as any).from('activities').select('*').order('created_at', { ascending: false }).limit(15);
    if (actData) setRecentActivity(actData);

    setLoading(false);
  };

  const checkSystemHealth = async () => {
    const health = { database: 'healthy', storage: 'healthy', auth: 'healthy' };
    
    try {
      await (supabase as any).from('clients').select('id').limit(1);
    } catch {
      health.database = 'error';
    }
    
    try {
      await supabase.storage.listBuckets();
    } catch {
      health.storage = 'error';
    }

    setSystemHealth(health);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Floating Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Command Center</h1>
              <p className="text-sm text-slate-600">System overview & operations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-12">
        {/* System Health Alert */}
        <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 p-1 rounded-2xl mb-10 shadow-lg">
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-navy-900 mb-1">All Systems Operational</h2>
                <p className="text-sm text-slate-600">Last checked: {new Date().toLocaleTimeString()}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { name: 'Database', status: systemHealth.database },
                  { name: 'Storage', status: systemHealth.storage },
                  { name: 'Auth', status: systemHealth.auth },
                ].map((system) => (
                  <div key={system.name} className="px-4 py-2 bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                      system.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`} />
                    <p className="text-xs font-medium text-slate-700">{system.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <Link href="/dashboard/clients" className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-signal-red to-pink-600 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-navy-900 mb-1">{stats.activeClients}</p>
            <p className="text-xs text-slate-600">Active Clients</p>
          </Link>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-navy-900 mb-1">{stats.activeProjects}</p>
            <p className="text-xs text-slate-600">Active Projects</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-navy-900 mb-1">{stats.pendingInvoices}</p>
            <p className="text-xs text-slate-600">Pending Invoices</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mb-1">€{stats.thisMonthRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-600">This Month</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-navy-900 mb-1">€{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-600">Total Revenue</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & External Tools */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions Grid */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/clients/new" className="group p-6 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold mb-1">New Client</p>
                  <p className="text-sm text-white/80">Add client & start project</p>
                </Link>

                <Link href="/dashboard/settings" className="group p-6 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold mb-1">Add Team Member</p>
                  <p className="text-sm text-white/80">Invite employee</p>
                </Link>

                <Link href="/dashboard/clients" className="group p-6 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold mb-1">Browse Clients</p>
                  <p className="text-sm text-white/80">View all accounts</p>
                </Link>

                <Link href="/" target="_blank" className="group p-6 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold mb-1">View Website</p>
                  <p className="text-sm text-white/80">ie-global.net</p>
                </Link>
              </div>
            </div>

            {/* External Platform Links */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">Platform Links</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Supabase', url: 'https://supabase.com/dashboard', icon: '🗄️', color: 'from-green-500 to-emerald-600' },
                  { name: 'Vercel', url: 'https://vercel.com/dashboard', icon: '▲', color: 'from-slate-900 to-gray-900' },
                  { name: 'GitHub', url: 'https://github.com/cxspectre/ieglobal', icon: '💻', color: 'from-purple-600 to-indigo-700' },
                  { name: 'Resend', url: 'https://resend.com/emails', icon: '📧', color: 'from-blue-500 to-cyan-600' },
                  { name: 'Analytics', url: 'https://vercel.com/analytics', icon: '📊', color: 'from-pink-500 to-rose-600' },
                  { name: 'Portal', url: '/portal', icon: '🔐', color: 'from-orange-500 to-amber-600' },
                ].map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target={platform.url.startsWith('http') ? '_blank' : undefined}
                    className="group p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100 hover:from-slate-100 hover:to-gray-200 border border-gray-200 transition-all duration-200"
                  >
                    <div className={`text-3xl mb-2`}>{platform.icon}</div>
                    <p className="font-bold text-navy-900 text-sm mb-1">{platform.name}</p>
                    <p className="text-xs text-slate-600 group-hover:text-signal-red transition-colors duration-200">
                      Open →
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">System Activity</h2>
              {recentActivity.length === 0 ? (
                <p className="text-slate-700 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.action_type === 'client_created' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                          activity.action_type === 'invoice_created' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                          activity.action_type === 'project_created' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                          'bg-gradient-to-br from-purple-500 to-indigo-600'
                        }`}>
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        {index < recentActivity.length - 1 && (
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-slate-300 to-transparent" />
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

          {/* Right Column - Team & Info */}
          <div className="space-y-8">
            {/* Team Directory */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-navy-900">Team</h3>
                <Link href="/dashboard/settings" className="text-sm font-semibold text-signal-red hover:underline">
                  Manage →
                </Link>
              </div>
              {employees.length === 0 ? (
                <p className="text-slate-600 text-center py-8 text-sm">No team members</p>
              ) : (
                <div className="space-y-3">
                  {employees.map((emp) => (
                    <div key={emp.id} className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-navy-900 text-sm mb-1">{emp.full_name}</p>
                          <p className="text-xs text-slate-600">{emp.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          emp.role === 'admin' 
                            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                            : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                        }`}>
                          {emp.role.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${emp.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-xs text-slate-500">{emp.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-navy-900 mb-6">Company Details</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Legal Name</p>
                  <p className="font-bold text-navy-900">IE Global</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                  <p className="text-xs font-semibold text-slate-600 mb-1">KvK Number</p>
                  <p className="font-mono font-bold text-navy-900">97185515</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                  <p className="text-xs font-semibold text-slate-600 mb-1">VAT Number</p>
                  <p className="font-mono font-bold text-navy-900">NL737599054B02</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Contact Email</p>
                  <a href="mailto:hello@ie-global.net" className="font-semibold text-signal-red hover:underline">
                    hello@ie-global.net
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Shortcuts */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-navy-900 mb-4">Navigate To</h3>
              <div className="space-y-2">
                {[
                  { name: 'Dashboard Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                  { name: 'All Clients', href: '/dashboard/clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                  { name: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-100 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-signal-red transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                      </svg>
                      <span className="font-medium text-navy-900 group-hover:text-signal-red transition-colors duration-200">
                        {link.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
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
