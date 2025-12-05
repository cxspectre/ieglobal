'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Stats = {
  activeClients: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingInvoices: number;
  totalRevenue: number;
  thisMonthRevenue: number;
};

type Employee = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

type Activity = {
  id: string;
  description: string;
  created_at: string;
  action_type: string;
};

export default function CommandCenterPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    activeClients: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [systemHealth, setSystemHealth] = useState({ database: 'healthy', storage: 'healthy' });
  
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadCommandCenter();
  }, []);

  const loadCommandCenter = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profile?.role !== 'admin' && profile?.role !== 'employee') {
      router.push('/portal');
      return;
    }

    // Load stats
    const [
      clientsResult,
      totalProjectsResult,
      activeProjectsResult,
      completedProjectsResult,
      pendingInvoicesResult,
      paidInvoicesResult,
      monthInvoicesResult
    ] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('invoices').select('amount').eq('status', 'paid'),
      supabase.from('invoices').select('amount').eq('status', 'paid').gte('paid_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
    ]);

    const totalRevenue = paidInvoicesResult.data?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;
    const thisMonthRevenue = monthInvoicesResult.data?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;

    setStats({
      activeClients: clientsResult.count || 0,
      totalProjects: totalProjectsResult.count || 0,
      activeProjects: activeProjectsResult.count || 0,
      completedProjects: completedProjectsResult.count || 0,
      pendingInvoices: pendingInvoicesResult.count || 0,
      totalRevenue,
      thisMonthRevenue,
    });

    // Load employees
    const { data: empData } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .in('role', ['admin', 'employee'])
      .order('full_name', { ascending: true });
    
    if (empData) setEmployees(empData);

    // Load activity
    const { data: actData } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);
    
    if (actData) setRecentActivity(actData);

    // Check system health
    try {
      await supabase.from('clients').select('id').limit(1);
      await supabase.storage.listBuckets();
      setSystemHealth({ database: 'healthy', storage: 'healthy' });
    } catch {
      setSystemHealth({ database: 'error', storage: 'error' });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-navy-900 mb-1">Command Center</h1>
            <p className="text-lg text-slate-700">Admin tools & system overview</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              systemHealth.database === 'healthy' && systemHealth.storage === 'healthy'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                systemHealth.database === 'healthy' && systemHealth.storage === 'healthy'
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-red-500'
              }`}></div>
              <span className={`text-xs font-semibold ${
                systemHealth.database === 'healthy' && systemHealth.storage === 'healthy'
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}>
                {systemHealth.database === 'healthy' && systemHealth.storage === 'healthy'
                  ? 'All Systems Operational'
                  : 'System Issues'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Business Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2">Active Clients</p>
          <p className="text-3xl font-bold text-navy-900">{stats.activeClients}</p>
      </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2">Total Projects</p>
          <p className="text-3xl font-bold text-navy-900">{stats.totalProjects}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2">In Progress</p>
          <p className="text-3xl font-bold text-blue-600">{stats.activeProjects}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completedProjects}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2">This Month</p>
          <p className="text-2xl font-bold text-navy-900">€{stats.thisMonthRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">€{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-navy-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/clients/onboard"
                className="p-5 bg-gradient-to-br from-signal-red to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 group text-center"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-bold text-sm">Onboard Client</p>
              </Link>

              <Link
                href="/dashboard/clients/new"
                className="p-5 bg-off-white hover:bg-gray-50 border-2 border-gray-200 hover:border-signal-red rounded-lg transition-all duration-200 group text-center"
              >
                <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-signal-red transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="font-bold text-sm text-navy-900">Add Client</p>
              </Link>

              <Link
                href="/dashboard/settings"
                className="p-5 bg-off-white hover:bg-gray-50 border-2 border-gray-200 hover:border-signal-red rounded-lg transition-all duration-200 group text-center"
              >
                <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-signal-red transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <p className="font-bold text-sm text-navy-900">Add Team</p>
              </Link>
            </div>
          </motion.div>

          {/* External Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-navy-900 mb-6">External Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Supabase', url: 'https://supabase.com/dashboard', icon: '🗄️', color: 'emerald' },
                { name: 'Resend', url: 'https://resend.com/emails', icon: '📧', color: 'blue' },
                { name: 'Vercel', url: 'https://vercel.com/dashboard', icon: '▲', color: 'slate' },
                { name: 'GitHub', url: 'https://github.com', icon: '⚡', color: 'gray' },
                { name: 'Website', url: 'https://ie-global.net', icon: '🌐', color: 'red' },
                { name: 'Analytics', url: 'https://vercel.com/analytics', icon: '📊', color: 'purple' },
              ].map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-off-white hover:bg-gray-50 border border-gray-200 hover:border-signal-red rounded-lg transition-all duration-200 group"
                >
                  <div className="text-2xl mb-2">{tool.icon}</div>
                  <p className="font-semibold text-navy-900 text-sm">{tool.name}</p>
                  <p className="text-xs text-slate-600 group-hover:text-signal-red transition-colors">Open →</p>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-navy-900 mb-6">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className="w-2 h-2 bg-signal-red rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{activity.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(activity.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-navy-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-off-white rounded-lg">
                <span className="text-sm font-medium text-navy-900">Database</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                    systemHealth.database === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-xs font-semibold ${
                    systemHealth.database === 'healthy' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {systemHealth.database === 'healthy' ? 'Healthy' : 'Error'}
                  </span>
                </div>
                  </div>
              
              <div className="flex items-center justify-between p-3 bg-off-white rounded-lg">
                <span className="text-sm font-medium text-navy-900">Storage</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    systemHealth.storage === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-xs font-semibold ${
                    systemHealth.storage === 'healthy' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {systemHealth.storage === 'healthy' ? 'Healthy' : 'Error'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Team Directory */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900">Team</h3>
              <Link
                href="/dashboard/settings"
                className="text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors"
              >
                Manage →
              </Link>
            </div>
            <div className="space-y-2">
              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-off-white rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-navy-900 to-navy-800 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {emp.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900 truncate">{emp.full_name}</p>
                    <p className="text-xs text-slate-600 truncate">{emp.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    emp.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {emp.role === 'admin' ? 'ADMIN' : 'TEAM'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-lg shadow-lg p-6 text-white"
          >
            <h3 className="text-lg font-bold mb-4">IE Global</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-white/70 text-xs mb-1">KvK Number</p>
                <p className="font-mono font-semibold">97185515</p>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">VAT Number</p>
                <p className="font-mono font-semibold">NL737599054B02</p>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Contact</p>
                <a href="mailto:hello@ie-global.net" className="font-semibold hover:text-signal-red transition-colors">
                  hello@ie-global.net
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
