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
  const [systemHealth, setSystemHealth] = useState({ database: 'healthy', storage: 'healthy', email: 'healthy' });
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
    const { data: actData } = await (supabase as any).from('activities').select('*').order('created_at', { ascending: false }).limit(10);
    if (actData) setRecentActivity(actData);

    setLoading(false);
  };

  const checkSystemHealth = async () => {
    try {
      await (supabase as any).from('clients').select('id').limit(1);
      await supabase.storage.listBuckets();
      setSystemHealth({ database: 'healthy', storage: 'healthy', email: 'healthy' });
    } catch {
      setSystemHealth({ database: 'error', storage: 'error', email: 'healthy' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Command Center</h1>
        <p className="text-xl text-slate-700">Your mission control for IE Global operations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Link href="/dashboard/clients" className="bg-white p-6 border-l-4 border-signal-red hover:shadow-lg transition-shadow duration-200">
          <p className="text-sm text-slate-700 mb-2">Active Clients</p>
          <p className="text-4xl font-bold text-navy-900">{stats.activeClients}</p>
        </Link>
        
        <div className="bg-white p-6 border-l-4 border-blue-500">
          <p className="text-sm text-slate-700 mb-2">Active Projects</p>
          <p className="text-4xl font-bold text-navy-900">{stats.activeProjects}</p>
        </div>
        
        <div className="bg-white p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-slate-700 mb-2">Pending Invoices</p>
          <p className="text-4xl font-bold text-navy-900">{stats.pendingInvoices}</p>
        </div>
        
        <div className="bg-white p-6 border-l-4 border-green-500">
          <p className="text-sm text-slate-700 mb-2">This Month</p>
          <p className="text-3xl font-bold text-navy-900">€{stats.thisMonthRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 border-l-4 border-purple-500">
          <p className="text-sm text-slate-700 mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-navy-900">€{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Tools & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Access Tools */}
          <div className="bg-white p-8 border-l-4 border-signal-red">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Supabase', url: 'https://supabase.com/dashboard', color: 'green' },
                { name: 'Resend', url: 'https://resend.com/emails', color: 'blue' },
                { name: 'Vercel', url: 'https://vercel.com/dashboard', color: 'purple' },
                { name: 'GitHub', url: 'https://github.com/cxspectre/ieglobal', color: 'gray' },
                { name: 'Website', url: 'https://ie-global.net', color: 'red' },
                { name: 'Portal', url: '/portal', color: 'yellow' },
              ].map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  className={`p-4 bg-off-white hover:bg-${tool.color}-50 border-l-4 border-${tool.color}-500 transition-all duration-200 group`}
                >
                  <p className="font-bold text-navy-900 text-sm">{tool.name}</p>
                  <p className="text-xs text-slate-600 group-hover:text-${tool.color}-700">Open →</p>
                </a>
              ))}
            </div>
          </div>

          {/* One-Click Actions */}
          <div className="bg-white p-8 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/clients/new" className="p-4 bg-signal-red text-white hover:bg-signal-red/90 transition-colors duration-200 group">
                <p className="font-bold mb-1">+ New Client</p>
                <p className="text-sm text-white/80">Add client & project</p>
              </Link>
              
              <Link href="/dashboard/settings" className="p-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 group">
                <p className="font-bold mb-1">+ New Team Member</p>
                <p className="text-sm text-white/80">Invite employee</p>
              </Link>
              
              <Link href="/dashboard/clients" className="p-4 bg-off-white hover:bg-gray-100 border border-gray-200 transition-colors duration-200 group">
                <p className="font-bold text-navy-900 mb-1">View All Clients</p>
                <p className="text-sm text-slate-600">Manage accounts →</p>
              </Link>
              
              <Link href="/" className="p-4 bg-off-white hover:bg-gray-100 border border-gray-200 transition-colors duration-200 group">
                <p className="font-bold text-navy-900 mb-1">View Website</p>
                <p className="text-sm text-slate-600">ie-global.net →</p>
              </Link>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white p-8 border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-slate-700">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 8).map((activity) => (
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

        {/* Right Column - Status & Team */}
        <div className="space-y-8">
          {/* System Status */}
          <div className="bg-white p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-bold text-navy-900 mb-4">System Status</h3>
            <div className="space-y-3">
              {[
                { name: 'Database', status: systemHealth.database },
                { name: 'Storage', status: systemHealth.storage },
                { name: 'Email', status: systemHealth.email },
              ].map((system) => (
                <div key={system.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{system.name}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      system.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-xs font-semibold text-slate-600 capitalize">{system.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Directory */}
          <div className="bg-white p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900">Team ({employees.length})</h3>
              <Link href="/dashboard/settings" className="text-sm font-semibold text-signal-red hover:underline">
                Manage →
              </Link>
            </div>
            <div className="space-y-3">
              {employees.slice(0, 5).map((emp) => (
                <div key={emp.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">{emp.full_name}</p>
                    <p className="text-xs text-slate-600">{emp.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold ${
                    emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {emp.role.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Company Info Quick Reference */}
          <div className="bg-white p-6 border-l-4 border-navy-900">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Company Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-600">KvK</p>
                <p className="font-mono font-semibold text-navy-900">97185515</p>
              </div>
              <div>
                <p className="text-slate-600">VAT</p>
                <p className="font-mono font-semibold text-navy-900">NL737599054B02</p>
              </div>
              <div>
                <p className="text-slate-600">Email</p>
                <a href="mailto:hello@ie-global.net" className="font-semibold text-signal-red hover:underline">
                  hello@ie-global.net
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

